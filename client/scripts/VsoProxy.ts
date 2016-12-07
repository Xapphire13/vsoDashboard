/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../typings/StringFormat.d.ts"/>

import {IPullRequest} from "./IPullRequest";
import {IAccessToken} from "../../shared/IAccessToken";
import {IRepository} from "./IRepository";
import {IProfile} from "./IProfile";
import {ClientOAuthHelper} from "./ClientOAuthHelper";
import {IThread} from "./IThread";
import {IOdataQuery} from "./IOdataQuery";

export class VsoProxy {
  private _apiUri = "https://msazure.visualstudio.com/DefaultCollection/One/_apis/git";
  private _apiVersion = "3.0";
  private _clientId = "1439FF2D-26AB-4049-A543-5AFF4848EEC8";
  private _accessToken: Q.Promise<IAccessToken>;
  private _accessTokenChanged: (token: IAccessToken) => void;
  private _callbackUrl = "http://vsodash.azurewebsites.net/auth";
  private _oAuthHelper = new ClientOAuthHelper();
  private _refreshSemaphore = 0;
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
      this._oAuthHelper.getAccessCode(this._clientId, "test", this._scopes, this._callbackUrl); // This redirects the browser
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

  public fetchThreads(pullRequest: IPullRequest): Q.Promise<IThread[]> {
    return this._makeCall<IOdataQuery<IThread>>({
      url: `${this._apiUri}/repositories/${pullRequest.repository.id}/pullRequests/${pullRequest.pullRequestId}/threads?api-version=${this._apiVersion}`
    }).then(results => {
      return results.value;
    });
  }

  private _refreshAccessToken(refreshToken: string): Q.Promise<IAccessToken> {
    return this._oAuthHelper.refreshAccessToken(refreshToken).then(token => {
      this._accessTokenChanged(token);
      return token;
    });
  }

  private _makeCall<T>(options: {url: string}, refreshToken: boolean = true): Q.Promise<T> {
    return this._accessToken.then(token => {
      return Q<T>($.ajax({
        url: options.url,
        headers: {
          "Authorization": `Bearer ${token.access_token}`
        }
      }).then((result: T, textStatus, jqXHR) => {
        if(jqXHR.status === 203) { // Edge/IE will get a 203 when we need a new token
          return this._renewToken(options, token);
        }

        return result;
      }, reason => {
        if(refreshToken && (reason.status === 401 || reason.status === 0)) {
          return this._renewToken(options, token);
        }

        return Q.reject(reason);
      }));
    });
  }

  private _renewToken<T>(options: {url: string}, token: IAccessToken): Q.Promise<T> {
    if(++this._refreshSemaphore === 1) {
      console.log("Refreshing access token");
      if(token.refresh_token == undefined) {
        this._oAuthHelper.getAccessCode(this._clientId, "test", this._scopes, this._callbackUrl); // This redirects the browser
      }

      this._accessToken = this._refreshAccessToken(token.refresh_token);
      this._accessToken.then(() => {
        this._refreshSemaphore = 0;
      })
    }
    return this._makeCall<T>(options, false);
  }
}
