import "../styles/settingsArea.less";

import * as Preferences from "../api/Preferences";
import * as React from "react";
import * as VsoApi from "../api/VsoApi";

import {Icon, getIcon} from "../icons";

import { FilteredMultiSelect } from "./FilteredMultiSelect";
import { IPreferences } from "../../../server/src/IPreferences";
import { IRepository } from "../api/models/IRepository";
import { IRepositoryPreference } from "../../../server/src/IRepositoryPreference";
import { SortColumns } from "../../../server/src/SortColumns";

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
    const selectedRepos: IRepository[] = [];
    if (this.state.preferences && this.state.preferences.repositoryPreferences && this.state.preferences.repositoryPreferences.length > 0) {
      this.state.preferences.repositoryPreferences.forEach(p => {
        const foundRepo: IRepository | undefined = repos.find(r => r.id === p.repositoryId);
        if (foundRepo) {
          selectedRepos.push(foundRepo);
        }
      });
    }

    this.setState({
      availableRepos: repos.sort((a: IRepository, b: IRepository) => {
        return a.name > b.name ? 1 : -1;
      }),
      selectedRepos: selectedRepos
    });
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
      <h2>Repositories</h2>
      <div>
        <FilteredMultiSelect
          defaultFilter=""
          textProp="name"
          valueProp="name"
          placeholder="Search for a repo..."
          size={15}
          options={this.state.availableRepos}
          selectedOptions={this.state.selectedRepos}
          onChange={this._handleSelectionChange} />
        {/* {this.state.preferences && this.state.preferences.repositoryPreferences && this.state.preferences.repositoryPreferences.map(repo => <div key={repo.repositoryId}>{JSON.stringify(repo)}</div>)} */}
      </div>
      <div>
        <h3>Selected Repositories</h3>
        {this.state.selectedRepos.length === 0 && "No repositories selected"}
        {this.state.selectedRepos.length > 0 &&
          this.state.selectedRepos.map((r, i) => <ul>
            {r.name}
            <span className="clickable" onClick={() => this._handleDeselect(i)} title="Delete">
              {getIcon(Icon.trash)}
            </span>
          </ul>)}
      </div>
      <button className="primary" onClick={this._onSave}>Save</button>
    </div>;
  }

  private _onSave = (): void => {
    if (this.state.preferences) {
      const preferences: IPreferences = this.state.preferences;
      preferences.repositoryPreferences = this.state.selectedRepos.map(this._convertToRepositoryPreference);
      Preferences.savePreferences(preferences).then(() => alert("Saved!"));
      this.setState({ preferences: preferences });
    }
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

  private _handleDeselect(index: number): void {
    let selectedRepos: IRepository[] = this.state.selectedRepos.slice();
    selectedRepos.splice(index, 1);
    this.setState({ selectedRepos: selectedRepos });
  }

  private _handleSelectionChange = (selections: IRepository[]) => {
    selections.sort((a, b) => a.name > b.name ? 1 : -1);
    this.setState({ selectedRepos: selections });
  }

  private _convertToRepositoryPreference(repo: IRepository): IRepositoryPreference {
    return {
      repositoryId: repo.id,
      justMine: true,
      isMinimized: false,
      sortPreferences: [{ column: SortColumns.title, isAscending: true, precedence: 0 }]
    };
  }
}
