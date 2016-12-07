/// <reference path="../../typings/index.d.ts" />

import {ContentLoader} from "./ContentLoader";
import {ICommand} from "./ICommand";

export class ContextMenu {
  private static _initialized: boolean = false;

  private static _init(): Q.Promise<any> {
    if(!ContextMenu._initialized) {
      ContentLoader.loadStylesheets(["contextMenu"]);
      return ContentLoader.loadHtmlTemplates(["contextMenu"]).then(() => {
        ContextMenu._initialized = true;
      });
    }

    return Q();
  }

  public static show(xPos: number, yPos: number, items: ICommand<any>[]): void {
    let prom = Q();

    if(!ContextMenu._initialized) {
      prom = ContextMenu._init();
    }

    let pageWidth = document.body.clientWidth;
    let pageHeight = document.body.clientHeight;
    const menuWidth = 200;
    const itemHeight = 40;

    if((xPos + menuWidth) > (pageWidth - 10)) {
      xPos += (pageWidth - 10) - (xPos + menuWidth);
    }

    if((yPos + (itemHeight * items.length)) > (pageHeight - 10)) {
      yPos += (pageHeight - 10) - (yPos + (itemHeight * items.length));
    }

    prom.then(() => {
      let menu = $($("#contextMenu-template").html());
      ContextMenu.hide();
      $("body").append(menu);
      ko.applyBindings({items: items}, document.getElementsByClassName("contextMenu")[0]);
      menu.on("contextmenu", e => {
        return false;
      })
      menu.on("mousedown", (e) => {

      })
      menu.css("z-index", 10);
      menu.css("left", xPos);
      menu.css("top", yPos);
      menu.show();
    });
  }

  public static hide(): void {
    $(".contextMenu").remove();
  }
}
