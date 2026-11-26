import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const root = process.argv[2];
const types = { ".js": "text/javascript", ".html": "text/html", ".png": "image/png", ".webp": "image/webp", ".ttf": "font/ttf", ".json": "application/json", ".ico": "image/x-icon" };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  let f = path.join(root, p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(root, "index.html");
  res.writeHead(200, { "content-type": types[path.extname(f)] ?? "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
}).listen(8090);
