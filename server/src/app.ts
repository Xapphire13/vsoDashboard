import * as express from "express";
import * as path from "path";
import {ServerOAuthHelper} from "./ServerOAuthHelper";

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
let clientSecret = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Im9PdmN6NU1fN3AtSGpJS2xGWHo5M3VfVjBabyJ9.eyJjaWQiOiJjMTAwNjAwNy0yZDY3LTQ4YTctYjRiOS1jYjgyYWY1YzA1MjUiLCJjc2kiOiIwM2FmYjM2Zi0xMDFmLTRkYjktOWVlZi1lY2QwZmQ2NzIyOTIiLCJuYW1laWQiOiIyNzkyYWI2MS1iMDQwLTRmODItYjM5NC0wZGY4ZjMwYzkxMDUiLCJpc3MiOiJhcHAudnNzcHMudmlzdWFsc3R1ZGlvLmNvbSIsImF1ZCI6ImFwcC52c3Nwcy52aXN1YWxzdHVkaW8uY29tIiwibmJmIjoxNDgxMTM5MzM1LCJleHAiOjE2Mzg5MDU3MzV9.pabPSSkgf8V6CTG273ODrK_H9Hvk9Ki2ctWW4wRz1TRw3H-kHCbiRaoogBX1F4AlTRlNSNuwWnBCPaIukDuupHe-i0OCZYOhUfVTq6BVQqsJLa7IPN9fdT8fPDj4wX8ThV-jmXCWg6QKEPwlqfA-YLRNWsMOR1091XsadARVjYdxFhNcNSL9h8NiAECh_GNSezX10-tsrnXGMh-NVPvrNYtP66wAMyvpggGy5wmFdGjw03RDofd4CG6PH14Q1psOD6YsR1Bl-xURRdwf82EmzYjWlaTbZEEBxFpff1nuaB7FJIU6okt0jACTX-GUwo6Q-ykXZbN175nu-OfpLp3nnw";
let redirectUri = "https://vsodash.azurewebsites.net/auth";
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
      res.statusCode = 200;
      res.send(accessToken);
    });
  } else if(refreshToken != undefined && refreshToken != "") {
    console.log("Refreshing Access Token");
    oAuthHelper.refreshAccessToken(refreshToken).then(accessToken => {
      console.log("Got access token");
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.send(accessToken);
    });
  } else{
    res.statusCode = 400;
    res.send();

  }
});

// Start server
let server = app.listen(app.get('port'), () => {
  console.log("Listening on port " + server.address().port);
});
