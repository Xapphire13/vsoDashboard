/// <reference path="../../typings/index.d.ts" />

import {ContentLoader} from "./ContentLoader";
import {ICommand} from "./ICommand";
import {IControl} from "./IControl";

export interface IPanelOptions {
  invisible?: boolean;
  loadContent: () => Q.Promise<any>,
  minimized?: boolean;
  minimizedText?: KnockoutObservable<string>;
  onRemove?: () => void,
  refresh?: () => Q.Promise<any>,
  refreshInterval?: KnockoutObservable<number>
  title: string,
}

export class Panel
  implements IControl {

  public commands: KnockoutObservableArray<ICommand<any>> = ko.observableArray<ICommand<any>>([]);
  public isInvisible: KnockoutObservable<boolean> = ko.observable<boolean>();
  public loading: KnockoutObservable<boolean> = ko.observable(true);
  public minimized: KnockoutObservable<boolean> = ko.observable<boolean>();
  public minimizedText: KnockoutObservable<string>;
  public onRemove: () => void;
  public title: KnockoutObservable<string> = ko.observable("");

  private _domTemplate: string = "<div class='panel-wrapper' data-bind=\"template: { name: 'panel-template' }\"></div>";
  private _initialized: Q.Promise<any>;
  private _loadContent: () => Q.Promise<any>;
  private _refresh: () => Q.Promise<any>;
  private _refreshInterval: KnockoutObservable<number>;
  private _timeout = null;
  private _reference: JQuery;

  constructor(options: IPanelOptions) {
    this.title(options.title);
    this._loadContent = options.loadContent;

    this.onRemove = null || options.onRemove;
    this._refresh = null || options.refresh;
    this._refreshInterval = options.refreshInterval || ko.observable(0);
    this.isInvisible(options.invisible || false);
    this.minimized(options.minimized || false);
    this.minimizedText = options.minimizedText || ko.observable("");

    this._initialized = this._init();
  }

  public getHtml(): Q.Promise<string> {
    return this._initialized.then(() => {
      return $("#panel-template").html();
    });
  }

  public refresh(): void {
    this._refresh();
  }

  public remove() {
    this._reference.remove();

    if(this.onRemove != undefined) {
      this.onRemove();
    }
  }

  public setChild(control: IControl): Q.Promise<any> {
    return this._initialized.then(() => control.getHtml().then(html => {
      let childContainer = this._reference.find(".panel-content");
      childContainer.empty();
      let reference = $(`<span>${html}</span>`);
      let childElement = reference[0];
      (<any>control)._reference = reference;
      childContainer.append(childElement);
      ko.applyBindings(control, childElement);

      this._loadContent().then(() => {
        this.loading(false);
      }, reason => {
        console.error(reason);
      });

      let queueRefresh = () => {
        clearTimeout(this._timeout);

        this._timeout = setTimeout(() => {
          this._refresh();
          queueRefresh();
        }, this._refreshInterval() * 60 * 1000);
      }

      if(this._refreshInterval() > 0) {
        queueRefresh();
      }

      this._refreshInterval.subscribe(newValue => {
        clearTimeout(this._timeout);

        if(newValue > 0) {
          this._refresh();
          queueRefresh();
        }
      });
    }));
  }

  private _init(): Q.Promise<any> {
    ContentLoader.loadStylesheets(["panel"]);
    return ContentLoader.loadHtmlTemplates(["panel"]);
  }
}
