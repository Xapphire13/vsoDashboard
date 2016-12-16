/// <reference path="../../typings/index.d.ts" />

import {ContentLoader} from "./ContentLoader";
import {ICommand} from "./ICommand";

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

export class Panel {
  private static _panelCount = 0;

  public child: KnockoutObservable<JQuery> = ko.observable<JQuery>();
  public commands: KnockoutObservableArray<ICommand<any>> = ko.observableArray<ICommand<any>>([]);
  public dom: JQuery;
  public id: string;
  public isInvisible: KnockoutObservable<boolean> = ko.observable<boolean>();
  public loading: KnockoutObservable<boolean> = ko.observable(true);
  public minimized: KnockoutObservable<boolean> = ko.observable<boolean>();
  public minimizedText: KnockoutObservable<string>;
  public onRemove: () => void;
  public title: KnockoutObservable<string> = ko.observable("");

  private _childContainer: JQuery;
  private _domTemplate: string = "<div class='panel-wrapper' data-bind=\"template: { name: 'panel-template' }\"></div>";
  private _initialized: boolean = false;
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
    this.isInvisible(options.invisible || false);
    this.minimized(options.minimized || false);
    this.minimizedText = options.minimizedText || ko.observable("");

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

        this._initialized = true;
      });
    }

    return Q();
  }

  public refresh(): void {
    this._refresh();
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
