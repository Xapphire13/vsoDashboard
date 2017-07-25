import "../styles/repo.less";

import * as React from "react";

import {PullRequestList} from "./PullRequestList";
import {RepoChartContainer} from "./RepoChartContainer";
import {RepoHeader} from "./RepoHeader";

export class Repo extends React.Component<{name: string}, {}> {
  public render(): JSX.Element {
    return <div className="repo">
      <RepoHeader name={this.props.name}/>
      <div className="repoContent">
        <PullRequestList />
        <RepoChartContainer />
      </div>
    </div>;
  }
}
