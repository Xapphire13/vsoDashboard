/// <reference path="../../../typings/index.d.ts" />

export enum CommandStatus {
  none,
  loading,
  success,
  error
}

export interface ICommand<T> {
  active?: KnockoutObservable<boolean>;
  label: string;
  onClick: (command: ICommand<T>) => Q.Promise<T>;
  status?: KnockoutObservable<CommandStatus>; // Defaults to 'none'
}
