/// <reference path="../../typings/index.d.ts" />

import {ControlBase} from "./ControlBase";

let handlers: {[key: string]: KnockoutBindingHandler} = {
  control: {
    init: (element: HTMLElement, valueAccessor, allBindings, viewModel, bindingContext) => {
      return { controlsDescendantBindings: true };
    },
    update: (element: HTMLElement, valueAccessor, allBindings, viewModel, bindingContext) => {
      let $element = $(element);
      let controlViewModel: ControlBase  = ko.unwrap(valueAccessor());
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
    },
  }
}

export function init() {
  Object.keys(handlers).forEach(key => {
    ko.bindingHandlers[key] = handlers[key];
  })
}
