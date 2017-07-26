import {ClientOAuthHelper} from "./ClientOAuthHelper";

$(document).ready(() => {
  let codeArr = window.location.href.match(/code=([^&]*)/i);
  let stateArr = location.href.match(/state=([^&]*)/i);

  let code;
  let state;
  if (codeArr != null) {
    code = codeArr[1];
  }

  if (stateArr != null) {
      state = stateArr[1];
  }

  let oAuthHelper = new ClientOAuthHelper();

  if(code != undefined && code != "" && state != undefined && state != "") {
    oAuthHelper.getAccessToken(code, state).then(accessToken => {
      localStorage.setItem("accessToken", JSON.stringify(accessToken));
      window.location.assign("/");
    });
  }
});