import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.PORT ?? 3000);
const host = "0.0.0.0";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientRoot = path.resolve(__dirname, "../dist/client");

const mimeTypes = new Map([
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

function buildRequestUrl(request) {
  const hostHeader = request.headers.host ?? `${host}:${port}`;
  return new URL(request.url ?? "/", `http://${hostHeader}`);
}

function buildHeaders(request) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }
  return headers;
}

async function nodeRequestToWebRequest(request) {
  const url = buildRequestUrl(request);
  const headers = buildHeaders(request);
  const method = request.method ?? "GET";

  if (method === "GET" || method === "HEAD") {
    return new Request(url, { method, headers });
  }

  return new Request(url, {
    method,
    headers,
    body: request,
    duplex: "half",
  });
}

function getContentType(filePath) {
  return mimeTypes.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream";
}

async function tryServeStaticAsset(requestPath, response) {
  if (!requestPath.startsWith("/assets/")) {
    return false;
  }

  const filePath = path.resolve(clientRoot, `.${requestPath}`);
  if (!filePath.startsWith(clientRoot)) {
    return false;
  }

  try {
    const entry = await stat(filePath);
    if (!entry.isFile()) {
      return false;
    }

    const body = await readFile(filePath);
    response.writeHead(200, {
      "content-type": getContentType(filePath),
      "cache-control": "public, max-age=31536000, immutable",
    });
    response.end(body);
    return true;
  } catch {
    return false;
  }
}

function writeWebResponseToNode(response, nodeResponse) {
  nodeResponse.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  if (!response.body) {
    nodeResponse.end();
    return;
  }
  const reader = response.body.getReader();
  const pump = async () => {
    const { done, value } = await reader.read();
    if (done) {
      nodeResponse.end();
      return;
    }
    nodeResponse.write(Buffer.from(value));
    await pump();
  };
  pump().catch((error) => {
    console.error(error);
    if (!nodeResponse.headersSent) {
      nodeResponse.statusCode = 500;
    }
    nodeResponse.end("Internal Server Error");
  });
}

const workerModule = await import("../dist/server/index.js");
const worker = workerModule.default;

const server = createServer(async (request, response) => {
  try {
    if (!request.url) {
      response.statusCode = 400;
      response.end("Bad Request");
      return;
    }

    const url = buildRequestUrl(request);
    if (url.pathname === "/health") {
      response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
      response.end("ok");
      return;
    }

    if (await tryServeStaticAsset(url.pathname, response)) {
      return;
    }

    const webRequest = await nodeRequestToWebRequest(request);
    const webResponse = await worker.fetch(webRequest, {}, {});
    writeWebResponseToNode(webResponse, response);
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end("Internal Server Error");
  }
});

server.listen(port, host, () => {
  console.log(`Worker adapter listening on http://${host}:${port}`);
});