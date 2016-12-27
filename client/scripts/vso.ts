/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../typings/StringFormat.d.ts"/>

import {Application} from "./Application";

// Force users to use the https version of the site
if(location.hostname !== "127.0.0.1" && location.protocol != "https:") {
  location.assign(`https:${location.href.substring(location.protocol.length)}`);
}

// Refresh the page every 24hrs to pull new features
setTimeout(() => {
  window.location.reload();
}, 24 * 60 * 60 * 1000);

$(document).ready(() => {
  let app = new Application();
  ko.applyBindings(app, $("body")[0]);

  app.load();
})
