/// <reference path="../typings/index.d.ts" />

import {ContentLoader} from "./ContentLoader";

export class Panel {
  public dom: JQuery;
  public id: string;
  public title: KnockoutObservable<string> = ko.observable("");
  public child: KnockoutObservable<JQuery> = ko.observable<JQuery>();
  public onRemove: () => void;

  private static _panelCount = 0;

  private _initialized: boolean = false;
  private _domTemplate: string = "<div class='panel' data-bind=\"template: { name: 'panel-template' }\"></div>";
  private _childContainer: JQuery;

  constructor(title: string) {
    this.title(title);
    this.id = `panel-${Panel._panelCount++}`;

    // Init dom
    this.dom = $(this._domTemplate);
    this.dom.attr("id", this.id);
  }

  public init(): Q.Promise<any> {
    if(!this._initialized) {
      return ContentLoader.loadHtmlTemplates(["panel"]).then(() => {
        ko.applyBindings(this, document.getElementById(this.id));

        this._childContainer = this.dom.find(".container-content");

        this._setChild();
        this.child.subscribe(newValue => this._setChild());

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
