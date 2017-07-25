import * as React from "react";

import {RepoList} from "./RepoList";

export class PullRequestArea extends React.Component {
    public render(): JSX.Element {
        return <RepoList />;
    }
}