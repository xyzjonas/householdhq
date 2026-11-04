// Production entrypoint (wraps the adapter-node handler).
//
// adapter-node 6 derives the request origin from the request and assumes
// `https` unless a header names the scheme, which makes SvelteKit's CSRF check
// reject every form POST on plain http (e.g. http://localhost:8080).
// Behind a TLS-terminating proxy that sends `x-forwarded-proto` nothing changes;
// without one we assume `http`. Override with PUBLIC_SCHEME=https if needed.
import { createServer } from "node:http";

process.env.PROTOCOL_HEADER ||= "x-forwarded-proto";
const scheme = process.env.PUBLIC_SCHEME ?? "http";

const { handler } = await import("./build/handler.js");

const server = createServer((req, res) => {
  req.headers["x-forwarded-proto"] ??= scheme;
  handler(req, res, () => {
    res.statusCode = 404;
    res.end();
  });
});

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";
server.listen(port, host, () =>
  console.log(`Listening on http://${host}:${port}`),
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    server.closeIdleConnections();
  });
}
