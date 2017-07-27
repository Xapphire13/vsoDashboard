import * as $ from "jquery"
import {IAccessToken} from "../../server/src/IAccessToken";

export function getAccessCode(clientId: string, state: string, scopes: string[], redirectUri: string): void {
  window.location.assign(`https://app.vssps.visualstudio.com/oauth2/authorize?client_id=${clientId}&response_type=Assertion&state=${state}&scope=${scopes.join(" ")}&redirect_uri=${redirectUri}`);
}

export function getAccessToken(accessCode: string, state: string): Promise<IAccessToken> {
  return new Promise((resolve, reject) => {
    $.get(`/token?accessCode=${accessCode}&state=${state}`).then(
      resolve,
      reject
    );
  });
}

export function refreshAccessToken(refreshToken: string): Promise<IAccessToken> {
  return new Promise((resolve, reject) => {
    $.get(`/token?refreshToken=${refreshToken}`).then(
      resolve,
      reject
    );
  });
}