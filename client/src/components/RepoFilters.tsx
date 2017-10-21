import "./RepoFilters.less";

import * as React from "react";

import { Toggle } from 'office-ui-fabric-react';

export enum RepoFilter {
  mine,
  everyones
}

export class RepoFilters extends React.Component<{currentFilter: RepoFilter, onFilterChanged: (newFilter: RepoFilter) => void}> {
  public render(): JSX.Element {
    return <div className="repoFilters">
      <Toggle
        defaultChecked={this.props.currentFilter === RepoFilter.mine}
        onText="mine"
        offText="everyones"
        onChanged={(mine) => this.props.onFilterChanged(mine ? RepoFilter.mine : RepoFilter.everyones)}
      />
    </div>;
  }
}
