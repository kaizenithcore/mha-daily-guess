import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../dist/client");
const port = 3000;
const host = "0.0.0.0";

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
]);

function getContentType(filePath) {
  return mimeTypes.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream";
}

async function sendFile(response, filePath) {
  const body = await readFile(filePath);
  response.writeHead(200, {
    "content-type": getContentType(filePath),
    "cache-control": filePath.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable",
  });
  response.end(body);
}

async function resolveAsset(requestPath) {
  const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
  const candidatePaths = [
    path.join(rootDir, normalizedPath),
    path.join(rootDir, `${normalizedPath}.html`),
  ];

  for (const candidatePath of candidatePaths) {
    try {
      const entry = await stat(candidatePath);
      if (entry.isFile()) {
        return candidatePath;
      }
    } catch {
      // Ignore missing files and try the next candidate.
    }
  }

  return path.join(rootDir, "index.html");
}

const server = createServer(async (request, response) => {
  if (!request.url) {
    response.statusCode = 400;
    response.end("Bad Request");
    return;
  }

  try {
    const url = new URL(request.url, `http://${request.headers.host ?? `${host}:${port}`}`);

    if (url.pathname === "/health") {
      response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
      response.end("ok");
      return;
    }

    const assetPath = await resolveAsset(url.pathname);
    await sendFile(response, assetPath);
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end("Internal Server Error");
  }
});

server.listen(port, host, () => {
  console.log(`Static server listening on http://${host}:${port}`);
});
