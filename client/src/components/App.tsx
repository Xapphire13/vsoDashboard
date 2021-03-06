import "./App.less";

import * as ClientOAuthHelpers from "../ClientOAuthHelpers";
import * as React from "react";
import * as VsoApi from "../api/VsoApi";
import * as Preferences from "../api/Preferences";

import autobind from "autobind-decorator";

import {DefaultPalette, Fabric, Spinner, SpinnerType, loadTheme} from 'office-ui-fabric-react';
import {Header} from "./Header";
import {IAccessToken} from "../../../server/src/IAccessToken"
import {IPreferences} from "../../../server/src/IPreferences";
import {Login} from "./Login";
import {PullRequestArea} from "./PullRequestArea";
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
    constructor() {
        super();

        loadTheme({
          palette: {
            neutralPrimary: DefaultPalette.white
          }
        });

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
          let preferences: IPreferences;
          try{
            preferences = await Preferences.getPreferences();
          } catch (err) {
            await this.resetAccessToken();
            preferences = await Preferences.getPreferences();
          }

            this.setState({
              preferences,
              userProfile: await VsoApi.fetchUserProfile()
            });
        }
    }

    public render(): JSX.Element {
        let content: JSX.Element[] = [];

        if(this.state.preferences == undefined) {
          return <Fabric className="app">
            <Spinner type={SpinnerType.large} />
          </Fabric>;
        }

        if (this.state.isLoggedIn && this.state.accessToken != null) {
            content.push(<Header
              key="Header"
              onSelectedChanged={this._onMenuSelectionChanged}
              userProfile={this.state.userProfile}
              preferences={this.state.preferences}
              onPreferencesSaved={async (preferences) => {
                this.setState({
                  preferences: await Preferences.savePreferences(preferences)
                });
              }}
            />);

            if (this.state.selectedArea === "pullRequests") {
                content.push(<PullRequestArea key="PullRequestArea" preferences={this.state.preferences} userProfile={this.state.userProfile} />);
            } else if (this.state.selectedArea === "workItems") {
                content.push(<WorkItemsArea key="WorkItemsArea" />);
            } else {
                content.push(<div key="NoArea" />);
            }
        } else {
            content.push(<Login key="Login" />);
        }

        return <Fabric className="app">
            {content}
        </Fabric>;
    }

    private _onMenuSelectionChanged = (s: string): void => {
        this.setState({ selectedArea: s });
    }

    @autobind
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

    @autobind
    private logOut(): void {
        this.setState({
            accessToken: null,
            isLoggedIn: false,
        });
        localStorage.removeItem("accessToken");
        this.render();
    }
}
