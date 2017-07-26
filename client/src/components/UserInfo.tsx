import "../styles/userInfo.less";

import * as React from "react";
import * as VsoApi from "../api/VsoApi";

export class UserInfo extends React.Component<{}, {userName: string}> {
  constructor() {
    super();

    this.state = {
      userName: ""
    };
  }

  public async componentDidMount(): Promise<void> {
    const userProfile = await VsoApi.fetchUserProfile();

    this.setState({
      userName: userProfile.displayName
    });
  }

  public render(): JSX.Element {
    return <div className="userInfo">
      <div className="userName">Welcome {this.state.userName}</div>
      <div className="imagebox">
        <img className="img-circle" height="50" width="50" src="http://st2.depositphotos.com/5266903/8896/v/170/depositphotos_88963748-stock-illustration-hands-up-person-icon.jpg" />
      </div>
    </div>;
  }
}
