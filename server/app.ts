/// <reference path="../typings/index.d.ts"/>

import * as express from "express";
import * as path from "path";
import {ServerOAuthHelper} from "./ServerOAuthHelper";
eval(require('fs').readFileSync('../shared/StringFormat.js', 'utf8'));

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
let clientSecret = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Im9PdmN6NU1fN3AtSGpJS2xGWHo5M3VfVjBabyJ9.eyJjaWQiOiIxNDM5ZmYyZC0yNmFiLTQwNDktYTU0My01YWZmNDg0OGVlYzgiLCJjc2kiOiI3Y2RhYmY0ZC1jOGM5LTRkYTYtOWNlMC1iOWIzZmM1Mzg0N2EiLCJuYW1laWQiOiIyNzkyYWI2MS1iMDQwLTRmODItYjM5NC0wZGY4ZjMwYzkxMDUiLCJpc3MiOiJhcHAudnNzcHMudmlzdWFsc3R1ZGlvLmNvbSIsImF1ZCI6ImFwcC52c3Nwcy52aXN1YWxzdHVkaW8uY29tIiwibmJmIjoxNDgwMzgxNDI4LCJleHAiOjE2MzgxNDc4Mjh9.GAMTR0tzBMWvXC2BNrp0RbPle7dX8QbSziu601xRMzXfg666kqN7fF5H5v5XZoKvlg7jKVPJFEQXhNvMLoElXQQn0FnzVGzt5pu1pmVsd9EFW-ao6W6r8rln0GEN83BNZLlNGWqK8lpB2WB-ikkGOsvJpJM2MQu22I9ZYKR2C0mjfs7dLvw7RdHM72RH-8HHYPBFkW17Yxa2lIjBLJrQBEnVe2SsIKv9w3duaOrnYZxgXZ_F2pb-NZrNYC7N3t3uuZ03Tzwx0qNI3n7zSRFxUv5VE2E9HWnzSK3wKLlMltv-GPrXYn9Dh6paqgHNDeJO8NDLVxSTW2vCXwSnmwDxNw";
let redirectUri = "http://vsodash.azurewebsites.net/auth";
let app = express();

app.set('port', process.env.PORT || 80);

// Static files
app.use(express.static(path.join(__dirname, "/../", "client")));
app.use("/libs", express.static(path.join(__dirname, "/../", "bower_components")));
app.use("/scripts", express.static(path.join(__dirname, "/../", "shared")));
app.use("/auth", express.static(path.join(__dirname, "/../", "client/auth.html")), () => {
  console.log("Auth redirect");
});

app.get("/token", (req, res) => {
  let oAuthHelper = new ServerOAuthHelper(clientSecret, redirectUri);

  let accessCode = req.query["accessCode"];
  let refreshToken = req.query["refreshToken"];

  if(accessCode != undefined && accessCode != "") {
    console.log("Getting Access Token");
    oAuthHelper.getAccessToken(accessCode).then(accessToken => {
      console.log("Got access token");
      res.setHeader("Content-Type", "application/json");
      res.send(accessToken);
    });
  } else if(refreshToken != undefined && refreshToken != "") {
    console.log("Refreshing Access Token");
    oAuthHelper.refreshAccessToken(refreshToken).then(accessToken => {
      console.log("Got access token");
      res.setHeader("Content-Type", "application/json");
      res.send(accessToken);
    });
  }
});

// Start server
let server = app.listen(app.get('port'), () => {
  console.log("Listening on port " + server.address().port);
});
