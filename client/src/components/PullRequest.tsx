import "../PullRequest.less";

import * as React from "react";
import * as moment from "moment";

import {getIcon, Icon} from "../icons";
import {IProfile} from "../api/models/IProfile";
import {IPullRequest} from "../api/models/IPullRequest";

declare type Properties = {
  userProfile: IProfile | null;
  pullRequest: IPullRequest;
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
      needsAttention: moment(moment.now()).diff(moment(this.props.pullRequest.updated), "h") > 3
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
          {this.props.pullRequest.commentCount}
        </div>
      </td>
      <td className="clickable" onClick={() => {this._openPrInVso()}}>{this.props.pullRequest.title}</td>
      <td>assigned</td>
      <td>{this.props.pullRequest.status}</td>
      <td>{this.props.pullRequest.createdBy.displayName}</td>
      <td>{moment(this.props.pullRequest.creationDate).fromNow()}</td>
      <td>{moment(this.props.pullRequest.updated).fromNow()}</td>
      <td>
        <div
          className="quickActions clickable"
          onClick={() => {
            location.assign(`mailto:${this.props.pullRequest.createdBy.uniqueName}?subject=${encodeURIComponent(`Pull Request: ${this.props.pullRequest.title}`)}&body=${encodeURIComponent(`Hi ${this.props.pullRequest.createdBy.displayName.split(" ")[0]},\n\nI am emailing about the following pull request ${this._getVsoUrl()}\n\nThanks,\n${this.props.userProfile && this.props.userProfile.displayName.split(" ")[0]}`)}`);
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
    return `https://msazure.visualstudio.com/One/_git/${this.props.pullRequest.repository.id}/pullrequest/${this.props.pullRequest.pullRequestId}`;
  }
}
