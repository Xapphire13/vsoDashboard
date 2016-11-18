/// <reference path="../typings/index.d.ts"/>

import * as express from "express";

let port = 8080;
let app = express();

// Static files
app.use(express.static("client"));
app.use("/bower_components", express.static("bower_components"));

// Start server
app.listen(port, () => {
  console.log("Listening on port " + port);
});
