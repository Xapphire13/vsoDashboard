/// <reference path="../../typings/index.d.ts" />

import {ContentLoader} from "./ContentLoader";
import {ContextMenu} from "./ContextMenu";
import {ICommand} from "./ICommand";
import {IControl} from "./IControl";

export enum FormatType {
  html,
  map
}

export interface IColumn<T> {
  cssClass?: string;
  format?: any;
  formatType?: FormatType;
  itemKey?: string;
  name: string;
  onClick?: (item: T) => void;
  style?: string;
  width?: number | string;
}

export interface ITableOptions<T> {
  columns: IColumn<T>[];
  getRowCssClasses?: (item: T) => string[];
  supplyCommands?: (item: T) => ICommand<any>[];
}

export class Table<T>
  implements IControl {

  public columns: IColumn<T>[];
  public items: KnockoutObservableArray<T>;

  private _fixedWidthTaken: number = 0;
  private _getRowCssClasses: (item: T) => string[];
  private _headerRow: JQuery;
  private _initialized: Q.Promise<any>;
  private _reference: JQuery;
  private _supplyCommands: (item: T) => ICommand<any>[];

  constructor(items: KnockoutObservableArray<T>, options: ITableOptions<T>) {
    this.items = items || ko.observableArray<T>([]);
    this.columns = options.columns || [];
    this.columns.forEach(column  => {
      column.cssClass = column.cssClass || null;
      column.format = column.format || null;
      column.formatType = null || column.formatType;
      column.itemKey = column.itemKey || null;
      column.onClick = column.onClick || null;
      column.style = column.style || null;
      column.width = column.width || 1;
    });
    this.columns.forEach(column => {
      if(typeof(column.width) === "string") {
        let width = (<any>Number).parseInt((<string>column.width).substring(0, (<string>column.width).length-2));
        this._fixedWidthTaken += width;
      }
    });

    this._getRowCssClasses = options.getRowCssClasses;
    this._supplyCommands = options.supplyCommands;

    this._initialized = this._init();
  }

  public getHtml(): Q.Promise<string> {
    return this._initialized.then(() => {
      return $("#table-template").html();
    });
  }

  public getValue(item: T, itemKey: string, column: any): any {
    if(column.formatType != undefined) {
      switch(column.formatType) {
        case FormatType.html:
          return column.format;
        case FormatType.map:
          return column.format(column.itemKey == undefined ? item : item[column.itemKey]);
      }
    } else if(column.itemKey != undefined) {
      let parts = column.itemKey.split(".");

      if(parts.length === 1) {
        return item[column.itemKey];
      } else {
        let value: any = item;

        parts.forEach(part => {
          value = value[part];
        });

        return value;
      }
    }

    return item;
  }

  public getRowCssClass(item: T): string {
    return this._getRowCssClasses ? this._getRowCssClasses(item).join(" ") : "";
  }

  public rowClick(item: T, event: MouseEvent): void {
    if(event.button == 2 && this._supplyCommands) {
      ContextMenu.show(event.clientX + 1, event.clientY + 1, this._supplyCommands(item));
    }
  }

  private _init(): Q.Promise<any> {
    ContentLoader.loadStylesheets(["table"]);
    return ContentLoader.loadHtmlTemplates(["table"]);
  }
}
