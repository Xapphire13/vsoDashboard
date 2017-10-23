import "./Header.less";

import * as React from "react";

import {IPreferences} from "../../../server/src/IPreferences";
import {IProfile} from "../api/models/IProfile";
import {Icon} from 'office-ui-fabric-react';
import {MainMenu} from "./MainMenu";
import {UserInfo} from "./UserInfo";

declare type Props = {
  onSelectedChanged(item: string): void;
  userProfile: IProfile | null;
  preferences: IPreferences | null;
  onPreferencesSaved(preferences: IPreferences): Promise<void>;
};

export class Header extends React.Component<Props, {}> {
  public render(): JSX.Element {
    return <div className="header">
      <Icon className="logo" iconName="VSTSLogo" />
      <div className="content">
        <div className="title">
          <h2>VSO Dashboard</h2>
        </div>
        <MainMenu onSelectedChanged={this.props.onSelectedChanged} preferences={this.props.preferences} onPreferencesSaved={this.props.onPreferencesSaved}/>
      </div>
      <UserInfo userProfile={this.props.userProfile}/>
    </div>;
  }
}
