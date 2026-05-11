import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import axios from "axios";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
const BUCKET_NAME = "character-images";
const STORAGE_FOLDER = "characters";
const STATE_FILE = join(process.cwd(), ".cache", "character-image-import.json");
const JIKAN_BASE_URL = "https://api.jikan.moe/v4";
const DEFAULT_IMAGE_SIZE = { width: 400, height: 600 };
const DEFAULT_WEBP_QUALITY = 82;
const MIN_JIKAN_DELAY_MS = 1200;
function log(message, ...details) {
    console.log(`[character-images] ${message}`, ...details);
}
function warn(message, ...details) {
    console.warn(`[character-images] ${message}`, ...details);
}
function error(message, ...details) {
    console.error(`[character-images] ${message}`, ...details);
}
function nowIso() {
    return new Date().toISOString();
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function normalizeText(input) {
    return input
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/gi, "")
        .toLowerCase();
}
function unique(values) {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
async function loadEnvFile(filePath) {
    try {
        const raw = await readFile(filePath, "utf8");
        for (const line of raw.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#"))
                continue;
            const separatorIndex = trimmed.indexOf("=");
            if (separatorIndex === -1)
                continue;
            const key = trimmed.slice(0, separatorIndex).trim();
            let value = trimmed.slice(separatorIndex + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            if (!process.env[key] && value) {
                process.env[key] = value;
            }
        }
    }
    catch {
        // Ignore missing env files and rely on the current process environment.
    }
}
async function loadEnvironment() {
    await loadEnvFile(join(process.cwd(), ".env.local"));
    await loadEnvFile(join(process.cwd(), ".env"));
}
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
function parseArgs(argv) {
    const options = {
        force: false,
        dryRun: false,
        limit: null,
    };
    for (const argument of argv) {
        if (argument === "--force") {
            options.force = true;
            continue;
        }
        if (argument === "--dry-run") {
            options.dryRun = true;
            continue;
        }
        if (argument.startsWith("--limit=")) {
            const rawLimit = Number(argument.slice("--limit=".length));
            if (Number.isFinite(rawLimit) && rawLimit > 0) {
                options.limit = Math.floor(rawLimit);
            }
        }
    }
    return options;
}
async function loadState() {
    try {
        const raw = await readFile(STATE_FILE, "utf8");
        const parsed = JSON.parse(raw);
        return {
            version: 1,
            updatedAt: parsed.updatedAt ?? nowIso(),
            items: parsed.items ?? {},
        };
    }
    catch {
        return {
            version: 1,
            updatedAt: nowIso(),
            items: {},
        };
    }
}
async function saveState(state) {
    await mkdir(dirname(STATE_FILE), { recursive: true });
    const tempPath = `${STATE_FILE}.tmp`;
    const payload = JSON.stringify(state, null, 2);
    await writeFile(tempPath, payload, "utf8");
    await rename(tempPath, STATE_FILE);
}
function updateStateItem(state, character, patch) {
    const next = {
        status: patch.status ?? state.items[character.id]?.status ?? "pending",
        name: character.name,
        query: patch.query ?? state.items[character.id]?.query,
        sourceImageUrl: patch.sourceImageUrl ?? state.items[character.id]?.sourceImageUrl,
        storagePath: patch.storagePath ?? state.items[character.id]?.storagePath,
        publicUrl: patch.publicUrl ?? state.items[character.id]?.publicUrl,
        error: patch.error ?? state.items[character.id]?.error,
        updatedAt: nowIso(),
    };
    state.items[character.id] = next;
    state.updatedAt = next.updatedAt;
    return next;
}
function storagePathForCharacter(characterId) {
    return `${STORAGE_FOLDER}/${characterId}.webp`;
}
function asPublicUrl(supabaseUrl, bucketName, storagePath) {
    const normalizedBase = supabaseUrl.replace(/\/$/, "");
    return `${normalizedBase}/storage/v1/object/public/${bucketName}/${storagePath}`;
}
function isPublicBucketUrl(url, bucketName) {
    return url.includes(`/storage/v1/object/public/${bucketName}/`);
}
function extractBucketPath(url, bucketName) {
    const marker = `/storage/v1/object/public/${bucketName}/`;
    const index = url.indexOf(marker);
    if (index === -1)
        return null;
    return decodeURIComponent(url.slice(index + marker.length));
}
function candidateQueries(character) {
    const aliases = Array.isArray(character.aliases) ? character.aliases : [];
    return unique([character.name, ...aliases]);
}
function scoreCandidate(query, candidate) {
    const normalizedQuery = normalizeText(query);
    const names = [candidate.name, candidate.name_kanji ?? "", ...(candidate.nicknames ?? [])]
        .filter(Boolean)
        .map(normalizeText);
    if (names.some((name) => name === normalizedQuery))
        return 100;
    if (names.some((name) => name.startsWith(normalizedQuery) || normalizedQuery.startsWith(name))) {
        return 85;
    }
    if (names.some((name) => name.includes(normalizedQuery) || normalizedQuery.includes(name))) {
        return 70;
    }
    return 0;
}
function pickBestCandidate(query, candidates) {
    let best = null;
    let bestScore = 0;
    for (const candidate of candidates) {
        const score = scoreCandidate(query, candidate) + Math.min((candidate.favorites ?? 0) / 1000, 10);
        if (score > bestScore) {
            bestScore = score;
            best = candidate;
        }
    }
    return bestScore > 0 ? best : null;
}
async function searchImageForCharacter(character) {
    const queries = candidateQueries(character);
    for (const query of queries) {
        const encodedQuery = encodeURIComponent(query);
        for (let attempt = 1; attempt <= 3; attempt += 1) {
            try {
                const response = await axios.get(`${JIKAN_BASE_URL}/characters`, {
                    params: { q: query, limit: 5 },
                    timeout: 20000,
                    headers: {
                        "User-Agent": "MHAdle character image importer/1.0",
                        Accept: "application/json",
                    },
                });
                const best = pickBestCandidate(query, response.data.data ?? []);
                const imageUrl = best?.images?.jpg?.image_url ?? best?.images?.webp?.image_url ?? null;
                if (best && imageUrl) {
                    return {
                        query,
                        sourceImageUrl: imageUrl,
                        matchedName: best.name,
                    };
                }
                break;
            }
            catch (err) {
                const axiosError = axios.isAxiosError(err) ? err : null;
                const statusCode = axiosError?.response?.status;
                const retryable = statusCode === 429 || statusCode === 503 || statusCode === undefined;
                if (retryable && attempt < 3) {
                    const delay = 800 * attempt;
                    warn(`Jikan rate-limited or unstable for ${character.name} (${query}); retrying in ${delay}ms`);
                    await sleep(delay);
                    continue;
                }
                warn(`No valid Jikan result for ${character.name} using query "${query}"`);
                break;
            }
        }
    }
    return null;
}
async function downloadImage(imageUrl) {
    const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 30000,
        headers: {
            "User-Agent": "MHAdle character image importer/1.0",
            Accept: "image/*,*/*",
        },
    });
    return Buffer.from(response.data);
}
async function optimizeImage(buffer) {
    return sharp(buffer)
        .rotate()
        .resize(DEFAULT_IMAGE_SIZE.width, DEFAULT_IMAGE_SIZE.height, {
        fit: "cover",
        position: "attention",
    })
        .webp({ quality: DEFAULT_WEBP_QUALITY, effort: 6 })
        .toBuffer();
}
async function ensureBucketPublic(bucketName, supabaseClient) {
    const { data: buckets, error } = await supabaseClient.storage.listBuckets();
    if (error)
        throw error;
    const bucket = buckets?.find((entry) => entry.name === bucketName);
    if (!bucket) {
        log(`Creating public bucket "${bucketName}"`);
        const { error: createError } = await supabaseClient.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 10 * 1024 * 1024,
        });
        if (createError)
            throw createError;
        return;
    }
    if (!bucket.public) {
        warn(`Bucket "${bucketName}" exists but is private. Updating it to public.`);
        const { error: updateError } = await supabaseClient.storage.updateBucket(bucketName, {
            public: true,
        });
        if (updateError) {
            warn(`Could not update bucket visibility automatically: ${updateError.message}`);
        }
    }
}
async function fetchActiveCharacters(supabaseClient, limit) {
    let query = supabaseClient
        .from("characters")
        .select("id, name, aliases, image_url, is_active")
        .eq("is_active", true)
        .order("name");
    if (limit && limit > 0) {
        query = query.limit(limit);
    }
    const { data, error } = await query;
    if (error)
        throw error;
    return (data ?? []);
}
async function updateCharacterImageUrl(supabaseClient, character, imageUrl) {
    const { error } = await supabaseClient
        .from("characters")
        .update({ image_url: imageUrl })
        .eq("id", character.id);
    if (error)
        throw error;
}
async function uploadCharacterImage(supabaseClient, storagePath, webpBuffer) {
    const { error } = await supabaseClient.storage
        .from(BUCKET_NAME)
        .upload(storagePath, webpBuffer, {
        contentType: "image/webp",
        upsert: false,
        cacheControl: "31536000",
    });
    if (!error)
        return;
    const message = error.message ?? "";
    if (message.toLowerCase().includes("already exists") || message.includes("409")) {
        warn(`Storage object already exists at ${storagePath}; reusing it.`);
        return;
    }
    throw error;
}
async function processCharacter(supabaseClient, state, character, options, supabaseUrl) {
    const storagePath = storagePathForCharacter(character.id);
    const publicUrl = asPublicUrl(supabaseUrl, BUCKET_NAME, storagePath);
    const existingState = state.items[character.id];
    if (!options.force) {
        if (character.image_url === publicUrl) {
            updateStateItem(state, character, {
                status: "completed",
                storagePath,
                publicUrl,
            });
            log(`Skipping ${character.name} because image_url already points to Storage`);
            return { status: "skipped" };
        }
        if (existingState?.status === "completed" && existingState.publicUrl === publicUrl) {
            log(`Skipping ${character.name} because it was already completed in a previous run`);
            return { status: "skipped" };
        }
        if (existingState?.status === "failed") {
            log(`Skipping ${character.name} because a previous run already marked it as failed`);
            return { status: "skipped" };
        }
        if (existingState?.status === "uploaded" && existingState.publicUrl) {
            log(`Resuming DB update for ${character.name} from uploaded state`);
            await updateCharacterImageUrl(supabaseClient, character, existingState.publicUrl);
            updateStateItem(state, character, {
                status: "completed",
                storagePath,
                publicUrl: existingState.publicUrl,
            });
            return { status: "completed" };
        }
    }
    log(`Searching image for ${character.name}`);
    updateStateItem(state, character, {
        status: "searching",
        storagePath,
        publicUrl,
    });
    await saveState(state);
    const match = await searchImageForCharacter(character);
    if (!match) {
        const message = "No valid image found";
        updateStateItem(state, character, {
            status: "failed",
            storagePath,
            publicUrl,
            error: message,
        });
        await saveState(state);
        warn(`${character.name}: ${message}`);
        return { status: "failed" };
    }
    updateStateItem(state, character, {
        status: "found",
        query: match.query,
        sourceImageUrl: match.sourceImageUrl,
        storagePath,
        publicUrl,
    });
    await saveState(state);
    log(`Downloading ${character.name} from ${match.matchedName} (${match.query})`);
    const downloaded = await downloadImage(match.sourceImageUrl);
    const optimized = await optimizeImage(downloaded);
    if (!options.dryRun) {
        await uploadCharacterImage(supabaseClient, storagePath, optimized);
    }
    updateStateItem(state, character, {
        status: "uploaded",
        query: match.query,
        sourceImageUrl: match.sourceImageUrl,
        storagePath,
        publicUrl,
    });
    await saveState(state);
    if (!options.dryRun) {
        await updateCharacterImageUrl(supabaseClient, character, publicUrl);
    }
    updateStateItem(state, character, {
        status: "completed",
        query: match.query,
        sourceImageUrl: match.sourceImageUrl,
        storagePath,
        publicUrl,
    });
    await saveState(state);
    log(`Completed ${character.name} -> ${publicUrl}`);
    return { status: "completed" };
}
function summarizeState(state) {
    const counts = {
        completed: 0,
        skipped: 0,
        failed: 0,
        uploaded: 0,
        found: 0,
        searching: 0,
        pending: 0,
    };
    for (const item of Object.values(state.items)) {
        counts[item.status] += 1;
    }
    return [
        `completed=${counts.completed}`,
        `skipped=${counts.skipped}`,
        `failed=${counts.failed}`,
        `uploaded=${counts.uploaded}`,
        `found=${counts.found}`,
        `searching=${counts.searching}`,
        `pending=${counts.pending}`,
    ].join(", ");
}
async function main() {
    await loadEnvironment();
    const supabaseUrl = requireEnv("SUPABASE_URL");
    const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    const options = parseArgs(process.argv.slice(2));
    const supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            storage: undefined,
            persistSession: false,
            autoRefreshToken: false,
        },
    });
    const state = await loadState();
    log("Starting character image pipeline");
    log(`Options: force=${options.force}, dryRun=${options.dryRun}, limit=${options.limit ?? "all"}`);
    log(`Resume state: ${STATE_FILE}`);
    await ensureBucketPublic(BUCKET_NAME, supabaseClient);
    const characters = await fetchActiveCharacters(supabaseClient, options.limit);
    log(`Loaded ${characters.length} active characters from Supabase`);
    let completed = 0;
    let skipped = 0;
    let failed = 0;
    for (let index = 0; index < characters.length; index += 1) {
        const character = characters[index];
        const progressLabel = `${index + 1}/${characters.length}`;
        try {
            const result = await processCharacter(supabaseClient, state, character, options, supabaseUrl);
            if (result.status === "completed")
                completed += 1;
            if (result.status === "skipped")
                skipped += 1;
            if (result.status === "failed")
                failed += 1;
        }
        catch (err) {
            failed += 1;
            const message = err instanceof Error ? err.message : String(err);
            updateStateItem(state, character, {
                status: "failed",
                error: message,
            });
            await saveState(state);
            error(`Failed ${progressLabel} ${character.name}: ${message}`);
            log("Saving state and continuing so the run can be resumed later.");
            continue;
        }
        if (index < characters.length - 1) {
            await sleep(MIN_JIKAN_DELAY_MS);
        }
    }
    log(`Finished. completed=${completed}, skipped=${skipped}, failed=${failed}`);
    log(`State summary: ${summarizeState(state)}`);
}
main().catch((err) => {
    const message = err instanceof Error ? err.stack ?? err.message : String(err);
    error(message);
    process.exitCode = 1;
});
