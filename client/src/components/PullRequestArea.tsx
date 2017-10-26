import "./PullRequestArea.less"

import * as React from "react";
import * as VsoApi from "../api/VsoApi";

import autobind from "autobind-decorator";

import {List, Spinner, SpinnerType} from 'office-ui-fabric-react';
import {IPreferences} from "../../../server/src/IPreferences";
import {IProfile} from "../api/models/IProfile";
import {IPullRequest} from "../api/models/IPullRequest";
import {PullRequest} from "./PullRequest";

type State = {
  pullRequests: IPullRequest[];
  isLoading: boolean;
};

export class PullRequestArea extends React.Component<{preferences: IPreferences | null, userProfile: IProfile | null}, State> {
  private refreshTimer: number;

  constructor() {
    super();

    this.state = {
      pullRequests: [],
      isLoading: true
    };
  }

  public render(): JSX.Element {
      return <div className="pullRequestArea">
        {this.state.isLoading ?
          <Spinner type={SpinnerType.large}/> :
          <List
            items={this.state.pullRequests}
            getKey={(pullRequest: IPullRequest) => `${pullRequest.pullRequestId}`}
            onRenderCell={(pullRequest: IPullRequest) => <PullRequest
              key={pullRequest.pullRequestId}
              userProfile={this.props.userProfile}
              pullRequest={pullRequest}
              preferences={this.props.preferences}
              />
            }
          />
        }
      </div>;
  }

  public async componentDidMount(): Promise<void> {
    await this.fetchPullRequests();
    this.setState({
      isLoading: false
    });

    this.startPolling(this.props.preferences!.pollIntervalInSeconds * 1000);
  }

  private async fetchPullRequests(): Promise<void> {
    const pullRequests = (await Promise.all(this.props.preferences!.repositoryPreferences.map(async repoPref =>
      await VsoApi.listPullRequests(repoPref.repositoryId)
    ))).reduce((agg, current) => {
      agg.push(...current);
      return agg;
    }, []).sort(this.comparePullRequests);

    this.setState({pullRequests});
  }

  @autobind
  private startPolling(timeout: number): void {
    window.clearInterval(this.refreshTimer);
    this.refreshTimer = window.setInterval(() => this.fetchPullRequests(), timeout);
  }

  private comparePullRequests(left: IPullRequest, right: IPullRequest): number {
    return left.updated < right.updated ?
      1 :
      left.updated === right.updated ?
        0 :
        -1;
  }
}
