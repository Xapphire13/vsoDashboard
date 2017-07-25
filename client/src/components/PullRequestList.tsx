import "../styles/pullRequestList.less";

import * as React from "react";

import {PullRequest} from "./PullRequest";

export class PullRequestList extends React.Component<{pullRequests: any[]}> {
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
          key={pullRequest.title}
          title={pullRequest.title}
          myStatus={pullRequest.myStatus}
          status={pullRequest.status}
          createdBy={pullRequest.createdBy}
          created={pullRequest.created}
          updated={pullRequest.updated}
          numberOfComments={pullRequest.numberOfComments}
          />)}
      </tbody>
    </table>;
  }
}
