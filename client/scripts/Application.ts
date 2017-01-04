/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../typings/StringFormat.d.ts"/>

import * as CustomKnockoutBindings from "./CustomKnockoutBindings";
import {IAccessToken} from "../../shared/IAccessToken";
import {IMenuItem} from "./models/IMenuItem";
import {IPageViewModel} from "./models/IPageViewModel";
import {IProfile} from "./api/models/IProfile";
import {Menu} from "./controls/Menu";
import {PullRequestPageViewModel} from "./viewModels/PullRequestPageViewModel";
import {VsoProxy} from "./api/VsoProxy";
import {WorkItemsPageViewModel} from "./viewModels/WorkItemsPageViewModel";

export class Application {
  public pageViewModel: KnockoutObservable<IPageViewModel> = ko.observable<IPageViewModel>();
  public userProfile: KnockoutObservable<IProfile> = ko.observable<IProfile>();
  public menu: Menu;
  public vsoProxy: VsoProxy;
  public contentLoading: KnockoutObservable<boolean> = ko.observable(false);

  private _pageViewModels: {title: string, resolver: () => IPageViewModel}[] = [
    {
      title: "Pull Requests",
      resolver: () => new PullRequestPageViewModel(this.vsoProxy, this.userProfile)
    },
    {
      title: "Work Items",
      resolver: () => new WorkItemsPageViewModel(this.vsoProxy)
    }
  ];

  constructor() {
    CustomKnockoutBindings.init();

    let accessToken = JSON.parse(localStorage.getItem("accessToken")) as IAccessToken;
    this.vsoProxy = new VsoProxy(accessToken, newAccessToken => {
      localStorage.setItem("accessToken", JSON.stringify(newAccessToken));
    });

    let viewItems: IMenuItem[] = this._pageViewModels.map((viewModelInfo, index) => {
      let menuItem = <IMenuItem>{
        label: viewModelInfo.title,
        onClick: () => {
          if(!menuItem.active()) {
            this._switchActiveViewModel(viewModelInfo.resolver);
            viewItems.forEach(item => {
              item.active(item === menuItem);
              item.enabled(!item.active());
            });
          }
        },
        active: ko.observable(index === 0),
        activeControl: () => {
          if(this.pageViewModel() != undefined && this.pageViewModel().menuItems().length > 0) {
            let subMenu = new Menu({
              items: this.pageViewModel().menuItems
            });
            return subMenu;
          }

          return null;
        },
        enabled: ko.observable(index !== 0)
      };

      return menuItem;
    });

    this.menu = new Menu({
      items: ko.observableArray([
        {
          label: "Sign Out",
          onClick: () => this.signOut(),
          active: ko.observable(false),
          activeControl: null,
          enabled: ko.observable(true)
        }
      ].concat(viewItems))
    });
  }

  public load(): Q.Promise<any> {
    return this.vsoProxy.fetchUserProfile().then(profile => {
      this.userProfile(profile);
      return this._switchActiveViewModel(this._pageViewModels[0].resolver);
    });
  }

  public signOut(): void {
    localStorage.clear();
    location.reload();
  }

  private _switchActiveViewModel(viewModelResolver: () => IPageViewModel): Q.Promise<any> {
    this.contentLoading(true);
    let viewModel = viewModelResolver();

    if(this.pageViewModel() != undefined) {
      this.pageViewModel().unload();
    }

    this.pageViewModel(viewModel);
    return viewModel.load().then(() => {
      this.contentLoading(false);
    });
  }
}
