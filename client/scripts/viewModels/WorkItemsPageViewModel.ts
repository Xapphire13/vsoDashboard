/// <reference path="../../../typings/index.d.ts" />
/// <reference path="../../../typings/StringFormat.d.ts"/>

import {IMenuItem} from "../models/IMenuItem";
import {IPageViewModel} from "../models/IPageViewModel";
import {IWorkItem} from "../api/models/IWorkItem";
import {Panel} from "../controls/Panel";
import {Table} from "../controls/Table";
import {VsoProxy} from "../api/VsoProxy";

const iterationPathKey = "System.IterationPath";

export class WorkItemsPageViewModel
  implements IPageViewModel {

    public menuItems: KnockoutObservableArray<IMenuItem> = ko.observableArray([]);
    public viewName: string = "workItems";
    public panels: KnockoutObservableArray<Panel> = ko.observableArray([]);

    private _vsoProxy: VsoProxy;
    private _workItemUrlTemplate = "https://msazure.visualstudio.com/Intune/_workitems?id={0}"

    constructor(vsoProxy: VsoProxy) {
      this._vsoProxy = vsoProxy;
    }

    load(): Q.Promise<any> {
      return this._vsoProxy.listWorkItems().then(items => {
        let buckets: {[bucketKey: string]: IWorkItem[]} = {};

        items.forEach(item => {
          let bucketKey = item.fields[iterationPathKey];
          if(buckets[bucketKey] == undefined) {
            buckets[bucketKey] = [item];
          } else {
            buckets[bucketKey].push(item);
          }
        });

        let getLastPathPart = (path: string) => {
          let parts = path.split("\\");
          let index = parts.length - 1;

          if(index < 0) {
            return null;
          }

          return parts[index];
        }
        let isNumericPath = (path: string) => {
          return !isNaN(<any>(getLastPathPart(path)));
        };

        let numericPaths = Object.keys(buckets).filter(bucketKey => isNumericPath(bucketKey));
        let others = Object.keys(buckets).filter(bucketKey => !isNumericPath(bucketKey));

        let addPanel = (bucketKey: string) => {
          let table = new Table<IWorkItem>(null, {
            columns: [
              {
                name: "Bug #",
                itemKey: "id",
                width: "80px"
              },
              {
                name: "Title",
                itemKey: ["fields", "System.Title"],
                onClick: item => {
                  let prLink = this._workItemUrlTemplate.format(item.id);

                  window.open(prLink, "_blank");
                }
              }
            ]
          });

          let panel = new Panel({
            title: bucketKey,
            loadContent: () => {
              table.items(buckets[bucketKey]);
              return Q();
            }
          });

          panel.child(table);

          this.panels.push(panel);
        }

        numericPaths.sort((left, right) => {
          let leftPart = parseInt(getLastPathPart(left));
          let rightPart = parseInt(getLastPathPart(right));

          return leftPart === rightPart ? 0 : leftPart < rightPart ? -1 : 1;
        }).forEach(addPanel);

        others.forEach(addPanel);
      });
    }

    unload(): void {

    }
  }
