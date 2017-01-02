import {ContentLoader} from "../ContentLoader";
import {IRepository} from "../api/models/IRepository";
import {IViewModel} from "../models/IViewModel";
import {Panel} from "../controls/Panel";
import {Table} from "../controls/Table";
import {VsoProxy} from "../api/VsoProxy";

export class RepoSearchViewModel
  implements IViewModel {

  public resultsPanel: KnockoutObservable<Panel> = ko.observable<Panel>();
  public searchQuery: KnockoutObservable<string> = ko.observable<string>();
  public viewName: string = "repoSearch";

  private _vsoProxy: VsoProxy;

  constructor(vsoProxy: VsoProxy) {
    this._vsoProxy = vsoProxy;
  }

  public search(): void {
    this._vsoProxy.listRepositories().then(repos => {
      repos = repos.filter(repo => repo.name.toLowerCase().indexOf(this.searchQuery().toLowerCase()) >= 0);

      let resultsTable = new Table<IRepository>(ko.observableArray(repos), {
        columns: [
          {
            name: "",
            itemKey: "name"
          }
        ]
      });

      this.resultsPanel(new Panel({
        invisible: true,
        loadContent: () => Q(),
        title: ""
      }));
      this.resultsPanel().child(resultsTable);
    });
  }

  public load(): Q.Promise<any> {
    ContentLoader.loadStylesheets(this.viewName);
    return Q();
  }

  public unload(): void {
  }
}
