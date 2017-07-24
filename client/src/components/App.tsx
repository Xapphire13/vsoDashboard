import * as React from "react";

import {Header} from "./Header";
import {PullRequestArea} from "./PullRequestArea";
import {SettingsArea} from "./SettingsArea";
import {WorkItemsArea} from "./WorkItemsArea";

export class App extends React.Component<{}, {selectedArea: string}> {
    public constructor() {
        super();
        this.state = {selectedArea: "pullRequests"};
    }

    public render(): JSX.Element {
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

        return <div>
          <Header onSelectedChanged={this._onMenuSelectionChanged}/>
          { area }
        </div>;
    }

    private _onMenuSelectionChanged = (s: string):void => {
        this.setState({selectedArea: s});
    }
}
