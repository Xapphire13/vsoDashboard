import {IMenuItem} from "./IMenuItem";
import {IViewModel} from "./IViewModel";

export interface IPageViewModel
  extends IViewModel {
    templatePath: string;
    stylesheetPath?: string;
    menuItems: KnockoutObservableArray<IMenuItem>;
}
