import "../styles/app.less";

import * as React from "react";
import * as VsoApi from "../api/VsoApi";

import {Header} from "./Header";
import {Login} from "./Login";
import {PullRequestArea} from "./PullRequestArea";
import {SettingsArea} from "./SettingsArea";
import {WorkItemsArea} from "./WorkItemsArea";
import {IAccessToken} from "../../../server/src/IAccessToken"
// import {ClientOAuthHelper} from "../ClientOAuthHelper";
import {IPreferences} from "../../../server/src/IPreferences";

declare type State = {
  isLoggedIn: boolean,
  selectedArea: string,
  accessToken : IAccessToken | null,
  preferences: IPreferences | null
};

export class App extends React.Component<{}, State> {
    // private _oAuthHelper = new ClientOAuthHelper();
    private _preferenceUrl = "/preferences";

    constructor() {
        super();

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
            preferences: null
        };
    }

    public async componentDidMount(): Promise<any> {
        if (this.state.accessToken != null) {
            let preferences = await new Promise<IPreferences>((resolve, reject) => {
                $.ajax({
                    url: this._preferenceUrl,
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${this.state.accessToken && this.state.accessToken.access_token}`
                    }
                }).then(resolve, reject);
            });

            this._onPreferenceUpdate(preferences);
        }
    }

    public render(): JSX.Element {
        let content: JSX.Element[] = [];

        if (this.state.isLoggedIn && this.state.accessToken != null) {
            content.push(<Header onSelectedChanged={this._onMenuSelectionChanged} />);

            if (this.state.selectedArea === "pullRequests") {
                content.push(<PullRequestArea />);
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

    private _onPreferenceUpdate = (p: IPreferences): void => {
        this.setState({ preferences: p });
    }

    // private async resetAccessToken(): Promise<void> {
    //     if (this.state.accessToken != undefined) {
    //         let newToken = await this._oAuthHelper.refreshAccessToken(this.state.accessToken.refresh_token);
    //         if (newToken != undefined) {
    //             localStorage.setItem("accessToken", JSON.stringify(newToken));
    //             this.setState({
    //                 accessToken: newToken,
    //                 isLoggedIn: true,
    //             });
    //
    //             VsoApi.setAccessToken(newToken);
    //         } else {
    //             this.logOut();
    //         }
    //     } else {
    //         this.logOut();
    //     }
    // }

    // private logOut(): void {
    //     this.setState({
    //         accessToken: null,
    //         isLoggedIn: false,
    //     });
    //     localStorage.removeItem("accessToken");
    //     this.render();
    // }
}
