import {ControlBase} from "../controls/ControlBase";

export class IMenuItem {
  label: string;
  onClick: () => void;
  active: KnockoutObservable<boolean>;
  activeControl: () => ControlBase;
}
