import * as React from "react";

import {MainMenu} from "./MainMenu";
import {UserInfo} from "./UserInfo";

export class Header extends React.Component {
    public render(): JSX.Element {
        return <div>
            <h1>VSO Dashboard</h1>
            <MainMenu />
            <UserInfo />
            </div>;
    }
}