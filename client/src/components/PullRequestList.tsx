import "../styles/pullRequestList.less";

import * as React from "react";

import {PullRequest} from "./PullRequest";

export class PullRequestList extends React.Component {
  public render(): JSX.Element {
    const pullRequests = [
      {
        title: "Test PR",
        myStatus: "Assigned",
        status: "Active",
        createBy: "Joe Bloggs",
        created: "2017-04-23T18:00:00.000Z",
        updated: "2012-04-24T18:00:00.000Z",
        numberOfComments: 10
      },
      {
        title: "Test PR 2",
        myStatus: "Assigned",
        status: "Active",
        createBy: "Joe Bloggs",
        created: "2017-04-23T18:00:00.000Z",
        updated: "2012-04-24T18:00:00.000Z",
        numberOfComments: 12
      },
      {
        title: "Test PR 3",
        myStatus: "Assigned",
        status: "Active",
        createBy: "Joe Bloggs",
        created: "2017-04-23T18:00:00.000Z",
        updated: "2012-04-24T18:00:00.000Z",
        numberOfComments: 0
      },
    ];

    return <div className="pullRequestList">
      <div className="columnHeader first">Title</div>
      <div className="columnHeader">My Status</div>
      <div className="columnHeader">Status</div>
      <div className="columnHeader">Created by</div>
      <div className="columnHeader">Created</div>
      <div className="columnHeader">Updated</div>
      {pullRequests.map(pullRequest => <PullRequest
          title={pullRequest.title}
          myStatus={pullRequest.myStatus}
          status={pullRequest.status}
          createBy={pullRequest.status}
          created={pullRequest.created}
          updated={pullRequest.updated}
          numberOfComments={pullRequest.numberOfComments}
        />)}
    </div>;
  }
}
