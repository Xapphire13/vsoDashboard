const child_process = require("child_process");
const path = require("path");

const releasePath = path.resolve(__dirname, "../release");
const clientPath = path.join(releasePath, "client");
const serverPath = path.join(releasePath, "server");

let res = child_process.spawnSync("cmd", ["/C", "npm install"], {
  cwd: clientPath,
  stdio: "inherit"
});

res = child_process.spawnSync("cmd", ["/C", "npm install"], {
  cwd: serverPath,
  stdio: "inherit"
});

child_process.spawnSync("cmd", ["/C", "node ./server/app.js"], {
  cwd: releasePath,
  stdio: "inherit"
});
