import {IAccessToken} from "../../server/src/IAccessToken";

export function getAccessCode(clientId: string, state: string, scopes: string[], redirectUri: string): void {
  window.location.assign(`https://app.vssps.visualstudio.com/oauth2/authorize?client_id=${clientId}&response_type=Assertion&state=${state}&scope=${scopes.join(" ")}&redirect_uri=${redirectUri}`);
}

export async function getAccessToken(accessCode: string, state: string): Promise<IAccessToken> {
  return (await fetch(`/token?accessCode=${accessCode}&state=${state}`)).json();
}

export async function refreshAccessToken(refreshToken: string): Promise<IAccessToken> {
    return (await fetch(`/token?refreshToken=${refreshToken}`)).json();
}
