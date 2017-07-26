import "../styles/app.less";

import * as NameParser from "another-name-parser";
import * as React from "react";

import { Header } from "./Header";
import { IAccessToken } from "../../../server/src/IAccessToken";
import { Login } from "./Login";
import { PullRequestArea } from "./PullRequestArea";
import { SettingsArea } from "./SettingsArea";
import { WorkItemsArea } from "./WorkItemsArea";

export class App extends React.Component<{}, { isLoggedIn: boolean, selectedArea: string, accessToken : IAccessToken | null }> {
    constructor() {
        super();

        let accessTokenString: string | null = localStorage.getItem("accessToken");
        let accessToken: IAccessToken | null = null;

        if (accessTokenString != undefined) {
            accessToken = JSON.parse(accessTokenString) as IAccessToken;
        }

        this.state = {
            isLoggedIn: accessToken != undefined,
            selectedArea: "pullRequests",
            accessToken: accessToken
        };
    }

    public render(): JSX.Element {
        let content: JSX.Element[] = [];

        if (this.state.isLoggedIn) {
            content.push(<Header userName={(NameParser as any)("Steven Hyphenated-Lastname").first} onSelectedChanged={this._onMenuSelectionChanged} />);

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

    /*private _onLogin = (): void => {
        this.setState({ isLoggedIn: true });
    }*/

    private _onMenuSelectionChanged = (s: string): void => {
        this.setState({ selectedArea: s });
    }

    /*private _onAccessTokenChanged = (t: IAccessToken): void => {
        this.setState({ accessToken: t });
    }*/
}
