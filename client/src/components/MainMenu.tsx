import "./MainMenu.less";

import * as React from "react";

import autobind from "autobind-decorator";

import {Panel, PanelType} from 'office-ui-fabric-react';
import {SettingsArea} from "./SettingsArea";
import {IPreferences} from "../../../server/src/IPreferences";

declare type Props = {
  onSelectedChanged(item: string): void;
  preferences: IPreferences | null;
  onPreferencesSaved(preferences: IPreferences): Promise<void>;
};

export class MainMenu extends React.Component<Props, { selectedItem: string, settingsOpen: boolean }> {
  private _menuItems: { [key: string]: string } = {
    "pullRequests": "Pull Requests",
    "workItems": "Work Items",
    "settings": "Settings"
  };

  public constructor() {
    super();

    this.state = {
      selectedItem: "pullRequests",
      settingsOpen: false
    };
  }

  public render(): JSX.Element {
    return <span>
      <ul className="mainMenu">
        <svg height="0" width="0">
          <defs>
              <linearGradient id="gradient">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="white" stopOpacity="75"/>
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
        </svg>
        {Object.keys(this._menuItems).map((item, index) => <li key={index}>
          <a className={item === this.state.selectedItem ? "selected" : ""} onClick={(e) => { this.handleClick(e); this.processMenuChange(item); }}>
            {this._menuItems[item]}
          </a>
          <svg className={`caret ${item === this.state.selectedItem ? "selected" : ""}`}>
            <polygon points="45 7 50 0 55 7" fill="#242424" strokeWidth="0" />
            <polyline points="0 6, 45 6, 50 0, 55 6, 100 6"
              stroke="url(#gradient)" strokeWidth="0.75" strokeLinejoin="miter" strokeLinecap="butt"
              fill="transparent"/>
          </svg>
        </li>)}
      </ul>
      <Panel
        headerClassName="mainMenu-header"
        isOpen={this.state.settingsOpen}
        onDismiss={() => {this.setState({settingsOpen: false})}}
        type={PanelType.medium}
        headerText="Settings"
        isLightDismiss={true}
      >
        <SettingsArea
          preferences={this.props.preferences}
          onSaved={async (preferences) => {await this.props.onPreferencesSaved(preferences); this.setState({settingsOpen: false})}}
        />
      </Panel>
    </span>;
  }

  @autobind
  private handleClick(event: React.MouseEvent<HTMLAnchorElement>): void {
    event.preventDefault();
  }

  @autobind
  private processMenuChange(item: string): void {
    if (item === "settings") {
      this.setState({settingsOpen: true});
      return;
    }

    if (this.state.selectedItem !== item) {
      this.setState({ selectedItem: item });
      this.props.onSelectedChanged(item);
    }
  }
}
