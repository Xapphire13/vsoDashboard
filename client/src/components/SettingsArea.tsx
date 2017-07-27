import "../styles/settingsArea.less";

import * as Preferences from "../api/Preferences";
import * as React from "react";
import * as VsoApi from "../api/VsoApi";

import { FilteredMultiSelect } from "./FilteredMultiSelect";
import { IPreferences } from "../../../server/src/IPreferences";
import { IRepository } from "../api/models/IRepository";

declare type Props = {
  preferences: IPreferences | null
};

declare type State = {
  preferences: IPreferences | null
  availableRepos: IRepository[],
  selectedRepos: IRepository[]
};

export class SettingsArea extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      preferences: props.preferences,
      availableRepos: [],
      selectedRepos: []
    };
  }

  public async componentDidMount(): Promise<void> {
    const repos: IRepository[] = await VsoApi.listRepositories();

    this.setState({ availableRepos: repos });
  }

  public componentWillReceiveProps(nextProps: Props): void {
    this.setState({
      preferences: nextProps.preferences
    });
  }

  public render(): JSX.Element {
    return <div className="settingsArea">
      <h2>Settings</h2>
      <label className="setting">
        Refresh Interval (seconds)
        <input
          type="number"
          min="1" value={this.state.preferences ? this.state.preferences.pollIntervalInSeconds : NaN}
          onChange={(e) => this._handleInput("pollIntervalInSeconds", e)} />
      </label>
      <label className="setting">
        Stale threshold (minutes)
        <input
          type="number"
          min="1"
          value={this.state.preferences ? this.state.preferences.staleThresholdInMinutes : NaN}
          onChange={(e) => this._handleInput("staleThresholdInMinutes", e)} />
      </label>
      <button className="primary" onClick={() => this.state.preferences && Preferences.savePreferences(this.state.preferences).then(() => alert("Saved!"))}>Save</button>
      <h3>Repositories</h3>
      <div>
        <FilteredMultiSelect
          defaultFilter=""
          textProp="name"
          valueProp="name"
          size="15"
          options={this.state.availableRepos.sort((a: IRepository, b: IRepository) => {
            return a.name > b.name ? 1 : -1;
          })}
          selectedOptions={this.state.selectedRepos}
          onChange={this._handleSelectionChange} />
        {this.state.preferences && this.state.preferences.repositoryPreferences && this.state.preferences.repositoryPreferences.map(repo => <div key={repo.repositoryId}>{JSON.stringify(repo)}</div>)}
      </div>
      <div>
        {this.state.selectedRepos.length === 0 && "No repositories selected"}
        {this.state.selectedRepos.length > 0 && this.state.selectedRepos.map(r => <ul>{r.name}</ul>)}
      </div>
    </div>;
  }

  private _handleInput = (key: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (this.state.preferences) {
      const preferences: IPreferences & { [key: string]: any } = this.state.preferences;
      preferences[key] = +event.target.value;

      this.setState({
        preferences
      });
    }
  }

  private _handleSelectionChange = (selections: IRepository[]) => {
    selections.sort((a, b) => a.name > b.name ? 1 : -1);
    this.setState({ selectedRepos: selections });
  }
}
