import "../styles/repo.less";

import * as React from "react";

import {PullRequestList} from "./PullRequestList";
import {RepoChartContainer} from "./RepoChartContainer";
import {RepoFilter, RepoFilters} from "./RepoFilters";
import {RepoHeader} from "./RepoHeader";

export class Repo extends React.Component<{name: string}, {chartsMinimized: boolean, collapsed: boolean, pullRequests: any[], filter: RepoFilter}> {
  private _repoContent: HTMLDivElement | null;

  constructor() {
    super();

    this.state = {
      chartsMinimized: true,
      collapsed: false,
      filter: RepoFilter.mine,
      pullRequests: [
        {
          title: "Test PR",
          myStatus: "Assigned",
          status: "Active",
          createdBy: "Joe Bloggs",
          created: "2012-04-23T18:00:00.000Z",
          updated: "2017-04-24T18:00:00.000Z",
          numberOfComments: 10
        },
        {
          title: "Test PR 2",
          myStatus: "Assigned",
          status: "Active",
          createdBy: "Joe Bloggs",
          created: "2017-04-23T18:00:00.000Z",
          updated: (new Date(Date.now())).toJSON(),
          numberOfComments: 12
        },
        {
          title: "Test PR 3",
          myStatus: "Assigned",
          status: "Active",
          createdBy: "Joe Bloggs",
          created: "2010-04-23T18:00:00.000Z",
          updated: (new Date(Date.now())).toJSON(),
          numberOfComments: 0
        },
        {
          title: "Test PR 4",
          myStatus: "Assigned",
          status: "Active",
          createdBy: "Joe Bloggs",
          created: "2012-04-23T18:00:00.000Z",
          updated: "2017-04-24T18:00:00.000Z",
          numberOfComments: 10
        },
        {
          title: "Test PR 5",
          myStatus: "Assigned",
          status: "Active",
          createdBy: "Joe Bloggs",
          created: "2017-04-23T18:00:00.000Z",
          updated: (new Date(Date.now())).toJSON(),
          numberOfComments: 12
        },
        {
          title: "Test PR 6",
          myStatus: "Assigned",
          status: "Active",
          createdBy: "Joe Bloggs",
          created: "2010-04-23T18:00:00.000Z",
          updated: (new Date(Date.now())).toJSON(),
          numberOfComments: 0
        },
        {
          title: "Test PR 7",
          myStatus: "Assigned",
          status: "Active",
          createdBy: "Joe Bloggs",
          created: "2012-04-23T18:00:00.000Z",
          updated: "2017-04-24T18:00:00.000Z",
          numberOfComments: 10
        },
        {
          title: "Test PR 8",
          myStatus: "Assigned",
          status: "Active",
          createdBy: "Joe Bloggs",
          created: "2017-04-23T18:00:00.000Z",
          updated: (new Date(Date.now())).toJSON(),
          numberOfComments: 12
        }
      ]
    };
  }

  public componentDidMount(): void {
    if(this._repoContent) {
      this.setState({
        chartsMinimized: this._repoContent.clientHeight < 330
      });
    }
  }

  public render(): JSX.Element {
    return <div className={`repo ${this.state.collapsed && "collapsed"}`}>
      <RepoHeader
        name={this.props.name}
        onToggleVisibility={this.onToggleVisibility}
        collapsed={this.state.collapsed}
        pullRequestCount={this.state.pullRequests.length}
        needsAttention={true}
      />
      {!this.state.collapsed &&
      <div className="repoContent" ref={(element) => this._repoContent = element}>
        <div className="pullRequestContainer">
          <PullRequestList pullRequests={this.state.pullRequests} />
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
    this.setState((previousState) => ({
      collapsed: !previousState.collapsed
    }));
  }
}
