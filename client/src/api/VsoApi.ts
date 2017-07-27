import {IAccessToken} from "../../../server/src/IAccessToken";
import {IIteration} from "./models/IIteration";
import {IOdataQuery} from "./models/IOdataQuery";
import {IProfile} from "./models/IProfile";
import {IPullRequest} from "./models/IPullRequest";
import {IRepository} from "./models/IRepository";
import {IThread} from "./models/IThread";
import {IWorkItemQuery} from "./models/IWorkItemQuery";
import {IWorkItem} from "./models/IWorkItem";
import {PullRequestStatus} from "./models/PullRequestStatus";
import {PullRequestVote} from "./models/PullRequestVote";

const apiUri = "https://msazure.visualstudio.com/DefaultCollection/One/_apis";
const apiVersion = "3.0";
let accessToken: IAccessToken | null = null;
let refreshFunction: (() => Promise<void>) | null = null;

async function _makeCall<T>(options: {
  url: string,
  method?: string,
  contentType?: string,
  data?: any
}, isRetry: boolean = false): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    $.ajax({
      url: options.url,
      method: options.method || "GET",
      contentType: options.contentType,
      data: options.data,
      headers: {
        "Authorization": `Bearer ${accessToken && accessToken.access_token}`
      }
  }).then(async (result, textStatus, jqXHR) => {
      if(refreshFunction && jqXHR.status === 203) { // Edge/IE will get a 203 when we need a new token
          if(!isRetry) {
              await refreshFunction();
              try {
                  resolve(await _makeCall<T>(options, true));
              } catch (err) {
                  reject(jqXHR);
              }
          }
          reject(jqXHR);
      } else {
          resolve(result);
      }
  }, async err => {
      if (refreshFunction && (err.status === 401 || err.status === 0)) {
          if(!isRetry) {
              await refreshFunction();
              try {
                  resolve(await _makeCall<T>(options, true));
              } catch (err) {
                  reject(err);
              }
          }
          reject(err);
      } else {
          reject(err);
      }
    });
  })
}

export function setAccessToken(newAccessToken: IAccessToken): void {
  accessToken = newAccessToken;
}

export function setRefreshFunction(newRefreshFunction: () => Promise<void>): void {
    refreshFunction = newRefreshFunction;
}

export async function listPullRequests(repositoryId: string): Promise<IPullRequest[]> {
  const results = await _makeCall<IOdataQuery<IPullRequest>>({
    url: `${apiUri}/git/repositories/${repositoryId}/pullRequests?api-version=${apiVersion}`
  });

  let pullRequests = results.value;

  return Promise.all(pullRequests.map(async (pullRequest) => {
    // Fetch last updated time
    const iterations = await fetchIterations(pullRequest);
    pullRequest.updated = iterations[iterations.length - 1].updatedDate;
    return pullRequest;
  }));
}

export function fetchPullRequest(pullRequest: IPullRequest): Promise<IPullRequest> {
  return _makeCall<IPullRequest>({
    url: `${apiUri}/git/repositories/${pullRequest.repository.id}/pullRequests/${pullRequest.pullRequestId}?api-version=${apiVersion}`
  });
}

export async function fetchIterations(pullRequest: IPullRequest): Promise<IIteration[]> {
  return (await _makeCall<IOdataQuery<IIteration>>({
    url: `${apiUri}/git/repositories/${pullRequest.repository.id}/pullRequests/${pullRequest.pullRequestId}/iterations?api-version=${apiVersion}`
  })).value;
}

export async function modifyPullRequestStatus(pullRequest: IPullRequest, status: PullRequestStatus): Promise<IPullRequest> {
  // Fetch latest version of the request
  pullRequest = await fetchPullRequest(pullRequest);

  return _makeCall<IPullRequest>({
    url: `${apiUri}/git/repositories/${pullRequest.repository.id}/pullRequests/${pullRequest.pullRequestId}?api-version=${apiVersion}`,
    method: "PATCH",
    contentType: "application/json",
    data: JSON.stringify({
      status: PullRequestStatus[status],
      lastMergeSourceCommit: pullRequest.lastMergeSourceCommit
    })
  });
}

export function modifySignOffVote(pullRequest: IPullRequest, user: IProfile, vote: PullRequestVote): Promise<IProfile> {
  return _makeCall<IProfile>({
    url: `${apiUri}/git/repositories/${pullRequest.repository.id}/pullRequests/${pullRequest.pullRequestId}/reviewers/${user.id}?api-version=${apiVersion}`,
    method: "PUT",
    contentType: "application/json",
    data: JSON.stringify({
      vote: vote
    })
  });
}

export async function listRepositories(): Promise<IRepository[]> {
  return (await _makeCall<IOdataQuery<IRepository>>({
    url: `${apiUri}/git/repositories?api-version=${apiVersion}`
  })).value || [];
}

export function fetchUserProfile(): Promise<IProfile> {
  return _makeCall<IProfile>({
    url: "https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=1.0",
  });
}

export function fetchRepository(repositoryId: string): Promise<IRepository> {
  return _makeCall<IRepository>({
    url: `${apiUri}/git/repositories/${repositoryId}?api-version=${apiVersion}`
  });
}

export async function fetchThreads(pullRequest: IPullRequest): Promise<IThread[]> {
  return (await _makeCall<IOdataQuery<IThread>>({
    url: `${apiUri}/git/repositories/${pullRequest.repository.id}/pullRequests/${pullRequest.pullRequestId}/threads?api-version=${apiVersion}`
  })).value;
}

export async function listWorkItems(): Promise<IWorkItem[]> {
  const results = await _makeCall<IWorkItemQuery>({
    url: `${apiUri}/wit/wiql?api-version=${apiVersion}`,
    method: "POST",
    data: JSON.stringify({
      query: "Select * " +
      "From WorkItems " +
      "Where [System.AssignedTo] = @Me " +
      "And [System.State] <> 'Closed' "
    }),
    contentType: "application/json"
  });

  return Promise.all(results.workItems.map(wi => _makeCall<IWorkItem>({ url: wi.url })));
}

export function getDisplayImageUrl(userId: string, size: number = 1): string {
  return `https://msazure.visualstudio.com/_api/_common/identityImage?size=${size}&id=${userId}`;
};
