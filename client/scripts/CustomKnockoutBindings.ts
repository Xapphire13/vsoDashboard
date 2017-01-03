/// <reference path="../../typings/index.d.ts" />

import {ContentLoader} from "./ContentLoader";
import {ControlBase} from "./controls/ControlBase";
import {IViewModel} from "./models/IViewModel";

let handlers: {[key: string]: KnockoutBindingHandler} = {
  viewModel: {
    init: (element: HTMLElement, valueAccessor, allBindings, viewModel, bindingContext) => {
      return { controlsDescendantBindings: true };
    },
    update: (element: HTMLElement, valueAccessor, allBindings, viewModel, bindingContext) => {
      let view: IViewModel | ControlBase = ko.unwrap(valueAccessor());

      if(view != undefined) {
        let $element = $(element);
        $element.empty();
        let childBindingContext: KnockoutBindingContext = bindingContext.createChildContext(view);

        let fetchHtml: Q.Promise<string>;
        if((<ControlBase>view).getHtml != undefined) {
          fetchHtml = (<ControlBase>view).getHtml();
        } else if ((<IViewModel>view).viewName != undefined) {
          fetchHtml = ContentLoader.loadView((<IViewModel>view).viewName);
        }

        fetchHtml.then(html => {
          $element.append(html);
          ko.applyBindingsToDescendants(childBindingContext, $element[0]);
        }, reason => {
          console.error(reason);
        });
      }
    }
  },
}


export function init() {
  Object.keys(handlers).forEach(key => {
    ko.bindingHandlers[key] = handlers[key];
  })
}
