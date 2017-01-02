import {IMenuItem} from "./IMenuItem";
import {IViewModel} from "./IViewModel";

export interface IPageViewModel
  extends IViewModel {
  menuItems: KnockoutObservableArray<IMenuItem>;
}
