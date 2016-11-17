/// <reference path="../typings/index.d.ts" />
/// <reference path="../typings/StringFormat.d.ts"/>

import {IPullRequest} from "./IPullRequest";
import {IColumn, Table, FormatType} from "./Table";
import {Panel} from "./Panel";
import {IRepository} from "./IRepository";
import {IProject} from "./IProject";

let prUrlTemplate = "https://msazure.visualstudio.com/One/_git/{0}/pullrequest/{1}"
let projectUrl = "https://msazure.visualstudio.com/DefaultCollection";
let apiUri = "https://msazure.visualstudio.com/DefaultCollection/One/_apis/git";
let key: string;
let upn: string;
let loadTimeout = null;
let columns = <IColumn<IPullRequest>[]>[
  {
    name: "",
    format: (item: IPullRequest) => {
      let requiredReviewers = item.reviewers.filter(reviewer => reviewer.isRequired);
      let rejected = item.reviewers.filter(reviewer => reviewer.vote == -10)[0] != undefined;
      let waiting = item.reviewers.filter(reviewer => reviewer.vote == -5)[0] != undefined;

      if(rejected) {
        return "<div style='width: 10px; height: 10px;' class='rejected-noAlpha'></div>"
      } else if (waiting) {
        return "<div style='width: 10px; height: 10px;' class='waiting-noAlpha'></div>"
      } else {
        if(requiredReviewers.filter(reviewer => reviewer.vote <= 0)[0] == undefined) { // All signed off
          return "<div style='width: 10px; height: 10px;' class='approved-noAlpha'></div>"
        }

        return "<div style='width: 10px; height: 10px;' class='noResponse-noAlpha'></div>"
      }
    },
    formatType: FormatType.map,
    width: 2
  },
  {
    name: "Title",
    itemKey: "title",
    onClick: item => {
      let prLink = prUrlTemplate.format(item.repository.id, item.pullRequestId);

      window.open(prLink, "_blank");
    },
    width: 53
  },
  {
    name: "Status",
    itemKey: "status",
    width: 10
  },
  {
    name: "Created By",
    itemKey: "createdBy.displayName",
    width: 15
  },
  {
    name: "Created Date",
    itemKey: "creationDate",
    formatType: FormatType.map,
    format: item => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      let dateTime = new Date(item);
      let padNumber = (val: number) => {
        let str = val.toString();

        return str.length < 2 ? `0${str}` : str;
      }

      return `${months[dateTime.getMonth()]}-${padNumber(dateTime.getDate())}-${dateTime.getFullYear()} ${padNumber(dateTime.getHours())}:${padNumber(dateTime.getMinutes())}`;
    },
    width: 15
  },
  {
    name: "Codeflow",
    format: "<img style='display: block; margin-left: auto; margin-right: auto;' src='./images/codeflow.png'/>",
    formatType: FormatType.html,
    onClick: item => {
      let codeflowLinkTemplate = "codeflow:open?server={0}&project={1}&repo={2}&pullRequest={3}";
      let codeflowLink = codeflowLinkTemplate.format(projectUrl, item.repository.project.id, item.repository.id, item.pullRequestId);

      window.open(codeflowLink, "_self");
    },
    width: 5
  }
];
let tableMap = {};

function loadPullRequests(repositoryId: string, table: Table<IPullRequest>) {
  let uri = `${apiUri}/repositories/${repositoryId}/pullRequests?api-version=2.0`

  $.ajax({
    url: uri,
    headers: {
      "Authorization": `Basic ${key}`
    }
  }).then(result => {
    let pullRequests = result.value as IPullRequest[];
    table.items(pullRequests);
  })
}

function addRepoTable(title: string, repoId: string): Table<IPullRequest> {
  let table = new Table<IPullRequest>(null, {
    columns: columns,
    getRowCssClasses: (item: IPullRequest) => {
      let me = item.reviewers.filter(reviewer => reviewer.uniqueName == upn)[0];

      if(me != undefined) {
        switch(me.vote) {
          case 0:
            return ["noResponse"];
          case 5:
          case 10:
            return ["approved"];
          case -5:
            return ["waiting"];
          case -10:
            return ["rejected"]
        }
      }

      return [];
    }
  });

  let panel = new Panel(title);
  panel.onRemove = () => {
    delete tableMap[repoId];

    let trackedRepos = (JSON.parse(localStorage.getItem("trackedRepos")) || []) as string[];
    localStorage.setItem("trackedRepos", JSON.stringify(trackedRepos.filter(repo => repo != repoId)));
  };
  panel.child(table.dom);
  panel.init().then(() => table.init());

  if($("#content").children(".container").length > 0) {
    panel.dom.css("margin-top", "25px");
  }
  $("#content").append(panel.dom);

  tableMap[repoId] = table;

  let trackedRepos = (JSON.parse(localStorage.getItem("trackedRepos")) || []) as string[];
  if(trackedRepos.filter(repo => repo == repoId).length == 0) {
    trackedRepos.push(repoId);
    localStorage.setItem("trackedRepos", JSON.stringify(trackedRepos));
  }

  return table;
}

function setupRepoSearch(): void {
  let repoSearchCloseButton = $("#repoSearchCloseButton");
  let repoSearchContainer = $("#repoSearchContainer");
  let repoSearchListItem = $("#repoSearchListItem");
  let repoSearchBox = $("#repoSearchBox");
  let repoSearchButton = $("#repoSearchButton");

  repoSearchCloseButton.on("click", e => {
    e.stopPropagation();

    repoSearchContainer.slideUp(250);
    repoSearchCloseButton.hide();
    repoSearchListItem.removeClass("open");
  });

  repoSearchListItem.on("click", () => {
    repoSearchCloseButton.css("display", "inline-block");
    repoSearchContainer.slideDown(250);
    repoSearchListItem.addClass("open");
  });

  repoSearchBox.on("focus", () => {
    repoSearchBox.select();
  });

  repoSearchButton.on("click", () => {
    let uri = `${apiUri}/repositories/?api-version=2.0`;
    $.ajax({
      url: uri,
      headers: {
        "Authorization": `Basic ${key}`
      }
    }).then((results: {value: IRepository[]}) => {
      let searchString = (repoSearchBox.val() as string).toLowerCase();
      let repositories = results.value.filter(repo => repo.name.toLowerCase().search(searchString) >= 0);

      let resultsTable = new Table<IRepository>(null, {
        columns: <IColumn<IRepository>[]>[
          {
            name: "Name",
            itemKey: "name",
            onClick: item => {
              let table = addRepoTable(item.name, item.id);
              loadPullRequests(item.id, table);
            }
          }
        ]
      })
      resultsTable.items(repositories);

      repoSearchContainer.children(".table").remove();
      repoSearchContainer.append(resultsTable.dom);
      resultsTable.init();
    });
  })
}

$(document).ready(() => {
  let refreshIntervalMin = Number(localStorage.getItem("refreshIntervalMin") || 5);

  key = localStorage.getItem("accessKey");
  upn = localStorage.getItem("upn");

  if(key == undefined) {
    // Get users name
    let result = prompt("What is your first name?");
    while (result == undefined || result == "") {
      result = prompt("Name cannot be empty! What is your first name?");
    }
    let name = result;

    // Get VSO access token
    result = prompt("Enter access token");
    while (result == undefined || result == "") {
      result = prompt("Access token cannot be empty! Enter access token");
    }
    let token = result;

    key = btoa(`${name}:${token}`);
    localStorage.setItem("accessKey", key);

    // Get UPN
    result = prompt("What is your full email address?");
    while (result == undefined || result == "") {
      result = prompt("Email cannot be empty! Enter full email address");
    }
    upn = result;
    localStorage.setItem("upn", upn);
  }

  $("#refreshPeriodList").children("li").removeClass("selected");
  $("#refreshPeriodList").children("li").filter((index, element) => $(element).html() == refreshIntervalMin.toString()).addClass("selected");

  $("#refreshPeriodList").children("li").on("click", event => {
    $("#refreshPeriodList").children("li").removeClass("selected");
    let source = $(event.target);
    source.addClass("selected");

    refreshIntervalMin = Number(source.html());
    localStorage.setItem("refreshIntervalMin", source.html());
    clearTimeout(loadTimeout);
    setTimeout(load, refreshIntervalMin * 60 * 1000);
  });

  setupRepoSearch();

  $("#signOutButton").on("click", () => {
    localStorage.clear();
    location.reload();
  });

  let trackedRepos = (JSON.parse(localStorage.getItem("trackedRepos")) || []) as string[];
  let repoFetches = trackedRepos.map(repoId => {
    let uri = `${apiUri}/repositories/${repoId}?api-version=2.0`;
    return Q<IRepository>($.ajax({
      url: uri,
      headers: {
        "Authorization": `Basic ${key}`
      }
    }));
  });

  Q.all(repoFetches).then(repos => {
    repos.forEach(repo => {
      let table = addRepoTable(repo.name, repo.id);
      tableMap[repo.id] = table;
      loadPullRequests(repo.id, table);
    })
  });

  let load = () => {
    Object.keys(tableMap).forEach(repoId => {
      let table = tableMap[repoId] as Table<IPullRequest>;

      loadPullRequests(repoId, table);
    });

    loadTimeout = setTimeout(load, refreshIntervalMin * 60 * 1000)
  };

  load();
})
