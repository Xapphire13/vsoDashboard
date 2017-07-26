import "../styles/repoList.less";

import * as React from "react";

import { Repo } from "./Repo";

interface IState {
  repos: IRepo[];
}

interface IRepo {
  id: string;
  name: string;
  collapsed: boolean;
}

export class RepoList extends React.Component<{}, IState> {
  public constructor() {
    super();

    this.state = {
      repos: [{ id: "1", name: "Test Repo", collapsed: false },
      { id: "2", name: "Super cool repo", collapsed: false }]
    };
  }

  public render(): JSX.Element {
    const repos: JSX.Element[] = this.state.repos.map(r => <Repo key={r.id} id={r.id} name={r.name} collapsed={r.collapsed} onToggleCollapse={this._toggleCollapsed} />);

    return <div className="repoList">
      <div className="expandCollapse"><a className="expandCollapseLink" onClick={this._expandAll}>Expand all</a> | <a className="expandCollapseLink" onClick={this._collapseAll}>Collapse All</a></div>
      {repos}
    </div>;
  }

  private _expandAll = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    this._setCollapsed(event, false);
  }

  private _collapseAll = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    this._setCollapsed(event, true);
  }

  private _setCollapsed = (event: React.MouseEvent<HTMLAnchorElement>, collapse: boolean): void => {
    event.preventDefault();
    const newRepos:IRepo[] = this.state.repos.map(r => { return { id: r.id, name: r.name, collapsed: collapse}; });
    this.setState({repos: newRepos});
  }

  private _toggleCollapsed = (id: string) => {
    const repo = this.state.repos.find(r => r.id === id);

    if (repo) {
      repo.collapsed = !repo.collapsed;
      this.setState({repos: this.state.repos});
    }
  }
}
