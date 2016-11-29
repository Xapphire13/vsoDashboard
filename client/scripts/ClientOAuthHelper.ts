/// <reference path="../../typings/index.d.ts"/>
/// <reference path="../../typings/StringFormat.d.ts"/>

import {IAccessToken} from "../../shared/IAccessToken";

export class ClientOAuthHelper {
  public static authUrlFormat = "https://app.vssps.visualstudio.com/oauth2/authorize?client_id={0}&response_type=Assertion&state={1}&scope={2}&redirect_uri={3}";

  public getAccessCode(clientId: string, state: string, scopes: string[], redirectUri: string): Q.Promise<string> {
    let authPopup = window.open(ClientOAuthHelper.authUrlFormat.format(clientId, state, scopes.join(" "), redirectUri), "", "width=800,height=600");
    let def = Q.defer<string>();

    let checkLocation = () => {
      let code = null;
      let retState = null;

      try {
        let location = authPopup.location.href;

        code = location.match(/code=([^&]*)/i)[1];
        retState = location.match(/state=([^&]*)/i)[1];
      }
      catch(err) {
      }

      if(retState === state) {
        authPopup.close();
        def.resolve(code);
      } else {
        setTimeout(checkLocation, 1000);
      }
    }

    checkLocation();

    return def.promise;
  }

  public getAccessToken(accessCode: string, state: string): Q.Promise<IAccessToken> {
    return Q($.get("/token?accessCode={0}&state={1}".format(accessCode, state)));
  }

  public refreshAccessToken(refreshToken: string): Q.Promise<IAccessToken> {
    return Q($.get("/token?refreshToken={0}".format(refreshToken)));
  }
}
