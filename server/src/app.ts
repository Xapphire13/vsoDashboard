import * as bodyParser from "body-parser";
import * as express from "express";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";

import {IPreferences} from "./IPreferences"
import {ServerOAuthHelper} from "./ServerOAuthHelper";
import {SqlLiteHelper} from "./SqlLiteHelper"
import {UserDBHelper} from "./UserDBHelper"
import {VsoUserHelper} from "./VSO/VsoUserHelper"

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const clientSecret = JSON.parse(fs.readFileSync(path.join(__dirname, './secrets/clientSecret.json'), 'utf8'))["clientSecret"];
const redirectUri = "https://vsodash.azurewebsites.net/auth";
const app = express();
const dbHelper = new SqlLiteHelper();
const userDbHelper = new UserDBHelper();
const userHelper = new VsoUserHelper();

app.set('port', process.env.PORT || 80);

// Static files
app.use(express.static(path.join(__dirname, "../client")));
app.use(bodyParser.json());
app.use("/authorized", express.static(path.join(__dirname, "../client/auth.html")), () => {
  console.log("Auth redirect");
});

app.get("/auth", (req, res) => {
    const state = req.query["state"];

    if(state === "local" && req.host !== "127.0.0.1") {
        res.redirect(url.format({
            protocol: "http",
            host: "127.0.0.1",
            pathname: "/auth",
            query: req.query
        }));
    } else {
        res.redirect(url.format({
            pathname: "/authorized",
            query: req.query
        }));
    }
});

app.get("/token", async (req, res) => {
  const oAuthHelper = new ServerOAuthHelper(clientSecret, redirectUri);

  const accessCode = req.query["accessCode"];
  const refreshToken = req.query["refreshToken"];

  if(accessCode && accessCode != "") {
    console.log("Getting Access Token");
    const accessToken = await oAuthHelper.getAccessToken(accessCode);
    console.log("Got access token");
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.send(accessToken);
  } else if(refreshToken && refreshToken != "") {
    console.log("Refreshing Access Token");
    const accessToken = await oAuthHelper.refreshAccessToken(refreshToken);
    console.log("Got access token");
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.send(accessToken);
  } else {
    res.statusCode = 400;
    res.send("No access code or refresh token given");
  }
});

app.get("/preferences", async (req, res) => {
  let token = req.headers["authorization"];
  if (token == null) {
      res.statusCode = 401;
      res.send();
      return;
  }

  let userId = await userHelper.getUserId(token.toString());
  if (userId == null) {
      res.statusCode = 401;
      res.send();
      return;
  }

  let response = await userDbHelper.getUserPreferences(dbHelper, userId)
  res.statusCode = 200;
  res.send(response);
});

app.post("/preferences", async (req, res) => {
  const body = <IPreferences>req.body;
  if (!body) {
    res.statusCode = 400;
    res.send();

    return;
  }

  const token = req.headers["authorization"];
  if (!token) {
      res.statusCode = 401;
      res.send();

      return;
  }

  const userId = await userHelper.getUserId(token.toString());
  if (!userId) {
      res.statusCode = 401;
      res.send();

      return;
  }

  await userDbHelper.updateUserPreference(dbHelper, body, userId);

  res.statusCode = 200;
  res.send(body);
});

// Initialize database and start server
dbHelper.init().then(() => {
  const server = app.listen(app.get('port'), () => {
    console.log("Listening on port " + server.address().port);
  });
}, err => {
  console.error("Couldn't initialize database");
});
