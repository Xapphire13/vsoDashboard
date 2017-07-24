import "../styles/app.less";

import * as React from "react";

import { Header } from "./Header";
import { Login } from "./Login";
import { PullRequestArea } from "./PullRequestArea";
import { SettingsArea } from "./SettingsArea";
import { WorkItemsArea } from "./WorkItemsArea";

export class App extends React.Component<{}, { isLoggedIn: boolean, selectedArea: string }> {
    constructor() {
        super();

        this.state = {
            isLoggedIn: false,
            selectedArea: "pullRequests"
        };
    }

    public render(): JSX.Element {
        if (this.state.isLoggedIn) {
            let area: JSX.Element;
            if (this.state.selectedArea === "pullRequests") {
                area = <PullRequestArea />;
            } else if (this.state.selectedArea === "workItems") {
                area = <WorkItemsArea />;
            } else if (this.state.selectedArea === "settings") {
                area = <SettingsArea />;
            } else {
                area = <div />;
            }

            return <div className="app">
                <Header onSelectedChanged={this._onMenuSelectionChanged} />
                {area}
            </div>;
        }

        return <div className="app">
            <Login onLogin={this._onLogin} />
        </div>;
    }

    private _onLogin = (): void => {
        this.setState({ isLoggedIn: true });
    }

    private _onMenuSelectionChanged = (s: string): void => {
        this.setState({ selectedArea: s });
    }
}