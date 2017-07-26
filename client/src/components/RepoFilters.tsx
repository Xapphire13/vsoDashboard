import "../styles/repoFilters.less";

import * as React from "react";

export enum RepoFilter {
  mine,
  everyones
}

export class RepoFilters extends React.Component<{currentFilter: RepoFilter, onFilterChanged: (newFilter: RepoFilter) => void}> {
  public render(): JSX.Element {
    return <div className="repoFilters">
      Filter by:
      <button
        className={this.props.currentFilter === RepoFilter.mine ? "selected" : ""}
        onClick={() => this.props.onFilterChanged(RepoFilter.mine)}>Mine</button>
      <button
        className={this.props.currentFilter === RepoFilter.everyones ? "selected" : ""}
        onClick={() => this.props.onFilterChanged(RepoFilter.everyones)}>Everyones</button>
    </div>;
  }
}
