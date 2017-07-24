import * as React from "react";

import {PullRequestList} from "./PullRequestList";
import {RepoChartContainer} from "./RepoChartContainer";
import {RepoHeader} from "./RepoHeader";

export class Repo extends React.Component {
  public render(): JSX.Element {
    return <div>
      <RepoHeader />
      <PullRequestList />
      <RepoChartContainer />
    </div>;
  }
}
