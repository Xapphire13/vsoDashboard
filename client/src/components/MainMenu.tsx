import * as React from "react";

export class MainMenu extends React.Component {
    private _menuItems:String[] = ["Pull Requests", "Work Items", "Settings"];
    public render(): JSX.Element {
        return <div>{this._menuItems.map(i => <ul>{i}</ul>)}</div>;
    }
}