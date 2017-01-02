/// <reference path="../../typings/index.d.ts" />

import {ContentLoader} from "./ContentLoader";
import {ControlBase} from "./controls/ControlBase";
import {IViewModel} from "./models/IViewModel";

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

      if(controlViewModel != null) {
        let childBindingContext: KnockoutBindingContext = bindingContext.createChildContext(controlViewModel);
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
      let view: IViewModel = ko.unwrap(valueAccessor());

      if(view != undefined) {
        let $element = $(element);
        $element.empty();
        let childBindingContext: KnockoutBindingContext = bindingContext.createChildContext(view);

        ContentLoader.loadView(view.viewName).then(html => {
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
