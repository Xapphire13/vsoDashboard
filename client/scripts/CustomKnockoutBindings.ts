/// <reference path="../../typings/index.d.ts" />

import {ContentLoader} from "./ContentLoader";
import {ControlBase} from "./ControlBase";
import {IPageViewModel} from "./IPageViewModel";

let handlers: {[key: string]: KnockoutBindingHandler} = {
  boundHtml: {
    init: (element: HTMLElement, valueAccessor, allBindings, viewModel, bindingContext) => {
      return { controlsDescendantBindings: true };
    },
    update: (element: HTMLElement, valueAccessor, allBindings, viewModel, bindingContext) => {
      let htmlLoader: Q.Promise<string> = ko.unwrap(valueAccessor());

      if(htmlLoader != undefined) {
        let $element = $(element);
        $element.empty();

        htmlLoader.then(html => {
          $element.append(html);
          ko.applyBindingsToDescendants(bindingContext, $element[0]);
        }, reason => {
          console.error(reason);
        });
      }
    }
  },
  control: {
    init: (element: HTMLElement, valueAccessor, allBindings, viewModel, bindingContext) => {
      return { controlsDescendantBindings: true };
    },
    update: (element: HTMLElement, valueAccessor, allBindings, viewModel, bindingContext) => {
      let $element = $(element);
      let controlViewModel: ControlBase = ko.unwrap(valueAccessor());
      let childBindingContext: KnockoutBindingContext = bindingContext.createChildContext(controlViewModel);

      if(controlViewModel != null) {
        controlViewModel.getHtml().then(html => {
          let $html = $(html);
          $element.empty();
          $element.append($html);
          ko.applyBindingsToDescendants(childBindingContext, $element[0]);
        }).fail(reason => {
          console.error(reason);
        });
      }
    }
  },
  view: {
    init: (element: HTMLElement, valueAccessor, allBindings, viewModel, bindingContext) => {
      return { controlsDescendantBindings: true };
    },
    update: (element: HTMLElement, valueAccessor, allBindings, viewModel, bindingContext) => {
      let viewName: string = ko.unwrap(valueAccessor());

      if(viewName != undefined) {
        let $element = $(element);
        $element.empty();

        ContentLoader.loadView(viewName).then(html => {
          $element.append(html);
          ko.applyBindingsToDescendants(bindingContext, $element[0]);
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
