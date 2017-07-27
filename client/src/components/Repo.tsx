import "../styles/repo.less";

import * as React from "react";
import * as VsoApi from "../api/VsoApi";

import {RepoFilter, RepoFilters} from "./RepoFilters";

import {PullRequestList} from "./PullRequestList";
import {RepoChartContainer} from "./RepoChartContainer";
import {RepoHeader} from "./RepoHeader";
import {IPullRequest} from "../api/models/IPullRequest";
import {IProfile} from "../api/models/IProfile";

declare type Props = {
  id: string;
  collapsed: boolean;
  onToggleCollapse: (id: string)=>void;
  userProfile: IProfile | null
}

declare type State = {
  chartsMinimized: boolean,
  pullRequests: IPullRequest[],
  filter: RepoFilter,
  name: string
}

export class Repo extends React.Component<Props, State> {
  private _repoContent: HTMLDivElement | null;

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
      const [repo, pullRequests] = await Promise.all([
        VsoApi.fetchRepository(this.props.id),
        VsoApi.listPullRequests(this.props.id)
      ]);

      this.setState({
        chartsMinimized: this._repoContent.clientHeight < 330,
        name: repo.name,
        pullRequests: pullRequests.sort((left, right) =>
          left.updated < right.updated ?
            1 :
            left.updated === right.updated ?
              0 :
              -1
        )
      });
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
          <PullRequestList pullRequests={this.state.pullRequests} userProfile={this.props.userProfile} />
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

  public onToggleVisibility = (): void => {
    this.props.onToggleCollapse(this.props.id);
  }
}
