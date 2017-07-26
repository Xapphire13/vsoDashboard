import "../styles/app.less";

import * as React from "react";
import * as vsts from "vso-node-api"
import * as GitInterfaces from 'vso-node-api/interfaces/GitInterfaces';

import { Header } from "./Header";
import { Login } from "./Login";
import { PullRequestArea } from "./PullRequestArea";
import { SettingsArea } from "./SettingsArea";
import { WorkItemsArea } from "./WorkItemsArea";
import { IAccessToken } from "../../../shared/IAccessToken";
import { ClientOAuthHelper } from "../ClientOAuthHelper";

export class App extends React.Component<{}, { isLoggedIn: boolean, selectedArea: string, accessToken : IAccessToken | null, vstsConnection: vsts.WebApi | null}> {
    constructor() {
        super();

        let accessTokenString = localStorage.getItem("accessToken");
        let accessToken = null;
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
            vstsConnection: vstsConnection
        };
    }

    private _defaultCollectionUri = "https://msazure.visualstudio.com/DefaultCollection";
    private _oAuthHelper = new ClientOAuthHelper();

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

    private _onGetPRList = (repoId: string): Promise<any> => {
        if (this.state.vstsConnection != undefined) {
            let gitHelper = this.state.vstsConnection.getGitApi();
            return gitHelper.getPullRequests(repoId, { status: GitInterfaces.PullRequestStatus.Active } as any)
        }

        return Promise.resolve();
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
