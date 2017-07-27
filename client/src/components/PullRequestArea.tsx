import * as React from "react";

import {RepoList} from "./RepoList";
import {IPreferences} from "../../../server/src/IPreferences";
import {IProfile} from "../api/models/IProfile";

export class PullRequestArea extends React.Component<{preferences: IPreferences | null, userProfile: IProfile | null}> {
    public render(): JSX.Element {
        return <RepoList preferences={this.props.preferences} userProfile={this.props.userProfile}/>;
    }
}
