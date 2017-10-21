import "../RepoList.less";

import * as React from "react";

import {Repo} from "./Repo";
import {IPreferences} from "../../../server/src/IPreferences";
import {IRepositoryPreference} from "../../../server/src/IRepositoryPreference";
import {IProfile} from "../api/models/IProfile";

declare type Props = {
  preferences: IPreferences | null;
  userProfile: IProfile | null;
}

declare type State = {
  repos: IRepositoryPreference[];
}

export class RepoList extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = {
      repos: this.props.preferences && this.props.preferences.repositoryPreferences ? this.props.preferences.repositoryPreferences : []
    };
  }

  public componentWillReceiveProps(props: Props): void {
    this.setState({
      repos: props.preferences && props.preferences.repositoryPreferences ? props.preferences.repositoryPreferences : []
    });
  }

  public render(): JSX.Element {
    const repos: JSX.Element[] = this.state.repos.map(repoPreference =>
      <Repo
        key={repoPreference.repositoryId}
        id={repoPreference.repositoryId}
        userProfile={this.props.userProfile}
        collapsed={repoPreference.isMinimized}
        onToggleCollapse={this._toggleCollapsed}
      />
    );

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
    // const newRepos: IRepo[] = this.state.repos.map(r => { return { id: r.id, name: r.name, collapsed: collapse}; });
    // this.setState({repos: newRepos});
    this.state.repos.forEach(repo => repo.isMinimized = collapse)
    this.setState({});
  }

  private _toggleCollapsed = (id: string) => {
    const repo = this.state.repos.find(repo => repo.repositoryId === id);

    if (repo) {
      repo.isMinimized = !repo.isMinimized;
      this.setState({});
    }
  }
}
