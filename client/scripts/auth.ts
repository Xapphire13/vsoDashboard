/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../typings/StringFormat.d.ts"/>

import {ClientOAuthHelper} from "./ClientOAuthHelper";

$(document).ready(() => {
  let code = window.location.href.match(/code=([^&]*)/i)[1];
  let state = location.href.match(/state=([^&]*)/i)[1];

  let oAuthHelper = new ClientOAuthHelper();

  if(code != undefined && code != "") {
    oAuthHelper.getAccessToken(code, state).then(accessToken => {
      localStorage.setItem("accessToken", JSON.stringify(accessToken));
      window.location.assign("/");
    });  
  }
});
