/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../typings/StringFormat.d.ts"/>

import {IPullRequest} from "./IPullRequest";
import {IColumn, Table, FormatType} from "./Table";
import {Panel} from "./Panel";
import {IRepository} from "./IRepository";
import {IProject} from "./IProject";
import {ClientOAuthHelper} from "./ClientOAuthHelper";
import {IUser} from "./IUser";
import {VsoProxy} from "./VsoProxy";
import {IAccessToken} from "../../shared/IAccessToken";
import {ContextMenu} from "./ContextMenu";
import {IProfile} from "./IProfile";
import {ICommand} from "./ICommand";
import {PullRequestStatus} from "./PullRequestStatus";
import {PullRequestVote} from "./PullRequestVote";

$(document).ready(() => {
  let refreshIntervalMin = Number(localStorage.getItem("refreshIntervalMin") || 5);

  let app = new Application(refreshIntervalMin);
  app.start();

  // Refresh the page every 24hrs to pull new features
  setTimeout(() => {
    window.location.reload();
  }, 24 * 60 * 60 * 1000);
})

class Application {
  public prUrlTemplate = "https://msazure.visualstudio.com/One/_git/{0}/pullrequest/{1}"
  public projectUrl = "https://msazure.visualstudio.com/DefaultCollection";
  public accessToken: string;
  public upn: string;
  public me: IProfile;
  public vsoProxy: VsoProxy;
  public refreshIntervalMin = ko.observable(0);
  public panels: {panel: Panel, repoId: string}[] = [];
  public columns = <IColumn<IPullRequest>[]>[
    {
      name: "",
      format: (item: IPullRequest) => {
        let requiredReviewers = item.reviewers.filter(reviewer => reviewer.isRequired);
        let rejected = item.reviewers.filter(reviewer => reviewer.vote == PullRequestVote.rejected)[0] != undefined;
        let waiting = item.reviewers.filter(reviewer => reviewer.vote == PullRequestVote.waiting)[0] != undefined;

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
      name: "",
      itemKey: "comments",
      width: 5
    },
    {
      name: "Title",
      itemKey: "title",
      onClick: item => {
        let prLink = this.prUrlTemplate.format(item.repository.id, item.pullRequestId);

        window.open(prLink, "_blank");
      },
      width: 48
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
      width: 13
    },
    {
      name: "Codeflow",
      format: "<img style='display: block; margin-left: auto; margin-right: auto;' src='./images/codeflow.png'/>",
      formatType: FormatType.html,
      onClick: item => {
        let codeflowLinkTemplate = "codeflow:open?server={0}&project={1}&repo={2}&pullRequest={3}";
        let codeflowLink = codeflowLinkTemplate.format(this.projectUrl, item.repository.project.id, item.repository.id, item.pullRequestId);

        window.open(codeflowLink, "_self");
      },
      width: 4
    },
    {
      name: "",
      format: "<div style='text-align: center; position: relative; top: -4px;'>\u2026</div>",
      formatType: FormatType.html,
      onClick: (item, event: MouseEvent) => {
        let element = document.elementFromPoint(event.clientX, event.clientY);
        let bound = element.getBoundingClientRect();

        ContextMenu.show(bound.left, bound.bottom, this._supplyPullRequestCommands(item));
      },
      width: 3
    }
  ];

  constructor(refreshIntervalMin: number = 1) {
    this.refreshIntervalMin(refreshIntervalMin);

    let accessToken = JSON.parse(localStorage.getItem("accessToken")) as IAccessToken;
    this.vsoProxy = new VsoProxy(accessToken, newAccessToken => {
      localStorage.setItem("accessToken", JSON.stringify(newAccessToken));
    });
  }

  public start(): Q.Promise<any> {
    $(document).on("click", e => {
      ContextMenu.hide();
    });

    return this.vsoProxy.fetchUserProfile().then(me => {
      this.me = me;
      this.upn = me.emailAddress;

      ko.applyBindings({username: me.displayName}, document.getElementById("username"));
    }).then(() => {
      this.setupRefreshIntervalChange();
      this.setupRepoSearch();

      $("#signOutButton").on("click", this.signOut);

      let trackedRepos = (JSON.parse(localStorage.getItem("trackedRepos")) || []) as string[];
      // Remove null repos if any
      trackedRepos = trackedRepos.filter(repoId => repoId != undefined);
      localStorage.setItem("trackedRepos", JSON.stringify(trackedRepos));

      let repoFetches = trackedRepos.map(repoId => this.vsoProxy.fetchRepository(repoId));

      Q.all(repoFetches).then(repos => {
        repos.forEach(repo => {
          let table = this.addRepoTable(repo.name, repo.id);
        });
      });
    });
  }

  public signOut(): void {
    localStorage.clear();
    location.reload();
  }

  public setupRefreshIntervalChange(): void {
    $("#refreshPeriodList").children("li").removeClass("selected");
    $("#refreshPeriodList").children("li").filter((index, element) => $(element).html() == this.refreshIntervalMin().toString()).addClass("selected");

    $("#refreshPeriodList").children("li").on("click", event => {
      $("#refreshPeriodList").children("li").removeClass("selected");
      let source = $(event.target);
      source.addClass("selected");

      this.refreshIntervalMin(Number(source.html()));
      localStorage.setItem("refreshIntervalMin", source.html());
    });
  }

  public loadPullRequests(repositoryId: string, table: Table<IPullRequest>, userEmail?: string): Q.Promise<any> {
    return this.vsoProxy.listPullRequests(repositoryId).then(pullRequests => {
      if(userEmail != undefined) {
        pullRequests = pullRequests.filter(pr =>
          pr.reviewers.filter(reviewer => reviewer.uniqueName === userEmail).length > 0 ||
          pr.createdBy.uniqueName == this.upn);
      }

      pullRequests.map(pullRequest => {
        let comments = ko.observable("<div style='position: relative;''><img src='/images/comment.png' style='width: 16px; height: 16px; position: relative; top:4px;'/><span style='margin-left: 5px;'>-</span></div>");
        pullRequest["comments"] = comments;

        return this.vsoProxy.fetchThreads(pullRequest).then(threads => {
          let commentCount = 0;
          threads.filter(thread => thread.properties != undefined && thread.properties.CodeReviewThreadType == undefined).forEach(thread => {
            commentCount += thread.comments.length;
          });

          comments(`<div style='position: relative;''><img src='/images/comment.png' style='width: 16px; height: 16px; position: relative; top:4px;'/><span style='margin-left: 5px;'>${commentCount}</span></div>`);
        });
      })

      table.items(pullRequests);
    });
  }

  public addRepoTable(title: string, repoId: string): Table<IPullRequest> {
    let table = new Table<IPullRequest>(null, {
      columns: this.columns,
      getRowCssClasses: (item: IPullRequest) => {
        let me = item.reviewers.filter(reviewer => reviewer.uniqueName == this.upn)[0];

        if(me != undefined) {
          return [PullRequestVote[me.vote]];
        }

        return [];
      },
      supplyCommands: (item) => this._supplyPullRequestCommands(item)
    });

    let justMine = ko.observable(true);
    let loadData = () => {
      if(justMine()) {
        return this.loadPullRequests(repoId, table, this.upn);
      }

      return this.loadPullRequests(repoId, table);
    };

    let panel = new Panel({
      title: title,
      loadContent: () => table.init().then(() => {
        return loadData();
      }),
      onRemove: () => {
        let trackedRepos = (JSON.parse(localStorage.getItem("trackedRepos")) || []) as string[];
        localStorage.setItem("trackedRepos", JSON.stringify(trackedRepos.filter(repo => repo != repoId)));
        this.panels = this.panels.filter(p => p.repoId !== repoId);
      },
      refresh: () => {
        return loadData();
      },
      refreshInterval: this.refreshIntervalMin
    });
    panel.commands([
      {
        label: "Mine",
        active: justMine,
        onClick: () => {
          justMine(true);
          return loadData();
        }
      },
      {
        label: "Everyones",
        active: ko.computed(() => !justMine()),
        onClick: () => {
          justMine(false);
          return loadData();
        }
      }
    ]);
    panel.child(table.dom);
    panel.init();

    if($("#content").find(".panel-wrapper").length > 0) {
      panel.dom.css("margin-top", "25px");
    }
    $("#content").append(panel.dom);
    this.panels.push({
      panel: panel,
      repoId: repoId
    });

    let trackedRepos = (JSON.parse(localStorage.getItem("trackedRepos")) || []) as string[];
    if(trackedRepos.filter(repo => repo == repoId).length == 0) {
      trackedRepos.push(repoId);
      localStorage.setItem("trackedRepos", JSON.stringify(trackedRepos));
    }

    return table;
  }

  public setupRepoSearch(): void {
    let repoSearchCloseButton = $("#repoSearchCloseButton");
    let repoSearchContainer = $("#repoSearchContainer");
    let repoSearchListItem = $("#repoSearchListItem");
    let repoSearchBox = $("#repoSearchBox");
    let repoSearchButton = $("#repoSearchButton");

    repoSearchCloseButton.on("click", e => {
      e.stopPropagation();

      repoSearchContainer.slideUp(250);
      repoSearchContainer.children(".table-wrapper").remove();
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
      this.vsoProxy.listRepositories().then(repositories => {
        let searchString = (repoSearchBox.val() as string).toLowerCase();
        repositories = repositories.filter(repo => repo.name.toLowerCase().search(searchString) >= 0);

        let resultsTable = new Table<IRepository>(null, {
          columns: <IColumn<IRepository>[]>[
            {
              name: "Name",
              itemKey: "name",
              onClick: item => {
                let table = this.addRepoTable(item.name, item.id);
              }
            }
          ]
        })
        resultsTable.items(repositories);

        repoSearchContainer.children(".table-wrapper").remove();
        repoSearchContainer.append(resultsTable.dom);
        resultsTable.init();
      });
    })
  }

  private _supplyPullRequestCommands(item: IPullRequest): ICommand<any>[] {
    return [
      {
        label: "Send Mail",
        onClick: () => {
          location.assign(`mailto:${item.createdBy.uniqueName}?subject=${encodeURIComponent(`Pull Request: ${item.title}`)}&body=${encodeURIComponent(`Hi ${item.createdBy.displayName.split(" ")[0]},\n\nI am emailing about the following pull request ${this.prUrlTemplate.format(item.repository.id, item.pullRequestId)}\n\nThanks,\n${this.me.displayName.split(" ")[0]}`)}`);
          return Q();
        }
      },
      {
        label: "Approve",
        onClick: () => {
          return this.vsoProxy.modifySignOffVote(item, this.me, PullRequestVote.approved).then(() => {
            this.panels.forEach(p => p.repoId == item.repository.id ? p.panel.refresh() : null);
          });
        }
      },
      {
        label: "Reject",
        onClick: () => {
          return this.vsoProxy.modifySignOffVote(item, this.me, PullRequestVote.rejected).then(() => {
            this.panels.forEach(p => p.repoId == item.repository.id ? p.panel.refresh() : null);
          });
        }
      },
      {
        label: "Complete",
        onClick: () => {
          return this.vsoProxy.modifyPullRequestStatus(item, PullRequestStatus.completed).then(() => {
            this.panels.forEach(p => p.repoId == item.repository.id ? p.panel.refresh() : null);
          });
        }
      },
      {
        label: "Abandon",
        onClick: () => {
          return this.vsoProxy.modifyPullRequestStatus(item, PullRequestStatus.abandoned).then(() => {
            this.panels.forEach(p => p.repoId == item.repository.id ? p.panel.refresh() : null);
          });
        }
      }
    ];
  }
}
