import "../styles/pullRequestList.less";

import * as React from "react";

import {PullRequest} from "./PullRequest";
import {IPullRequest} from "../api/models/IPullRequest";
import {IProfile} from "../api/models/IProfile";

export class PullRequestList extends React.Component<{pullRequests: IPullRequest[], userProfile: IProfile | null}> {
  public render(): JSX.Element {
    return <table className="pullRequestList">
      <thead>
        <tr>
          <th style={{width: "25px"}}></th>
          <th style={{width: "50px"}}></th>
          <th>Title</th>
          <th style={{width: "100px"}}>My Status</th>
          <th style={{width: "100px"}}>Status</th>
          <th style={{width: "200px"}}>Created by</th>
          <th style={{width: "150px"}}>Created</th>
          <th style={{width: "150px"}}>Updated</th>
          <th style={{width: "25px"}}></th>
        </tr>
      </thead>
      <tbody>
        {this.props.pullRequests.map(pullRequest => <PullRequest
          key={pullRequest.pullRequestId}
          repositoryId={pullRequest.repository.id}
          id={pullRequest.pullRequestId}
          title={pullRequest.title}
          myStatus="Assigned"
          status={pullRequest.status}
          createdBy={pullRequest.createdBy}
          created={pullRequest.creationDate}
          updated={pullRequest.updated}
          numberOfComments={5}
          userProfile={this.props.userProfile}
          />)}
      </tbody>
    </table>;
  }
}
