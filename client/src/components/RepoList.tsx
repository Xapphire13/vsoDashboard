import * as React from "react";

import {RepoContainer} from './RepoContainer';

export class RepoList extends React.Component {
  public render(): JSX.Element {
    const repos: JSX.Element[] = [];
    repos.push(<RepoContainer/>);
    repos.push(<RepoContainer/>);

    return <div>
      {repos}
    </div>;
  }
}
