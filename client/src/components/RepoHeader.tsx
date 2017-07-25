import "../styles/repoHeader.less";

import * as React from "react";

declare type Properties = {
  name: string,
  onToggleVisibility: () => void,
  collapsed: boolean
  pullRequestCount: number
};

export class RepoHeader extends React.Component<Properties, {}> {
  public render(): JSX.Element {
    return <div className="repoHeader">
      <span className="toggleButton" onClick={this.props.onToggleVisibility}>
        {this.props.collapsed ? String.fromCharCode(0x25B6) : String.fromCharCode(0x25E2)}
      </span>
      <h4>{this.props.name}</h4>
      {this.props.collapsed && <h4 className="pullRequestCount">{`${this.props.pullRequestCount} Total PR${this.props.pullRequestCount === 1 ? "" : "s"}`}</h4>}
     </div>;
  }
}
