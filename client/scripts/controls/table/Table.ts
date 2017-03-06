/// <reference path="../../../../typings/index.d.ts" />

import {ContextMenu} from "../contextMenu/ContextMenu";
import {ICommand} from "../../models/ICommand";
import {ControlBase} from "../ControlBase";

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
  sortable?: boolean;
  sortAscending?: KnockoutObservable<boolean>;
  flipSortDirection?: boolean;
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
  public sortColumn: KnockoutObservable<IColumn<T>> = ko.observable(null);

  private _fixedWidthTaken: number = 0;
  private _getRowCssClasses: (item: T) => string[];
  private _headerRow: JQuery;
  private _reference: JQuery;
  private _supplyCommands: (item: T) => ICommand<any>[];

  constructor(items: KnockoutObservableArray<T>, options: ITableOptions<T>) {
    super("table/table.html", "table/table.css");
    this.items = items || ko.observableArray<T>([]);
    let columns = options.columns || [];
    this.columns = columns.map(column  => {
      return <IColumn<T>>{
        name: column.name,
        cssClass: column.cssClass || null,
        format: column.format || null,
        formatType: null || column.formatType,
        itemKey: column.itemKey || null,
        onClick: column.onClick || null,
        style: column.style || null,
        width: column.width || 1,
        sortable: column.sortable || false,
        sortAscending: ko.observable((column.sortAscending && column.sortAscending()) || true),
        flipSortDirection: column.flipSortDirection || false
      };
    });

    this.sortColumn.subscribe(newValue => {
      this._sort(newValue);
    })

    this.columns.forEach(column => {
      if(typeof(column.width) === "string") {
        let width = (<any>Number).parseInt((<string>column.width).substring(0, (<string>column.width).length-2));
        this._fixedWidthTaken += width;
      }
    });

    this._getRowCssClasses = options.getRowCssClasses;
    this._supplyCommands = options.supplyCommands;
  }

  public load(): Q.Promise<any> {
    return Q();
  }

  public getValue(item: T, column: IColumn<T>): any {
    if(column.formatType != undefined) {
      switch(column.formatType) {
        case FormatType.html:
          return column.format;
        case FormatType.map:
          return column.format(column.itemKey == undefined ? item : this._getRawValue(item, column));
      }
    } else if(column.itemKey != undefined) {
      return this._getRawValue(item, column);
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

  private _getRawValue(item: T, column: IColumn<T>): any {
    if(Array.isArray(column.itemKey)) {
      let value = item;

      column.itemKey.forEach(part => {
        value = ko.unwrap(value[part]);
      });

      return value;
    } else {
      return ko.unwrap(item[column.itemKey]);
    }
  }

  private _sort(sortColumn: IColumn<T>): void {
    this.items(this.items().sort((left: T, right: T) => {
      let sortAscending = sortColumn.flipSortDirection ? !sortColumn.sortAscending() : sortColumn.sortAscending();
      let leftValue = this._getRawValue(sortAscending ? left : right, sortColumn);
      let rightValue = this._getRawValue(sortAscending ? right : left, sortColumn);

      if(typeof(leftValue) === "number") {
        return leftValue < rightValue ? -1 : leftValue === rightValue ? 0 : 1;
      } else {
        return leftValue.toString().toLocaleLowerCase().localeCompare(rightValue.toString().toLocaleLowerCase());
      }
    }));
  }
}
