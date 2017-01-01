import {ControlBase} from "./ControlBase";
import {IMenuItem} from "../models/IMenuItem";

export interface IMenuOptions {
  items: KnockoutObservableArray<IMenuItem>
}

export class Menu
  extends ControlBase {

  public items: KnockoutObservableArray<IMenuItem>;

  constructor(options: IMenuOptions) {
    super("Menu");

    this.items = options.items || ko.observableArray([]);
  }
}
