/// <reference path="../../../typings/index.d.ts" />
/// <reference path="../../../typings/StringFormat.d.ts"/>

import {ClientOAuthHelper} from "../ClientOAuthHelper";
import {IAccessToken} from "../../../shared/IAccessToken";
import {IIteration} from "./models/IIteration";
import {IOdataQuery} from "../models/IOdataQuery";
import {IProfile} from "./models/IProfile";
import {IPullRequest} from "./models/IPullRequest";
import {IRepository} from "./models/IRepository";
import {IThread} from "./models/IThread";
import {IWorkItemQuery} from "./models/IWorkItemQuery";
import {IWorkItem} from "./models/IWorkItem";
import {PullRequestStatus} from "./models/PullRequestStatus";
import {PullRequestVote} from "./models/PullRequestVote";

export class VsoProxy {
  private _accessToken: Q.Promise<IAccessToken>;
  private _accessTokenChanged: (token: IAccessToken) => void;
  private _apiUri = "https://msazure.visualstudio.com/DefaultCollection/One/_apis";
  private _apiVersion = "3.0";
  private _callbackUrl = "https://vsodash.azurewebsites.net/auth";
  private _clientId = "C1006007-2D67-48A7-B4B9-CB82AF5C0525";
  private _oAuthHelper = new ClientOAuthHelper();
  private _refreshSemaphore = 0;
  private _scopes = [
    "vso.agentpools_manage",
    "vso.build_execute",
    "vso.chat_manage",
    "vso.code_manage",
    "vso.dashboards",
    "vso.dashboards_manage",
    "vso.extension.data_write",
    "vso.extension_manage",
    "vso.identity",
    "vso.loadtest_write",
    "vso.packaging_manage",
    "vso.profile_write",
    "vso.project_manage",
    "vso.release_manage",
    "vso.test_write",
    "vso.work_write"];

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
      url: `${this._apiUri}/git/repositories/${repositoryId}/pullRequests?api-version=${this._apiVersion}`
    }).then(results => {
      return results.value;
    });
  }

  public fetchPullRequest(pullRequest: IPullRequest): Q.Promise<IPullRequest> {
    return this._makeCall<IPullRequest>({
      url: `${this._apiUri}/git/repositories/${pullRequest.repository.id}/pullRequests/${pullRequest.pullRequestId}?api-version=${this._apiVersion}`
    });
  }

  public fetchIterations(pullRequest: IPullRequest): Q.Promise<IIteration[]> {
    return this._makeCall<IOdataQuery<IIteration>>({
      url: `${this._apiUri}/git/repositories/${pullRequest.repository.id}/pullRequests/${pullRequest.pullRequestId}/iterations?api-version=${this._apiVersion}`
    }).then(results => {
      return results.value;
    });
  }

  public modifyPullRequestStatus(pullRequest: IPullRequest, status: PullRequestStatus): Q.Promise<IPullRequest> {
    // Fetch latest version of the request
    return this.fetchPullRequest(pullRequest).then(pullRequest => {
      return this._makeCall<IPullRequest>({
        url: `${this._apiUri}/git/repositories/${pullRequest.repository.id}/pullRequests/${pullRequest.pullRequestId}?api-version=${this._apiVersion}`,
        method: "PATCH",
        contentType: "application/json",
        data: JSON.stringify({
          status: PullRequestStatus[status],
          lastMergeSourceCommit: pullRequest.lastMergeSourceCommit
        })
      });
    });
  }

  public modifySignOffVote(pullRequest: IPullRequest, user: IProfile, vote: PullRequestVote): Q.Promise<IProfile> {
    return this._makeCall<IProfile>({
      url: `${this._apiUri}/git/repositories/${pullRequest.repository.id}/pullRequests/${pullRequest.pullRequestId}/reviewers/${user.id}?api-version=${this._apiVersion}`,
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify({
        vote: vote
      })
    });
  }

  public listRepositories(): Q.Promise<IRepository[]> {
    return this._makeCall<IOdataQuery<IRepository>>({
      url: `${this._apiUri}/git/repositories?api-version=${this._apiVersion}`
    }).then(results => {
      return results.value || [];
    });
  }

  public fetchUserProfile(): Q.Promise<IProfile> {
    return this._makeCall<IProfile>({
      url: "https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=1.0",
    });
  }

  public fetchRepository(repositoryId: string): Q.Promise<IRepository> {
    return this._makeCall<IRepository>({
      url: `${this._apiUri}/git/repositories/${repositoryId}?api-version=${this._apiVersion}`
    });
  }

  public fetchThreads(pullRequest: IPullRequest): Q.Promise<IThread[]> {
    return this._makeCall<IOdataQuery<IThread>>({
      url: `${this._apiUri}/git/repositories/${pullRequest.repository.id}/pullRequests/${pullRequest.pullRequestId}/threads?api-version=${this._apiVersion}`
    }).then(results => {
      return results.value;
    });
  }

  public listWorkItems(): Q.Promise<IWorkItem[]> {
    return this._makeCall<IWorkItemQuery>({
      url: `${this._apiUri}/wit/wiql?api-version=${this._apiVersion}`,
      method: "POST",
      data: JSON.stringify({
        query: "Select * " +
        "From WorkItems " +
        "Where [System.AssignedTo] = @Me " +
        "And [System.State] <> 'Closed' "
      }),
      contentType: "application/json"
    }).then(results => {
      return Q.all(results.workItems.map(wi => this._makeCall<IWorkItem>({url: wi.url})));
    });
  }

  private _refreshAccessToken(refreshToken: string): Q.Promise<IAccessToken> {
    return this._oAuthHelper.refreshAccessToken(refreshToken).then(token => {
      this._accessTokenChanged(token);
      return token;
    });
  }

  private _makeCall<T>(options: {
    url: string,
    method?: string,
    contentType?: string,
    data?: any
  }, refreshToken: boolean = true): Q.Promise<T> {
    return this._accessToken.then(token => {
      return Q<T>($.ajax({
        url: options.url,
        method: options.method || "GET",
        contentType: options.contentType,
        data: options.data,
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
