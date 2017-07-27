import * as VsoApi from "./VsoApi";

import {IPreferences} from "../../../server/src/IPreferences";

const preferencesUrl = "/preferences";


export function getPreferences(): Promise<IPreferences> {
    const accessToken = VsoApi.getAccessToken()

    return new Promise<IPreferences>((resolve, reject) => {
        $.ajax({
            url: preferencesUrl,
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken && accessToken.access_token}`
            }
        }).then(resolve, reject);
    });
}
