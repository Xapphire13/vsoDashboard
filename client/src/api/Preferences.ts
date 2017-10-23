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

export function savePreferences(preferences: IPreferences): Promise<IPreferences> {
    const accessToken = VsoApi.getAccessToken()

    preferences.emailOverride = undefined; // TODO temp fix

    return new Promise<IPreferences>((resolve, reject) => {
        $.ajax({
            url: preferencesUrl,
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken && accessToken.access_token}`
            },
            contentType: "application/json",
            data: JSON.stringify(preferences),
        }).then(resolve, reject);
    });
}
