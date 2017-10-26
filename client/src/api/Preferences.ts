import * as VsoApi from "./VsoApi";

import {IPreferences} from "../../../server/src/IPreferences";

const preferencesUrl = "/preferences";

export async function getPreferences(): Promise<IPreferences> {
    const accessToken = VsoApi.getAccessToken()

    return await (await fetch(preferencesUrl, {
      headers: {
        "Authorization": `Bearer ${accessToken && accessToken.access_token}`
      }
    })).json();
}

export async function savePreferences(preferences: IPreferences): Promise<IPreferences> {
    const accessToken = VsoApi.getAccessToken()

    return await (await fetch(preferencesUrl, {
      method: "POST",
      headers: {
          "Authorization": `Bearer ${accessToken && accessToken.access_token}`,
          "Content-Type": "application/json"
      },
      body: JSON.stringify(preferences)
    })).json();
}
