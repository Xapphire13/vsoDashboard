import {ControlBase} from "../ControlBase";
import {IViewModel} from "../../models/IViewModel";

export class EmbeddedView
  extends ControlBase {

  public viewModel: IViewModel;

  constructor(viewModel: IViewModel) {
    super("embeddedView/embeddedView.html");

    this.viewModel = viewModel;
  }

  public load(): Q.Promise<any> {
    return Q();
  }
}
