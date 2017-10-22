import "./PullRequest.less";

import * as React from "react";
import * as moment from "moment";

import {getIcon, Icon} from "../icons";
import {IPreferences} from "../../../server/src/IPreferences";
import {IProfile} from "../api/models/IProfile";
import {IPullRequest} from "../api/models/IPullRequest";

declare type Properties = {
  userProfile: IProfile | null;
  pullRequest: IPullRequest;
  preferences: IPreferences | null;
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
      needsAttention: moment(moment.now()).diff(moment(this.props.pullRequest.updated), "minute") > (this.props.preferences ? this.props.preferences.staleThresholdInMinutes : 10080)
    });
  }

  public render(): JSX.Element {
    const {pullRequest} = this.props;

    return <div className={`pullRequest ${this.state.needsAttention && "needsAttention"}`}>
      <div className="pullRequest-comments">
        {getIcon(Icon.message)}
        <span>{this.props.pullRequest.commentCount}</span>
      </div>
      <div className="pullRequest-info">
        <div>
          <a className="pullRequest-repoName" href={this.getRepoUrl()} target="_blank">{pullRequest.repository.name}</a>
          <a className="pullRequest-title" href={this.getPrUrl()} target="_blank">{pullRequest.title}</a>
        </div>
        <div>{`#${pullRequest.pullRequestId} ${pullRequest.creationDate === pullRequest.updated ? "opened" : "updated"} ${moment(this.props.pullRequest.updated).fromNow()} by ${pullRequest.createdBy.displayName}`}</div>
      </div>
    </div>;

//     <div
//       className="quickActions clickable"
//       onClick={() => {
//         location.assign(`mailto:${this.props.pullRequest.createdBy.uniqueName}?subject=${encodeURIComponent(`Pull Request: ${this.props.pullRequest.title}`)}&body=${encodeURIComponent(`Hi ${this.props.pullRequest.createdBy.displayName.split(" ")[0]},\n\nI am emailing about the following pull request ${this._getVsoUrl()}\n\nThanks,\n${this.props.userProfile && this.props.userProfile.displayName.split(" ")[0]}`)}`);
//       }}>
//       <span title="Send email">
//         {getIcon(Icon.mail)}
//       </span>
//     </div>
  }

  private getRepoUrl(): string {
    return `https://msazure.visualstudio.com/One/_git/${this.props.pullRequest.repository.id}`;
  }

  private getPrUrl(): string {
    return `${this.getRepoUrl()}/pullrequest/${this.props.pullRequest.pullRequestId}`;
  }
}
