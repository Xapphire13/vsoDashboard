import * as ClientOAuthHelpers from "./ClientOAuthHelpers";

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

  if(code != undefined && code != "" && state != undefined && state != "") {
    ClientOAuthHelpers.getAccessToken(code, state).then(accessToken => {
      localStorage.setItem("accessToken", JSON.stringify(accessToken));
      window.location.assign("/");
    });
  }
});
