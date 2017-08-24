import * as https from "https";

import {IVsoUser} from "./IVsoUser"

const host: string = "app.vssps.visualstudio.com";

export class VsoUserHelper {
  public getUserId(authorizationToken: string): Promise<string | null> {
    return new Promise<string | null>((resolve, reject) => {
      const get = https.request({
        method: "GET",
        host: host,
        path: "/_apis/profile/profiles/me?api-version=1.0",
        headers: {
          "Authorization": authorizationToken
        }
      }, (res) => {
        res.setEncoding("utf8");
        res.on('data', (data: string) => {
          try {
            resolve((<IVsoUser>(JSON.parse(data))).id);
          } catch (err) {
            console.trace(err);
            resolve(null);
          }
        });
      });

      get.end();
    });
  }
}
