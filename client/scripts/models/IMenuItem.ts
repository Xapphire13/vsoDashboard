import {ControlBase} from "../controls/ControlBase";

export class IMenuItem {
  active: KnockoutObservable<boolean>;
  activeControl: () => ControlBase;
  enabled: KnockoutObservable<boolean>;
  label: string;
  onClick: () => void;
}
