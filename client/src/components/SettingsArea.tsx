import "../styles/settingsArea.less";

const debounce: <A extends Function>(f: A, interval?: number, immediate?: boolean) => A & { clear(): void; }  = require("debounce");

import * as Preferences from "../api/Preferences";
import * as React from "react";
import * as VsoApi from "../api/VsoApi";

import { Checkbox, Label, List, MessageBar, MessageBarType, TextField } from 'office-ui-fabric-react';

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
  selectedRepos: Set<IRepository>,
  filteredRepos: IRepository[],
  statusMessage?: {text: string, messageType: MessageBarType } | null
};

export class SettingsArea extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      preferences: props.preferences,
      availableRepos: [],
      selectedRepos: new Set(),
      filteredRepos: []
    };
  }

  public async componentDidMount(): Promise<void> {
    const repos: IRepository[] = await VsoApi.listRepositories();
    const selectedRepos = new Set<IRepository>();
    if (this.state.preferences && this.state.preferences.repositoryPreferences && this.state.preferences.repositoryPreferences.length > 0) {
      this.state.preferences.repositoryPreferences.forEach(p => {
        const foundRepo: IRepository | undefined = repos.find(r => r.id === p.repositoryId);
        if (foundRepo) {
          selectedRepos.add(foundRepo)
        }
      });
    }

    const availableRepos = repos.sort((left, right) => this.compareRepos(left, right, selectedRepos));
    this.setState({
      availableRepos,
      selectedRepos,
      filteredRepos: availableRepos
    });
  }

  public componentWillReceiveProps(nextProps: Props): void {
    this.setState({
      preferences: nextProps.preferences
    });
  }

  public render(): JSX.Element {
    return <div className="settingsArea">
      {this.state.statusMessage && <MessageBar messageBarType={this.state.statusMessage.messageType}>
        {this.state.statusMessage.text}
      </MessageBar>}
      <div className="settingsArea-content">
        <TextField
          label="Refresh Interval (seconds)"
          value={this.state.preferences ? `${this.state.preferences.pollIntervalInSeconds}` : ""}
          onChanged={(val) => this._handleInput("pollIntervalInSeconds", +val)}
        />
        <TextField
          label="Stale threshold (minutes)"
          value={this.state.preferences ? `${this.state.preferences.staleThresholdInMinutes}` : ""}
          onChanged={(val) => this._handleInput("staleThresholdInMinutes", +val)}
        />
        <Label>Repositories</Label>
        <div>
          <TextField
            placeholder="Search for a repo..."
            iconProps={{
              iconName: "Clear",
              onClick: () => alert("Clear!")
            }}
            onChanged={(value) => {
              const filteredRepos = this.state.availableRepos
              .filter(repo => repo.name.toLowerCase().match(value))
              .sort((left, right) => this.compareRepos(left, right, this.state.selectedRepos));

              this.setState({filteredRepos});
            }}
          />
          <div className="listContainer">
            <List
              items={this.state.filteredRepos}
              getKey={(item) => item.id}
              onRenderCell={(item) => this.renderRepo(item)}
            />
          </div>
        </div>
      </div>
    </div>;
  }

  private renderRepo = (repo: IRepository): JSX.Element => {
    return <div>
      <Checkbox
        label={repo.name}
        defaultChecked={this.state.selectedRepos.has(repo)}
        onChange={(_, isChecked) => {
          if (isChecked) {
            this.state.selectedRepos.add(repo);
          } else {
            this.state.selectedRepos.delete(repo);
          }

          this.setState({
            filteredRepos: this.state.filteredRepos.sort((left, right) => this.compareRepos(left, right, this.state.selectedRepos))
          });

          this.savePreferences();
        }}
      />
    </div>
  }

  private savePreferences = debounce((): void => {
    if (this.state.preferences) {
      const preferences: IPreferences = this.state.preferences;
      preferences.repositoryPreferences = [...this.state.selectedRepos].map(this._convertToRepositoryPreference);
      Preferences.savePreferences(preferences).then(() => {
        this.setState({
          statusMessage: {
            text: "Saved!",
            messageType: MessageBarType.success
          }
        });

        setTimeout(() => {
          this.setState({
            statusMessage: null
          });
        }, 3000);
      });
    }
  }, 2000);

  private _handleInput = (key: string, value: number) => {
    if (!isNaN(value) && value > 0 && this.state.preferences) {
      const preferences: IPreferences & { [key: string]: any } = this.state.preferences;
      preferences[key] = value;

      this.setState({
        preferences
      });

      this.savePreferences();
    }
  }

  private _convertToRepositoryPreference(repo: IRepository): IRepositoryPreference {
    return {
      repositoryId: repo.id,
      justMine: true,
      isMinimized: false,
      sortPreferences: [{ column: SortColumns.title, isAscending: true, precedence: 0 }]
    };
  }

  private compareRepos = (left: IRepository, right: IRepository, selectedRepos: Set<IRepository>): number => {
    const leftIsSelected = selectedRepos.has(left);
    const rightIsSelected = selectedRepos.has(right);

    // selected takes precedence, so if they differ we don't need to compare name
    if (leftIsSelected !== rightIsSelected) {
      return leftIsSelected ? -1 : 1;
    }

    return left.name > right.name ? 1 : -1;
  }
}
