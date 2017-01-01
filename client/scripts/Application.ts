/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../typings/StringFormat.d.ts"/>

import * as CustomKnockoutBindings from "./CustomKnockoutBindings";
import {IAccessToken} from "../../shared/IAccessToken";
import {IMenuItem} from "./models/IMenuItem";
import {IPageViewModel} from "./models/IPageViewModel";
import {IProfile} from "./api/models/IProfile";
import {Menu} from "./controls/Menu";
import {PullRequestPageViewModel} from "./pages/PullRequestPageViewModel";
import {VsoProxy} from "./api/VsoProxy";

export class Application {
  public pageViewModel: KnockoutObservable<IPageViewModel> = ko.observable<IPageViewModel>();
  public userProfile: KnockoutObservable<IProfile> = ko.observable<IProfile>();
  public menu: Menu;
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

    let viewItems: IMenuItem[] = Object.keys(this._viewModelResolver).map(key => {
      let menuItem = <IMenuItem>{
        label: key,
        onClick: () => {
          if(!menuItem.active()) {
            viewItems.forEach(item => item.active(item === menuItem));
            this._switchActiveViewModel(key);
          }
        },
        active: ko.observable(key === this._defaultViewModel),
        activeControl: () => {
          let subMenu = new Menu({
            items: this.pageViewModel() != undefined ? this.pageViewModel().menuItems : null
          });
          return subMenu;
        }
      };

      return menuItem;
    });

    this.menu = new Menu({
      items: ko.observableArray([
        {
          label: "Sign Out",
          onClick: () => this.signOut(),
          active: ko.observable(false),
          activeControl: null
        }
      ].concat(viewItems))
    });
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
