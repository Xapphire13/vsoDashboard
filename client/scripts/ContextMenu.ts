/// <reference path="../../typings/index.d.ts" />

import {ContentLoader} from "./ContentLoader";
import {ICommand, CommandStatus} from "./ICommand";

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

    items.forEach(item => item.status ? null : item.status = ko.observable(CommandStatus.none));

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
      menu.on("click", e => {
        e.stopPropagation();
        return false;
      });
      menu.on("contextmenu", e => {
        return false;
      })
      ContextMenu.hide();
      $("body").append(menu);
      ko.applyBindings({
        items: items,
        onClick: ContextMenu.onClick
      }, document.getElementsByClassName("contextMenu")[0]);
      menu.css("left", xPos);
      menu.css("top", yPos);
      menu.show();
    });
  }

  public static hide(): void {
    $(".contextMenu").remove();
  }

  private static onClick(command: ICommand<any>): Q.Promise<any> {
    command.status(CommandStatus.loading);

    return Q.all([
      Q.delay(1000), // Synthetic delay
      command.onClick(command).then(() => {
        command.status(CommandStatus.success);
        return Q.delay(500); // Show success for a little
      })
    ]).then(() => {
      ContextMenu.hide();
    }, reason => {
      command.status(CommandStatus.error);
    });
  }
}
