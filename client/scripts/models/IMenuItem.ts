export class IMenuItem {
  label: string;
  onClick: () => void;
  active: KnockoutObservable<boolean>;
}
