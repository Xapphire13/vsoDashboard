/// <reference path="../../typings/index.d.ts" />

export interface ICommand<T> {
  label: string;
  onClick: (command: ICommand<T>) => Q.Promise<T>;
  active?: KnockoutObservable<boolean>;
}
