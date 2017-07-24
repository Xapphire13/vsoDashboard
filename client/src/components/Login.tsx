import "../styles/login.less";

import * as React from "react";

export class Login extends React.Component<{onLogin: () => void}, {}> {
  public render(): JSX.Element {
    return <div className="login">
      <p>You are not logged in</p>
      <button type="button" onClick={this._handleClick}>Login!</button>
    </div>;
  }

  private _handleClick = (event: React.FormEvent<HTMLButtonElement>): void => {
      event.preventDefault();
      this.props.onLogin();
  }
}
