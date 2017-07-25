import "../styles/pullRequest.less";

import * as React from "react";
import * as moment from "moment";

import {getIcon, Icon} from "../icons";

declare type Properties = {
  title: string,
  myStatus: string,
  status: string,
  createdBy: string,
  created: string,
  updated: string,
  numberOfComments: number;
};

export class PullRequest extends React.Component<Properties, { needsAttention: boolean }> {
  constructor() {
    super();

    this.state = {
      needsAttention: false
    };
  }

  public componentDidMount(): void {
    this.setState({
      needsAttention: moment(moment.now()).diff(moment(this.props.updated), "h") > 3
    });
  }

  public render(): JSX.Element {
    return <tr className={`pullRequest ${this.state.needsAttention && "needsAttention"}`}>
      <td>
        {this.state.needsAttention && getIcon(Icon.warning)}
      </td>
      <td>
        <div className="comments">
          {getIcon(Icon.message)}
          {this.props.numberOfComments}
        </div>
      </td>
      <td>{this.props.title}</td>
      <td>{this.props.myStatus}</td>
      <td>{this.props.status}</td>
      <td>{this.props.createdBy}</td>
      <td>{moment(this.props.created).fromNow()}</td>
      <td>{moment(this.props.updated).fromNow()}</td>
      <td>
        <div className="quickActions clickable">
          {getIcon(Icon.mail)}
        </div>
      </td>
    </tr>;
  }
}
