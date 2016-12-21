/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../typings/StringFormat.d.ts"/>

import * as CustomKnockoutBindings from "./CustomKnockoutBindings";
import {PullRequestPageViewModel} from "./PullRequestPageViewModel";
import {VsoProxy} from "./VsoProxy";
import {IAccessToken} from "../../shared/IAccessToken";
import {IProfile} from "./IProfile";

export class Application {
  public prViewModel: PullRequestPageViewModel;
  public userProfile: KnockoutObservable<IProfile> = ko.observable<IProfile>();
  public menuItems: KnockoutObservableArray<any> = ko.observableArray([]);
  public vsoProxy: VsoProxy;

  constructor() {
    CustomKnockoutBindings.init();

    let accessToken = JSON.parse(localStorage.getItem("accessToken")) as IAccessToken;
    this.vsoProxy = new VsoProxy(accessToken, newAccessToken => {
      localStorage.setItem("accessToken", JSON.stringify(newAccessToken));
    });

    this.menuItems([
      {
        label: "Sign Out",
        onClick: () => this.signOut(),
        childControl: null
      },
      {
        label: "Add Repository",
        onClick: () => {},
        childControl: null
      }
    ])

    this.prViewModel = new PullRequestPageViewModel(this.vsoProxy, this.userProfile);
    this.vsoProxy.fetchUserProfile().then(profile => {
      this.userProfile(profile);
      this.prViewModel.start();
    });
  }

  public signOut(): void {
    localStorage.clear();
    location.reload();
  }
}
