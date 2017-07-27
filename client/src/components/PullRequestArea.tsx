import * as React from "react";

import {RepoList} from "./RepoList";
import {IPreferences} from "../../../server/src/IPreferences";

export class PullRequestArea extends React.Component<{preferences: IPreferences | null}> {
    public render(): JSX.Element {
        return <RepoList preferences={this.props.preferences}/>;
    }
}
