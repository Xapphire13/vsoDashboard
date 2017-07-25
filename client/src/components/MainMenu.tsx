import * as React from "react";

export class MainMenu extends React.Component<{onSelectedChanged(item: string):void}, {selectedItem: string}> {
    public constructor() {
        super();

        this.state = {
            selectedItem: "pullRequests"
        };
    }
    private _menuItems: { [key: string]: string } =
    { "pullRequests": "Pull Requests", "workItems": "Work Items", "settings": "Settings" };
    public render(): JSX.Element {
        return <div>
            {Object.keys(this._menuItems).map(i => <ul><a className={i === this.state.selectedItem ? "selected" : ""}
                onClick={(e) => {this._handleClick(e); this._processMenuChange(i); } }>{this._menuItems[i]}</a></ul>)}
            </div>;
    }

    private _handleClick = (event: React.MouseEvent<HTMLAnchorElement>):void => {
        event.preventDefault();
    }

    private _processMenuChange(item: string):void {
        if (this.state.selectedItem !== item) {
            this.setState({selectedItem: item});
            this.props.onSelectedChanged(item);
        }
    }
}