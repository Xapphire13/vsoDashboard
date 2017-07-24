import * as React from "react";

import {Header} from "./Header";
import {RepoList} from "./RepoList";

export class App extends React.Component {
    public render(): JSX.Element {
        return <div>
          <Header />
          <RepoList/>
        </div>;
    }
}
