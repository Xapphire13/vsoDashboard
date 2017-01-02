export interface IViewModel {
  viewName: string;

  load(): Q.Promise<any>;
  unload(): void;
}
