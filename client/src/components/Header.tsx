import "./Header.less";

import * as React from "react";

import { IProfile } from "../api/models/IProfile";
import { Icon } from 'office-ui-fabric-react';
import { MainMenu } from "./MainMenu";
import { UserInfo } from "./UserInfo";

export class Header extends React.Component<{ onSelectedChanged(item: string): void, userProfile: IProfile | null}, {}> {
  public render(): JSX.Element {
    return <div className="header">
      <Icon className="logo" iconName="VSTSLogo" />
      <div className="content">
        <div className="title">
          <h2>VSO Dashboard</h2>
        </div>
        <MainMenu onSelectedChanged={this.props.onSelectedChanged} />
      </div>
      <UserInfo userProfile={this.props.userProfile}/>
    </div>;
  }
}
