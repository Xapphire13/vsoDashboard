import {ControlBase} from "./ControlBase";
import {IViewModel} from "../models/IViewModel";

export class EmbeddedView
  extends ControlBase {

  public viewModel: IViewModel;

  constructor(viewModel: IViewModel) {
    super("embeddedView", false);

    this.viewModel = viewModel;
  }
}
