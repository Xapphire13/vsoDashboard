import * as React from "react";

import {RepoList} from './RepoList';

export class App extends React.Component{
    public render(): JSX.Element {
        return <div>
          <RepoList/>
        </div>;
    }
}
