import "../styles/mainMenu.less";

import * as React from "react";

export class MainMenu extends React.Component<{ onSelectedChanged(item: string): void }, { selectedItem: string }> {
  private _menuItems: { [key: string]: string } = {
    "pullRequests": "Pull Requests",
    "workItems": "Work Items",
    "settings": "Settings"
  };

  public constructor() {
    super();

    this.state = {
      selectedItem: "pullRequests"
    };
  }

  public render(): JSX.Element {
    return <ul className="mainMenu">
      {Object.keys(this._menuItems).map((item, index) => <li key={index}>
        <a className={item === this.state.selectedItem ? "selected" : ""} onClick={(e) => { this._handleClick(e); this._processMenuChange(item); }}>
          {this._menuItems[item]}
        </a>
      </li>)}
    </ul>;
  }

  private _handleClick = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
  }

  private _processMenuChange(item: string): void {
    if (this.state.selectedItem !== item) {
      this.setState({ selectedItem: item });
      this.props.onSelectedChanged(item);
    }
  }
}
