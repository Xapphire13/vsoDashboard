/// <reference path="../../typings/index.d.ts" />

import {ContentLoader} from "./ContentLoader";
import {ControlBase} from "./ControlBase";
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

export class Panel
  extends ControlBase {

  public child: KnockoutObservable<ControlBase> = ko.observable<ControlBase>();
  public commands: KnockoutObservableArray<ICommand<any>> = ko.observableArray<ICommand<any>>([]);
  public isInvisible: KnockoutObservable<boolean> = ko.observable<boolean>();
  public loading: KnockoutObservable<boolean> = ko.observable(true);
  public minimized: KnockoutObservable<boolean> = ko.observable<boolean>();
  public minimizedText: KnockoutObservable<string>;
  public onRemove: () => void;
  public title: KnockoutObservable<string> = ko.observable("");

  private _loadContent: () => Q.Promise<any>;
  private _refresh: () => Q.Promise<any>;
  private _refreshInterval: KnockoutObservable<number>;
  private _timeout = null;

  constructor(options: IPanelOptions) {
    super("panel");
    this.title(options.title);
    this._loadContent = options.loadContent;

    this.onRemove = null || options.onRemove;
    this._refresh = null || options.refresh;
    this._refreshInterval = options.refreshInterval || ko.observable(0);
    this.isInvisible(options.invisible || false);
    this.minimized(options.minimized || false);
    this.minimizedText = options.minimizedText || ko.observable("");

    this.child.subscribe(newValue => {
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
    });
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
}
