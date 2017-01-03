import {ContentLoader} from "../ContentLoader";
import {IRepository} from "../api/models/IRepository";
import {IViewModel} from "../models/IViewModel";
import {Panel} from "../controls/Panel";
import {Table} from "../controls/Table";
import {VsoProxy} from "../api/VsoProxy";

export interface IRepoSearchViewModelOptions {
  onRepoSelected: (repo: IRepository) => void;
}

export class RepoSearchViewModel
  implements IViewModel {

  public resultsPanel: KnockoutObservable<Panel> = ko.observable<Panel>();
  public searchQuery: KnockoutObservable<string> = ko.observable<string>();
  public viewName: string = "repoSearch";

  private _vsoProxy: VsoProxy;
  private _onRepoSelected: (repo: IRepository) => void;

  constructor(vsoProxy: VsoProxy, options: IRepoSearchViewModelOptions) {
    this._vsoProxy = vsoProxy;
    this._onRepoSelected = options.onRepoSelected || (() => {});
  }

  public search(): void {
    if(this.resultsPanel() != undefined) {
      this.resultsPanel().remove();
    }

    let resultsTable = new Table<IRepository>(null, {
      columns: [
        {
          name: "",
          itemKey: "name",
          onClick: this._onRepoSelected
        }
      ]
    });

    this.resultsPanel(new Panel({
      invisible: true,
      loadContent: () => {
        return this._vsoProxy.listRepositories().then(repos => {
          repos = repos.filter(repo => repo.name.toLowerCase().indexOf(this.searchQuery().toLowerCase()) >= 0);
          resultsTable.items(repos);
        });
      },
      title: ""
    }));
    this.resultsPanel().child(resultsTable);
  }

  public load(): Q.Promise<any> {
    ContentLoader.loadStylesheets(this.viewName);
    return Q();
  }

  public unload(): void {
  }
}
