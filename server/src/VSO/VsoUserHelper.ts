import * as https from "https";
import {IVsoUser} from "./IVsoUser"

export class VsoUserHelper {

    public static host: string = "app.vssps.visualstudio.com";

    public getUserId(authorizationToken : string) : Promise<string | null> {
        return new Promise<string | null>((resolve, reject) => {
            let get = https.request({
                method: "GET",
                host: VsoUserHelper.host,
                path: "/_apis/profile/profiles/me?api-version=1.0",
                headers: {
                    "Authorization": authorizationToken
                }
            }, (res) => {
                res.setEncoding("utf8");
                res.on('data', data => {
                    try {
                        resolve((<IVsoUser>(JSON.parse(data as any))).id);
                    } catch (err) {
                        resolve(null);
                    }
                });
            });

            get.end();
        });
    }
}
