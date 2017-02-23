/// <reference path="../../../typings/index.d.ts" />

import {ContentLoader} from "../ContentLoader";

export abstract class ControlBase {
  public templatePath: string;
  public stylesheetPath: string;

  constructor(templatePath: string, stylesheetPath?: string) {
    this.templatePath = `/scripts/controls/${templatePath}`;
    this.stylesheetPath = stylesheetPath && `/scripts/controls/${stylesheetPath}`;
  }

  public abstract load(): Q.Promise<any>;
}
