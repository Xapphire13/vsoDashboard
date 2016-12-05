/// <reference path="../../typings/index.d.ts"/>
/// <reference path="../../typings/StringFormat.d.ts"/>

import {IAccessToken} from "../../shared/IAccessToken";

export class ClientOAuthHelper {
  public static authUrlFormat = "https://app.vssps.visualstudio.com/oauth2/authorize?client_id={0}&response_type=Assertion&state={1}&scope={2}&redirect_uri={3}";

  public getAccessCode(clientId: string, state: string, scopes: string[], redirectUri: string): void {
    window.location.assign(ClientOAuthHelper.authUrlFormat.format(clientId, state, scopes.join(" "), redirectUri));
  }

  public getAccessToken(accessCode: string, state: string): Q.Promise<IAccessToken> {
    return Q($.get("/token?accessCode={0}&state={1}".format(accessCode, state)));
  }

  public refreshAccessToken(refreshToken: string): Q.Promise<IAccessToken> {
    return Q($.get("/token?refreshToken={0}".format(refreshToken)));
  }
}
