import "../Login.less";

import * as React from "react";
import * as ClientOAuthHelpers from "../ClientOAuthHelpers";

export class Login extends React.Component<{}> {
  private _callbackUrl = "https://vsodash.azurewebsites.net/auth";
  private _clientId = "84958C8E-BA1F-4752-A102-6AD1005BDC1F";
  private _scopes = [
    "vso.build",
    "vso.chat_write",
    "vso.code_write",
    "vso.dashboards_manage",
    "vso.identity",
    "vso.notification",
    "vso.project_write",
    "vso.taskgroups",
    "vso.test",
    "vso.work_write",
    "vso.workitemsearch"
  ];

  public render(): JSX.Element {
    return <div className="login">
      <p>You are not logged in</p>
      <button type="button" onClick={this._handleClick}>Login!</button>
    </div>;
  }

  private _handleClick = (event: React.FormEvent<HTMLButtonElement>): void => {
      event.preventDefault();
      const state = window.location.host === "127.0.0.1" ? "local" : "prod";
      ClientOAuthHelpers.getAccessCode(this._clientId, state, this._scopes, this._callbackUrl); // This redirects the browser
  }
}
