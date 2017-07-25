import "../styles/pullRequest.less";

import * as React from "react";

declare type Propeties = {
  title: string,
  myStatus: string,
  status: string,
  createBy: string,
  created: string,
  updated: string,
  numberOfComments: number;
}

export class PullRequest extends React.Component<Propeties, {}> {
  public render(): JSX.Element {
    return <div className="pullRequest">
      <div className="cell">{this.props.numberOfComments}</div>
      <div className="cell">{this.props.title}</div>
      <div className="cell">{this.props.myStatus}</div>
      <div className="cell">{this.props.status}</div>
      <div className="cell">{this.props.createBy}</div>
      <div className="cell">{this.props.created}</div>
      <div className="cell">{this.props.updated}</div>
    </div>;
  }
}
