import "./RepoHeader.less";

import * as React from "react";

import {Icon} from 'office-ui-fabric-react';

declare type Properties = {
  name: string,
  onToggleVisibility: () => void,
  collapsed: boolean,
  pullRequestCount: number,
  needsAttention: boolean
};

export class RepoHeader extends React.Component<Properties, {}> {
  public render(): JSX.Element {
    return <div className="repoHeader">
      <span className="toggleButton" onClick={this.props.onToggleVisibility}>
        {this.props.collapsed ? String.fromCharCode(0x25B6) : String.fromCharCode(0x25E2)}
      </span>
      <h4>{this.props.name}</h4>
      {this.props.collapsed && <div className="repoStats">
        {this.props.needsAttention && [<Icon className="repoHeader-icon" iconName="Warning"/>, <h4 className="needsAttention">Needs Attention</h4>]}
        <h4 className="repoHeader-pullRequestCount">{`${this.props.pullRequestCount} Total PR${this.props.pullRequestCount === 1 ? "" : "s"}`}</h4>
      </div>}
    </div>;
  }
}
