import "../styles/pullRequestList.less";

import * as React from "react";

import {PullRequest} from "./PullRequest";

export class PullRequestList extends React.Component<{pullRequests: any[]}> {
  public render(): JSX.Element {
    return <table className="pullRequestList">
      <thead>
        <tr>
          <th></th>
          <th>Title</th>
          <th>My Status</th>
          <th>Status</th>
          <th>Created by</th>
          <th>Created</th>
          <th>Updated</th>
          <th style={{width: "100px"}}></th>
        </tr>
      </thead>
      <tbody>
        {this.props.pullRequests.map(pullRequest => <PullRequest
          key={pullRequest.title}
          title={pullRequest.title}
          myStatus={pullRequest.myStatus}
          status={pullRequest.status}
          createdBy={pullRequest.status}
          created={pullRequest.created}
          updated={pullRequest.updated}
          numberOfComments={pullRequest.numberOfComments}
          />)}
      </tbody>
    </table>;
  }
}
