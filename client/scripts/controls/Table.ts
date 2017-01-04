/// <reference path="../../../typings/index.d.ts" />

import {ContextMenu} from "./ContextMenu";
import {ICommand} from "../models/ICommand";
import {ControlBase} from "./ControlBase";

export enum FormatType {
  html,
  map
}

export interface IColumn<T> {
  cssClass?: string;
  format?: any;
  formatType?: FormatType;
  itemKey?: string | string[];
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
  extends ControlBase {

  public columns: IColumn<T>[];
  public items: KnockoutObservableArray<T>;

  private _fixedWidthTaken: number = 0;
  private _getRowCssClasses: (item: T) => string[];
  private _headerRow: JQuery;
  private _reference: JQuery;
  private _supplyCommands: (item: T) => ICommand<any>[];

  constructor(items: KnockoutObservableArray<T>, options: ITableOptions<T>) {
    super("table");
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
  }

  public getValue(item: T, column: IColumn<T>): any {
    let applyItemKey = () => {
      if(Array.isArray(column.itemKey)) {
        let value = item;

        column.itemKey.forEach(part => {
          value = value[part];
        });

        return value;
      } else {
        return item[column.itemKey];
      }
    };

    if(column.formatType != undefined) {
      switch(column.formatType) {
        case FormatType.html:
          return column.format;
        case FormatType.map:
          return column.format(column.itemKey == undefined ? item : applyItemKey());
      }
    } else if(column.itemKey != undefined) {
      return applyItemKey();
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
}
