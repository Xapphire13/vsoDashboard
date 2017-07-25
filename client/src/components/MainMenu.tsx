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
      <svg height="0" width="0">
        <defs>
            <linearGradient id="gradient">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="white" stopOpacity="75"/>
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
      </svg>
      {Object.keys(this._menuItems).map((item, index) => <li key={index}>
        <a className={item === this.state.selectedItem ? "selected" : ""} onClick={(e) => { this._handleClick(e); this._processMenuChange(item); }}>
          {this._menuItems[item]}
        </a>
        <svg className={`caret ${item === this.state.selectedItem ? "selected" : ""}`}>
          <polygon points="45 7 50 0 55 7" fill="#242424" strokeWidth="0" />
          <polyline points="0 6, 45 6, 50 0, 55 6, 100 6"
            stroke="url(#gradient)" strokeWidth="0.75" strokeLinejoin="miter" strokeLinecap="butt"
            fill="transparent"/>
        </svg>
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
