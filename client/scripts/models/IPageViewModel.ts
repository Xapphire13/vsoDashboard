import {IMenuItem} from "./IMenuItem";

export interface IPageViewModel {
  menuItems: KnockoutObservableArray<IMenuItem>;
  viewName: string;

  load(): Q.Promise<any>;
  unload(): void;
}
