import "../styles/header.less";

import * as React from "react";

import { MainMenu } from "./MainMenu";
import { UserInfo } from "./UserInfo";

export class Header extends React.Component<{ userName:string, onSelectedChanged(item: string): void }, {}> {
  public render(): JSX.Element {
    return <div className="header">
      <div className="logo"></div>
      <div className="content">
        <div className="title">
          <h2>VSO Dashboard</h2>
        </div>
        <MainMenu onSelectedChanged={this.props.onSelectedChanged} />
      </div>
      <UserInfo userName={this.props.userName} />
    </div>;
  }
}
