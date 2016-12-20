/// <reference path="../../typings/index.d.ts" />

import {ContentLoader} from "./ContentLoader";

export abstract class ControlBase {
  protected dom: JQuery;

  private _initialized: Q.Promise<any>;

  constructor(templateName: string) {
    this._initialized = this._init(templateName);
  }

  public getDom(): Q.Promise<JQuery> {
    return this._initialized.then(() => {
      return this.dom;
    });
  }

  private _init(templateName: string): Q.Promise<any> {
    ContentLoader.loadStylesheets([templateName]);
    return ContentLoader.loadHtmlTemplates([templateName]).then(() => {
      this.dom = $($(`#${templateName}-template`).html());
    });
  }
}
