import "./Repo.less";

import * as React from "react";
import * as VsoApi from "../api/VsoApi";

import autobind from "autobind-decorator";

import {RepoFilter, RepoFilters} from "./RepoFilters";

import {IPreferences} from "../../../server/src/IPreferences";
import {IProfile} from "../api/models/IProfile";
import {IPullRequest} from "../api/models/IPullRequest";
import {List} from 'office-ui-fabric-react';
import {PullRequest} from "./PullRequest";
import {RepoChartContainer} from "./RepoChartContainer";
import {RepoHeader} from "./RepoHeader";

declare type Props = {
  id: string;
  collapsed: boolean;
  onToggleCollapse: (id: string)=>void;
  userProfile: IProfile | null;
  preferences: IPreferences | null;
}

declare type State = {
  chartsMinimized: boolean,
  pullRequests: IPullRequest[],
  filter: RepoFilter,
  name: string
}

export class Repo extends React.Component<Props, State> {
  private _repoContent: HTMLDivElement | null;
  private refreshTimer: number;

  constructor() {
    super();

    this.state = {
      chartsMinimized: true,
      name: "",
      filter: RepoFilter.mine,
      pullRequests: []
    };
  }

  public async componentDidMount(): Promise<void> {
    if(this._repoContent) {
      const [repo] = await Promise.all([
        VsoApi.fetchRepository(this.props.id),
        this.fetchPullRequests()
      ]);

      this.setState({
        chartsMinimized: this._repoContent.clientHeight < 330,
        name: repo.name
      });

      this.refreshTimer = window.setInterval(() => this.fetchPullRequests(), this.props.preferences!.pollIntervalInSeconds * 1000);
    }
  }

  public componentDidUpdate(prevProps: Props, prevState: State): void {
    if(this._repoContent) {
      const isMinimized = this._repoContent.clientHeight < 330;
      if(isMinimized != prevState.chartsMinimized) {
        this.setState({
          chartsMinimized: isMinimized,
        });
      }
    }
  }

  public componentWillUnmount(): void {
    window.clearInterval(this.refreshTimer);
  }

  public render(): JSX.Element {
    return <div className={`repo ${this.props.collapsed && "collapsed"}`}>
      <RepoHeader
        name={this.state.name}
        onToggleVisibility={this.onToggleVisibility}
        collapsed={this.props.collapsed}
        pullRequestCount={this.state.pullRequests.length}
        needsAttention={true}
      />
      {!this.props.collapsed &&
      <div className="repoContent" ref={(element) => this._repoContent = element}>
        <div className="pullRequestContainer">
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
          <RepoFilters
            currentFilter={this.state.filter}
            onFilterChanged={(filter: RepoFilter) => this.setState({filter})}/>
        </div>
        <RepoChartContainer
          isMinimized={this.state.chartsMinimized}
          numberOfPullRequests={this.state.pullRequests.length}
        />
      </div>}
    </div>;
  }

  @autobind
  public onToggleVisibility(): void {
    this.props.onToggleCollapse(this.props.id);
  }

  @autobind
  private async fetchPullRequests(): Promise<void> {
    const pullRequests = (await VsoApi.listPullRequests(this.props.id)).sort((left, right) =>
      left.updated < right.updated ?
        1 :
        left.updated === right.updated ?
          0 :
          -1
    );

    this.setState({pullRequests});
  }
}
