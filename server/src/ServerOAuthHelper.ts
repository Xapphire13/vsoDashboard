import * as format from "string-format-obj";
import * as https from "https";

import {IAccessToken} from "./IAccessToken";

export class ServerOAuthHelper {
  public static refreshTokenDataTemplate: string = "client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&client_assertion={0}&grant_type=refresh_token&assertion={1}&redirect_uri={2}";
  public static tokenDataTemplate: string = "client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&client_assertion={0}&grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion={1}&redirect_uri={2}";
  public static tokenHost: string = "app.vssps.visualstudio.com";
  public static tokenPath: string = "/oauth2/token";

  constructor(private clientSecret: string, private redirectUri: string) {}

  public getAccessToken(clientCode: string): Promise<IAccessToken> {
    return new Promise((resolve, reject) => {
      const post = https.request({
        method: "POST",
        host: ServerOAuthHelper.tokenHost,
        path: ServerOAuthHelper.tokenPath,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }, res => {
        res.setEncoding("utf8");
        res.on('data', data => {
          resolve(JSON.parse(data as any));
        });
      });

      post.write(format(ServerOAuthHelper.tokenDataTemplate, {
        0: this.clientSecret,
        1: clientCode,
        2: this.redirectUri
      }));

      post.end();
    });
  }

  public refreshAccessToken(refreshToken: string): Promise<IAccessToken> {
    return new Promise((resolve, reject) => {
      const post = https.request({
        method: "POST",
        host: ServerOAuthHelper.tokenHost,
        path: ServerOAuthHelper.tokenPath,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }, res => {
        res.setEncoding("utf8");
        res.on('data', data => {
          resolve(JSON.parse(data as any));
        });
      });

      post.write(format(ServerOAuthHelper.refreshTokenDataTemplate, {
        0: this.clientSecret,
        1: refreshToken,
        2: this.redirectUri
      }));
      
      post.end();
    });
  }
}
