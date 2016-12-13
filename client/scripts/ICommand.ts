/// <reference path="../../typings/index.d.ts" />

export enum CommandStatus {
  none,
  loading,
  success,
  error
}

export interface ICommand<T> {
  label: string;
  onClick: (command: ICommand<T>) => Q.Promise<T>;
  active?: KnockoutObservable<boolean>;
  status?: KnockoutObservable<CommandStatus>; // Defaults to 'none'
}
