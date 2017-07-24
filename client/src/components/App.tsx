import "../styles/app.less";

import * as React from "react";

import {Header} from "./Header";
import {Login} from "./Login";
import {RepoList} from "./RepoList";

export class App extends React.Component<{}, {isLoggedIn: boolean}> {
    constructor() {
        super();

        this.state = {
          isLoggedIn: false
        };
    }

    public render(): JSX.Element {
        if (this.state.isLoggedIn) {
            return <div className="app">
                <Header />
                <RepoList/>
            </div>
        }

        return <div className="app">
            <Login onLogin={this._onLogin}/>
        </div>;
    }

    private _onLogin = (): void => {
        this.setState({isLoggedIn: true});
    }
}
