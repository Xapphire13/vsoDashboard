/// <reference path="../../typings/index.d.ts" />

import {ContentLoader} from "./ContentLoader";
import {ControlBase} from "./controls/ControlBase";
import {IPageViewModel} from "./models/IPageViewModel";

let handlers: {[key: string]: KnockoutBindingHandler} = {
  control: {
    init: (element: HTMLElement, valueAccessor, allBindings, viewModel, bindingContext) => {
      return { controlsDescendantBindings: true };
    },
    update: (element: HTMLElement, valueAccessor, allBindings, viewModel, bindingContext) => {
      let control: ControlBase = ko.unwrap(valueAccessor());

      if(control != undefined) {
        let $element = $(element);
        $element.empty();
        let childBindingContext: KnockoutBindingContext = bindingContext.createChildContext(control);

        if(control.stylesheetPath != undefined) {
          ContentLoader.loadStylesheets(control.stylesheetPath);
        }

        ContentLoader.loadHtmlTemplate(control.templatePath).then(html => {
          $element.append(html);
          ko.applyBindingsToDescendants(childBindingContext, $element[0]);
          control.load();
        }, reason => {
          console.error(reason);
        });
      }
    }
  },
  page: {
    init: (element: HTMLElement, valueAccessor, allBindings, viewModel, bindingContext) => {
      return { controlsDescendantBindings: true };
    },
    update: (element: HTMLElement, valueAccessor, allBindings, viewModel, bindingContext) => {
      let page: IPageViewModel = ko.unwrap(valueAccessor());

      if(page != undefined) {
        let $element = $(element);
        $element.empty();
        let childBindingContext: KnockoutBindingContext = bindingContext.createChildContext(page);

        if(page.stylesheetPath != undefined) {
          ContentLoader.loadStylesheets(page.stylesheetPath);
        }

        let $loading = $(
          "<div> " +
          "<img style='position: absolute; max-height: 60px; top: 50%; left: 50%; transform: translate(-50%, -50%);' src='/images/loading.gif'></img>" +
          "</div>");

        $element.append($loading);

        ContentLoader.loadHtmlTemplate(`/scripts/pages/${page.templatePath}`).then(html => {
          $element.empty();
          $element.append(html);
          ko.applyBindingsToDescendants(childBindingContext, $element[0]);
          page.load();
        }, reason => {
          console.error(reason);
        });
      }
    }
  }
}


export function init() {
  Object.keys(handlers).forEach(key => {
    ko.bindingHandlers[key] = handlers[key];
  })
}
