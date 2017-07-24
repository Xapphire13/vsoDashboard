import * as React from "react";

import {Repo} from "./Repo";

export class RepoContainer extends React.Component {
  public render(): JSX.Element {
    return <div>
      <Repo/>
    </div>;
  }
}
