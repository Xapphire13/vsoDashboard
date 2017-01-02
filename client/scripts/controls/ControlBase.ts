/// <reference path="../../../typings/index.d.ts" />

import {ContentLoader} from "../ContentLoader";

export abstract class ControlBase {
  private _initialized: Q.Promise<any>;
  private _templateName: string;

  constructor(templateName: string) {
    this._templateName = templateName;
    this._initialized = this._init();
  }

  public getHtml(): Q.Promise<string> {
    return this._initialized.then(() => {
      return $(`#${this._templateName}-template`).html();
    });
  }

  private _init(): Q.Promise<any> {
    ContentLoader.loadStylesheets(this._templateName);
    return ContentLoader.loadHtmlTemplates(this._templateName);
  }
}
