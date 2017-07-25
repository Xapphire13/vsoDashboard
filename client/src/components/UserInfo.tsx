import "../styles/userInfo.less";

import * as React from "react";

export class UserInfo extends React.Component<{userName: string}, {}> {
  public render(): JSX.Element {
    return <div className="userInfo">
      <div className="userName">Welcome {this.props.userName}</div>
      <div className="imagebox">
        <img className="img-circle" height="50" width="50" src="http://st2.depositphotos.com/5266903/8896/v/170/depositphotos_88963748-stock-illustration-hands-up-person-icon.jpg" />
      </div>
    </div>;
  }
}
