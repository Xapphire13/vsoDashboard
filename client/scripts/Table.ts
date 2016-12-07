/// <reference path="../../typings/index.d.ts" />

import {ContentLoader} from "./ContentLoader";
import {ContextMenu} from "./ContextMenu";
import {ICommand} from "./ICommand";

export enum FormatType {
  html,
  map
}

export interface IColumn<T> {
  name: string;
  itemKey?: string;
  format?: any;
  formatType?: FormatType;
  onClick?: (item: T) => void;
  width?: number;
  style?: string;
  cssClass?: string;
}

export interface ITableOptions<T> {
  columns: IColumn<T>[];
  getRowCssClasses?: (item: T) => string[];
  supplyCommands?: (item: T) => ICommand<any>[];
}

export class Table<T> {
  public items: KnockoutObservableArray<T>;
  public columns: IColumn<T>[];
  public id: string;
  public dom: JQuery;

  private _headerRow: JQuery;
  private _domTemplate: string = "<div class='table-wrapper' data-bind=\"template: { name: 'table-template' }\"></div>";
  private static _tableCount = 0;
  private _getRowCssClasses: (item: T) => string[];
  private _supplyCommands: (item: T) => ICommand<any>[];

  constructor(items: KnockoutObservableArray<T>, options: ITableOptions<T>) {
    this.items = items || ko.observableArray<T>([]);
    this.columns = options.columns.map(column => <IColumn<T>>{
      name: column.name,
      itemKey: null || column.itemKey,
      format: null || column.format,
      formatType: null || column.formatType,
      onClick: null || column.onClick,
      width: null || column.width,
      style: null || column.style,
      cssClass: null || column.cssClass
    });
    this._getRowCssClasses = options.getRowCssClasses;
    this._supplyCommands = options.supplyCommands;
    this.id = `table-${Table._tableCount++}`;

    // Init DOM
    this.dom = $(this._domTemplate);
    this.dom.attr("id", this.id);
  }

  public init(): Q.Promise<any> {
    ContentLoader.loadStylesheets(["table"]);
    return ContentLoader.loadHtmlTemplates(["table"]).then(() => {
      ko.applyBindings(this, document.getElementById(this.id));
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
}
