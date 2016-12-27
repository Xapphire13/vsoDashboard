/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../typings/StringFormat.d.ts"/>

import * as CustomKnockoutBindings from "./CustomKnockoutBindings";
import {IAccessToken} from "../../shared/IAccessToken";
import {IMenuItem} from "./IMenuItem";
import {IPageViewModel} from "./IPageViewModel";
import {IProfile} from "./IProfile";
import {PullRequestPageViewModel} from "./PullRequestPageViewModel";
import {TestPageViewModel} from "./TestPageViewModel";
import {VsoProxy} from "./VsoProxy";

export class Application {
  public pageViewModel: KnockoutObservable<IPageViewModel> = ko.observable<IPageViewModel>();
  public userProfile: KnockoutObservable<IProfile> = ko.observable<IProfile>();
  public menuItems: KnockoutObservableArray<IMenuItem> = ko.observableArray([]);
  public vsoProxy: VsoProxy;
  public contentLoading: KnockoutObservable<boolean> = ko.observable(false);

  private _defaultViewModel: string = "pullRequests";
  private _viewModelResolver: {[key: string]: () => IPageViewModel} = {
    "pullRequests": () => new PullRequestPageViewModel(this.vsoProxy, this.userProfile)
  }

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
      }
    ].concat(Object.keys(this._viewModelResolver).map(key => {
      return {
        label: key,
        onClick: () => this._switchActiveViewModel(key)
      }
    })));

  }

  public load(): Q.Promise<any> {
    return this.vsoProxy.fetchUserProfile().then(profile => {
      this.userProfile(profile);
      return this._switchActiveViewModel(this._defaultViewModel);
    });
  }

  public signOut(): void {
    localStorage.clear();
    location.reload();
  }

  private _switchActiveViewModel(viewModelName: string): Q.Promise<any> {
    this.contentLoading(true);
    let viewModel = this._viewModelResolver[viewModelName]();

    if(this.pageViewModel() != undefined) {
      this.pageViewModel().unload();
    }

    this.pageViewModel(viewModel);
    return viewModel.load().then(() => {
      this.contentLoading(false);
    });
  }
}
