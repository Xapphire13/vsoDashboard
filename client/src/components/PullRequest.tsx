import "../styles/pullRequest.less";

import * as React from "react";
import * as moment from "moment";

import {getIcon, Icon} from "../icons";
import {IUser} from "../api/models/IUser";
import {IProfile} from "../api/models/IProfile";

declare type Properties = {
  userProfile: IProfile | null;
  id: number,
  repositoryId: string,
  title: string,
  myStatus: string,
  status: string,
  createdBy: IUser,
  created: string,
  updated: string,
  numberOfComments: number
};

export class PullRequest extends React.Component<Properties, { needsAttention: boolean }> {
  constructor() {
    super();

    this.state = {
      needsAttention: false
    };
  }

  public async componentDidMount(): Promise<void> {
    this.setState({
      needsAttention: moment(moment.now()).diff(moment(this.props.updated), "h") > 3
    });
  }

  public render(): JSX.Element {
    return <tr className={`pullRequest ${this.state.needsAttention && "needsAttention"}`}>
      <td>
        {this.state.needsAttention && <span title="Needs attention">
          {getIcon(Icon.warning)}
        </span>}
      </td>
      <td>
        <div className="comments">
          {getIcon(Icon.message)}
          {this.props.numberOfComments}
        </div>
      </td>
      <td className="clickable" onClick={() => {this._openPrInVso()}}>{this.props.title}</td>
      <td>{this.props.myStatus}</td>
      <td>{this.props.status}</td>
      <td>{this.props.createdBy.displayName}</td>
      <td>{moment(this.props.created).fromNow()}</td>
      <td>{moment(this.props.updated).fromNow()}</td>
      <td>
        <div
          className="quickActions clickable"
          onClick={() => {
            location.assign(`mailto:${this.props.createdBy.uniqueName}?subject=${encodeURIComponent(`Pull Request: ${this.props.title}`)}&body=${encodeURIComponent(`Hi ${this.props.createdBy.displayName.split(" ")[0]},\n\nI am emailing about the following pull request ${this._getVsoUrl()}\n\nThanks,\n${this.props.userProfile && this.props.userProfile.displayName.split(" ")[0]}`)}`);
          }}>
          <span title="Send email">
            {getIcon(Icon.mail)}
          </span>
        </div>
      </td>
    </tr>;
  }

  private _openPrInVso(): void {
    window.open(this._getVsoUrl(), "_blank");
  }

  private _getVsoUrl(): string {
    return `https://msazure.visualstudio.com/One/_git/${this.props.repositoryId}/pullrequest/${this.props.id}`;
  }
}
