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
};

export class PullRequest extends React.Component<Propeties, {}> {
  public render(): JSX.Element {
    return <tr className="pullRequest">
      <td>{this.props.numberOfComments}</td>
      <td>{this.props.title}</td>
      <td>{this.props.myStatus}</td>
      <td>{this.props.status}</td>
      <td>{this.props.createBy}</td>
      <td>{this.props.created}</td>
      <td>{this.props.updated}</td>
    </tr>;
  }
}
