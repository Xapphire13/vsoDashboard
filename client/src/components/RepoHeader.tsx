import "../styles/repoHeader.less";

import * as React from "react";

export class RepoHeader extends React.Component<{name: string}, {}> {
  public render(): JSX.Element {
    return <div className="repoHeader">
      <span>&#x25E2;</span>
      <h4>{this.props.name}</h4>
     </div>;
  }
}
