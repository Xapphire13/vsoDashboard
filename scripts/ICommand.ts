/// <reference path="../typings/index.d.ts" />

export interface ICommand<T> {
  label: string;
  onClick: () => Q.Promise<T>;
}
