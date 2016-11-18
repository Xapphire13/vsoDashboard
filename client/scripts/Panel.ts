/// <reference path="../../typings/index.d.ts" />

import {ContentLoader} from "./ContentLoader";
import {ICommand} from "./ICommand";

export interface IPanelOptions {
  title: string,
  loadContent: () => Q.Promise<any>,
  onRemove?: () => void,
  refresh?: () => Q.Promise<any>,
  refreshInterval?: KnockoutObservable<number>
}

export class Panel {
  public dom: JQuery;
  public id: string;
  public title: KnockoutObservable<string> = ko.observable("");
  public child: KnockoutObservable<JQuery> = ko.observable<JQuery>();
  public onRemove: () => void;
  public commands: KnockoutObservableArray<ICommand<any>> = ko.observableArray<ICommand<any>>([]);

  private static _panelCount = 0;

  private _initialized: boolean = false;
  private _domTemplate: string = "<div class='panel-wrapper' data-bind=\"template: { name: 'panel-template' }\"></div>";
  private _childContainer: JQuery;
  private _loadContent: () => Q.Promise<any>;
  private _refresh: () => Q.Promise<any>;
  private _refreshInterval: KnockoutObservable<number>;
  private _timeout = null;

  constructor(options: IPanelOptions) {
    this.title(options.title);
    this.id = `panel-${Panel._panelCount++}`;
    this._loadContent = options.loadContent;

    this.onRemove = null || options.onRemove;
    this._refresh = null || options.refresh;
    this._refreshInterval = options.refreshInterval || ko.observable(0);

    // Init dom
    this.dom = $(this._domTemplate);
    this.dom.attr("id", this.id);
  }

  public init(): Q.Promise<any> {
    if(!this._initialized) {
      ContentLoader.loadStylesheets(["panel"]);
      return ContentLoader.loadHtmlTemplates(["panel"]).then(() => {
        ko.applyBindings(this, document.getElementById(this.id));

        this._childContainer = this.dom.find(".panel-content");

        this._setChild();
        this.child.subscribe(newValue => this._setChild());

        this._loadContent();

        if(this._refreshInterval() > 0) {
          this._timeout = setTimeout(() => this._refresh(), this._refreshInterval() * 60 * 1000);
        }
        this._refreshInterval.subscribe(newValue => {
          clearTimeout(this._timeout);

          if(newValue > 0) {
            this._refresh();
            this._timeout = setTimeout(() => this._refresh(), newValue * 60 * 1000);
          }
        });

        this._initialized = true;
      });
    }
  }

  public remove() {
    this.dom.remove();

    if(this.onRemove != undefined) {
      this.onRemove();
    }
  }

  private _setChild() {
    this._childContainer.empty();
    if(this.child() != undefined) {
      this._childContainer.append(this.child());
    }
  }
}
