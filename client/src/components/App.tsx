import "../styles/app.less";

import * as React from "react";
import * as vsts from "vso-node-api"
import * as GitInterfaces from 'vso-node-api/interfaces/GitInterfaces';

import { Header } from "./Header";
import { Login } from "./Login";
import { PullRequestArea } from "./PullRequestArea";
import { SettingsArea } from "./SettingsArea";
import { WorkItemsArea } from "./WorkItemsArea";
import { IAccessToken } from "../../../server/src/IAccessToken"
import { ClientOAuthHelper } from "../ClientOAuthHelper";
import { IPreferences } from "../../../server/src/IPreferences";

export class App extends React.Component<{}, { isLoggedIn: boolean, selectedArea: string, accessToken : IAccessToken | null, vstsConnection: vsts.WebApi | null, preferences: IPreferences | null}> {
    constructor() {
        super();

        let accessTokenString = localStorage.getItem("accessToken");
        let accessToken: IAccessToken | null = null;
        let vstsConnection = null;

        if (accessTokenString != undefined) {
            accessToken = JSON.parse(accessTokenString) as IAccessToken

            if (accessToken != undefined) {
                let tokenHandler = vsts.getBearerHandler(accessToken.access_token);
                vstsConnection = new vsts.WebApi(this._defaultCollectionUri, tokenHandler);
            }
        }

        this.state = {
            isLoggedIn: accessToken != undefined,
            selectedArea: "pullRequests",
            accessToken: accessToken,
            vstsConnection: vstsConnection,
            preferences: null
        };
    }

    private _defaultCollectionUri = "https://msazure.visualstudio.com/DefaultCollection";
    private _oAuthHelper = new ClientOAuthHelper();
    private _preferenceUrl = "/preferences";

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

    private async getPRList(repoId: string): Promise<GitInterfaces.GitPullRequest[]> {
        let count = 0;
        do {
            if (this.state.vstsConnection != undefined) {
                let gitHelper = this.state.vstsConnection.getGitApi();

                    try {
                        return await gitHelper.getPullRequests(repoId, { status: GitInterfaces.PullRequestStatus.Active } as any)
                    } catch (err) {
                        if (count == 0) {
                        // TODO: figure this out
                            await this.resetAccessToken();
                        }
                        else {
                            throw err;
                        }
                    }

            } else {
                this.resetAccessToken();
            }
        } while (count++ < 1);
        return Promise.resolve([]);
    }

    private async resetAccessToken(): Promise<any> {
        if (this.state.accessToken != undefined) {
            let newToken = await this._oAuthHelper.refreshAccessToken(this.state.accessToken.refresh_token);
            if (newToken != undefined) {
                localStorage.setItem("accessToken", JSON.stringify(newToken));
                let tokenHandler = vsts.getBearerHandler(newToken.access_token);
                let vstsConnection = new vsts.WebApi(this._defaultCollectionUri, tokenHandler);
                this.setState({
                    accessToken: newToken,
                    isLoggedIn: true,
                    vstsConnection: vstsConnection
                });
            } else {
                this.logOut();
            }
        } else {
            this.logOut();
        }
    }

    private logOut() : void {
        this.setState({
            accessToken: null,
            isLoggedIn: false,
            vstsConnection: null});
        localStorage.removeItem("accessToken");
        this.render();
    }
}
