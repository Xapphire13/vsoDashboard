/// <reference path="../typings/index.d.ts"/>
/// <reference path="../typings/StringFormat.d.ts"/>

import * as Q from "q";
import * as https from "https";
import {IAccessToken} from "../shared/IAccessToken";

export class ServerOAuthHelper {
  public static refreshTokenDataTemplate: string = "client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&client_assertion={0}&grant_type=refresh_token&assertion={1}&redirect_uri={2}";
  public static tokenDataTemplate: string = "client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&client_assertion={0}&grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion={1}&redirect_uri={2}";
  public static tokenHost: string = "app.vssps.visualstudio.com";
  public static tokenPath: string = "/oauth2/token";

  private _clientSecret: string;
  private _redirectUri: string;

  constructor(clientSecret: string, redirectUri: string) {
    this._clientSecret = clientSecret;
    this._redirectUri = redirectUri;
  }

  public getAccessToken(clientCode: string): Q.Promise<IAccessToken> {
    let def = Q.defer<IAccessToken>();

    let post = https.request({
      method: "POST",
      host: ServerOAuthHelper.tokenHost,
      path: ServerOAuthHelper.tokenPath,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }, (res) => {
      res.setEncoding("utf8");
      res.on('data', data => {
        def.resolve(JSON.parse(data as any));
      });
    });

    post.write(ServerOAuthHelper.tokenDataTemplate.format(this._clientSecret, clientCode, this._redirectUri));
    post.end();

    return def.promise;
  }

  public refreshAccessToken(refreshToken: string): Q.Promise<IAccessToken> {
    let def = Q.defer<IAccessToken>();

    let post = https.request({
      method: "POST",
      host: ServerOAuthHelper.tokenHost,
      path: ServerOAuthHelper.tokenPath,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }, (res) => {
      res.setEncoding("utf8");
      res.on('data', data => {
        def.resolve(JSON.parse(data as any));
      });
    });

    post.write(ServerOAuthHelper.refreshTokenDataTemplate.format(this._clientSecret, refreshToken, this._redirectUri));
    post.end();

    return def.promise;
  }
}
