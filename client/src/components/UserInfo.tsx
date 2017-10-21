import "./UserInfo.less";

import * as NameParser from "another-name-parser";
import * as React from "react";
import * as VsoApi from "../api/VsoApi";

import {IProfile} from "../api/models/IProfile";

declare type Props = {
  userProfile: IProfile | null
}

export class UserInfo extends React.Component<Props, {imageUrl: string}> {
  constructor() {
    super();

    this.state = {
      imageUrl: "data:image/png;base64,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"
    };
  }

  public componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.userProfile) {
      this.setState({
        imageUrl: VsoApi.getDisplayImageUrl(nextProps.userProfile.id)
      });
    }
  }

  public render(): JSX.Element {
    return <div className="userInfo">
      <div className="userName">Welcome {this.props.userProfile && (NameParser as any)(this.props.userProfile.displayName).first}</div>
      <div className="imagebox">
        <img className="img-circle" height="50" width="50" src={this.state.imageUrl} />
      </div>
    </div>;
  }
}
