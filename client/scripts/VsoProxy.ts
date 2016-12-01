/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../typings/StringFormat.d.ts"/>

import {IPullRequest} from "./IPullRequest";
import {IAccessToken} from "../../shared/IAccessToken";
import {IRepository} from "./IRepository";
import {IProfile} from "./IProfile";
import {ClientOAuthHelper} from "./ClientOAuthHelper";
import {IOdataQuery} from "./IOdataQuery";

export class VsoProxy {
  private _apiUri = "https://msazure.visualstudio.com/DefaultCollection/One/_apis/git";
  private _apiVersion = "3.0";
  private _clientId = "1439FF2D-26AB-4049-A543-5AFF4848EEC8";
  private _accessToken: Q.Promise<IAccessToken>;
  private _accessTokenChanged: (token: IAccessToken) => void;
  private _callbackUrl = "http://vsodash.azurewebsites.net/auth";
  private _oAuthHelper = new ClientOAuthHelper();
  private _scopes = [
    "vso.agentpools",
    "vso.build",
    "vso.chat_write",
    "vso.code",
    "vso.connected_server",
    "vso.dashboards",
    "vso.entitlements",
    "vso.extension",
    "vso.extension.data",
    "vso.gallery",
    "vso.identity",
    "vso.loadtest",
    "vso.packaging",
    "vso.project",
    "vso.release",
    "vso.test",
    "vso.work"];

  constructor(accessToken: IAccessToken, accessTokenChanged: (token: IAccessToken) => void) {
    this._accessTokenChanged = accessTokenChanged;

    if(accessToken == undefined) {
      this._accessToken = this._getAccessToken();
    } else {
      this._accessToken = Q(accessToken);
    }
  }

  public listPullRequests(repositoryId: string): Q.Promise<IPullRequest[]> {
    return this._makeCall<IOdataQuery<IPullRequest>>({
      url: `${this._apiUri}/repositories/${repositoryId}/pullRequests?api-version=${this._apiVersion}`
    }).then(results => {
      return results.value;
    });
  }

  public listRepositories(): Q.Promise<IRepository[]> {
    return this._makeCall<IOdataQuery<IRepository>>({
      url: `${this._apiUri}/repositories?api-version=${this._apiVersion}`
    }).then(results => {
      return results.value;
    });
  }

  public fetchUserProfile(): Q.Promise<IProfile> {
    return this._makeCall<IProfile>({
      url: "https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=1.0",
    });
  }

  public fetchRepository(repositoryId: string): Q.Promise<IRepository> {
    return this._makeCall<IRepository>({
      url: `${this._apiUri}/repositories/${repositoryId}?api-version=${this._apiVersion}`
    });
  }

  private _getAccessToken(): Q.Promise<IAccessToken> {
    return this._oAuthHelper.getAccessCode(this._clientId, "test", this._scopes, this._callbackUrl).then(code => {
      return this._oAuthHelper.getAccessToken(code, "test").then(token => {
        this._accessTokenChanged(token);
        return token;
      })
    });
  }

  private _makeCall<T>(options: {url: string}): Q.Promise<T> {
    return this._accessToken.then(token => {
      return Q<T>($.ajax({
        url: options.url,
        headers: {
          "Authorization": `Bearer ${token.access_token}`
        }
      }));
    });
  }
}
