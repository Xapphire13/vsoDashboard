import "../styles/app.less";

import * as ClientOAuthHelpers from "../ClientOAuthHelpers";
import * as React from "react";
import * as VsoApi from "../api/VsoApi";

import {Header} from "./Header";
import {IAccessToken} from "../../../server/src/IAccessToken"
import {IPreferences} from "../../../server/src/IPreferences";
import {Login} from "./Login";
import {PullRequestArea} from "./PullRequestArea";
import {SettingsArea} from "./SettingsArea";
import {WorkItemsArea} from "./WorkItemsArea";
import {IProfile} from "../api/models/IProfile";

declare type State = {
  isLoggedIn: boolean,
  selectedArea: string,
  accessToken : IAccessToken | null,
  preferences: IPreferences | null,
  userProfile: IProfile | null
};

export class App extends React.Component<{}, State> {
    private _preferenceUrl = "/preferences";

    constructor() {
        super();

        VsoApi.setRefreshFunction(this.resetAccessToken);
        let accessTokenString = localStorage.getItem("accessToken");
        let accessToken: IAccessToken | null = null;

        if (accessTokenString != undefined) {
            accessToken = JSON.parse(accessTokenString) as IAccessToken
            VsoApi.setAccessToken(accessToken);
        }

        this.state = {
            isLoggedIn: accessToken != undefined,
            selectedArea: "pullRequests",
            accessToken: accessToken,
            preferences: null,
            userProfile: null
        };
    }

    public async componentDidMount(): Promise<any> {
        if (this.state.accessToken != null) {
          const getPrefs = () => {
            return new Promise<IPreferences>((resolve, reject) => {
                $.ajax({
                    url: this._preferenceUrl,
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${this.state.accessToken && this.state.accessToken.access_token}`
                    }
                }).then(resolve, reject);
            });
          }

          let preferences: IPreferences;
          try{
            preferences = await getPrefs();
          } catch (err) {
            await this.resetAccessToken();
            preferences = await getPrefs();
          }

            this.setState({
              preferences,
              userProfile: await VsoApi.fetchUserProfile()
            });
        }
    }

    public render(): JSX.Element {
        let content: JSX.Element[] = [];

        if (this.state.isLoggedIn && this.state.accessToken != null) {
            content.push(<Header onSelectedChanged={this._onMenuSelectionChanged} userProfile={this.state.userProfile} />);

            if (this.state.selectedArea === "pullRequests") {
                content.push(<PullRequestArea preferences={this.state.preferences} userProfile={this.state.userProfile} />);
            } else if (this.state.selectedArea === "workItems") {
                content.push(<WorkItemsArea />);
            } else if (this.state.selectedArea === "settings") {
                content.push(<SettingsArea />);
            } else {
                content.push(<div />);
            }
        } else {
            content.push(<Login />);
        }

        return <div className="app">
            {content}
        </div>;
    }

    private _onMenuSelectionChanged = (s: string): void => {
        this.setState({ selectedArea: s });
    }

    private async resetAccessToken(): Promise<void> {
        if (this.state.accessToken != undefined) {
            let newToken = await ClientOAuthHelpers.refreshAccessToken(this.state.accessToken.refresh_token);
            if (newToken != undefined) {
                localStorage.setItem("accessToken", JSON.stringify(newToken));
                this.setState({
                    accessToken: newToken,
                    isLoggedIn: true,
                });

                VsoApi.setAccessToken(newToken);
            } else {
                this.logOut();
            }
        } else {
            this.logOut();
        }
    }

    private logOut(): void {
        this.setState({
            accessToken: null,
            isLoggedIn: false,
        });
        localStorage.removeItem("accessToken");
        this.render();
    }
}
