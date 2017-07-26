const child_process = require("child_process");
const path = require("path");
const copy = require("copy");

const clientPath = path.resolve(__dirname, "../client");
const releasePath = path.resolve(__dirname, "../release");
const serverPath = path.resolve(__dirname, "../server");

let res = child_process.spawnSync("cmd", ["/C", "webpack"], {
  cwd: clientPath,
  stdio: "inherit"
});

if (res.code) {
  console.error("Failed to build client")
  process.exit(res.code);
}

copy(`${path.join(clientPath, "dist")}/**`, path.join(releasePath, "client"), (err, files) => {});
copy(`${path.join(clientPath,"*.html")}`, path.join(releasePath, "client"), (err, files) => {});
copy(`${path.join(clientPath,"package.json")}`, path.join(releasePath, "client/.."), (err, files) => {});


res = child_process.spawnSync("cmd", ["/C", "tsc"], {
  cwd: serverPath,
  stdio: "inherit"
});

if (res.code) {
  console.error("Failed to build server")
  process.exit(res.code);
}

copy(`${path.join(serverPath, "dist")}/**`, path.join(releasePath, "server"), (err, files) => {});
copy(`${path.join(serverPath, "src/migrations/**")}`, path.join(releasePath, "server/migrations"), (err, files) => {});
copy(`${path.join(serverPath, "package.json")}`, path.join(releasePath, "server/.."), (err, files) => {});
copy(`${path.resolve(__dirname, "../clientSecret.json")}`, path.join(releasePath, "server/secrets"), (err, files) => { if(err) {console.error(err);}});
