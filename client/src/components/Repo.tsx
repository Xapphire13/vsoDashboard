import "../styles/repo.less";

import * as React from "react";

import {PullRequestList} from "./PullRequestList";
import {RepoChartContainer} from "./RepoChartContainer";
import {RepoHeader} from "./RepoHeader";

export class Repo extends React.Component<{name: string}, {collapsed: boolean, pullRequests: any[]}> {
  constructor() {
    super();

    this.state = {
      collapsed: false,
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
      ]
    };
  }

  public render(): JSX.Element {
    return <div className={`repo ${this.state.collapsed && "collapsed"}`}>
      <RepoHeader
        name={this.props.name}
        onToggleVisibility={this.onToggleVisibility}
        collapsed={this.state.collapsed}
        pullRequestCount={this.state.pullRequests.length}
      />
      {!this.state.collapsed &&
      <div className="repoContent">
        <PullRequestList pullRequests={this.state.pullRequests} />
        <RepoChartContainer />
      </div>}
    </div>;
  }

  public onToggleVisibility = (): void => {
    this.setState((previousState) => ({
      collapsed: !previousState.collapsed
    }));
  }
}
