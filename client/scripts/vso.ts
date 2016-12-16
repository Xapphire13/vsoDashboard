/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../typings/StringFormat.d.ts"/>

import {ClientOAuthHelper} from "./ClientOAuthHelper";
import {ContextMenu} from "./ContextMenu";
import {IAccessToken} from "../../shared/IAccessToken";
import {IColumn, Table, FormatType} from "./Table";
import {ICommand} from "./ICommand";
import {IProfile} from "./IProfile";
import {IProject} from "./IProject";
import {IPullRequest} from "./IPullRequest";
import {IRepository} from "./IRepository";
import {ITrackedRepo} from "./ITrackedRepo";
import {IUser} from "./IUser";
import {Panel} from "./Panel";
import {PullRequestStatus} from "./PullRequestStatus";
import {PullRequestVote} from "./PullRequestVote";
import {VsoProxy} from "./VsoProxy";

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
  public accessToken: string;
  public columns = <IColumn<IPullRequest>[]>[
    {
      name: "",
      format: (item: IPullRequest) => {
        let requiredReviewers = item.reviewers.filter(reviewer => reviewer.isRequired);
        let rejected = item.reviewers.filter(reviewer => reviewer.vote == PullRequestVote.rejected)[0] != undefined;
        let waiting = item.reviewers.filter(reviewer => reviewer.vote == PullRequestVote.waiting)[0] != undefined;
        const template = "<div style='width: 10px; height: 10px; position: absolute; top: 50%; transform: translate(0, -50%);' class='{0}'></div>"

        if(rejected) {
          return template.format("rejected-noAlpha");
        } else if (waiting) {
          return template.format("waiting-noAlpha");
        } else {
          if(requiredReviewers.filter(reviewer => reviewer.vote <= 0)[0] == undefined) { // All signed off
            return template.format("approved-noAlpha");
          }

          return template.format("noResponse-noAlpha");
        }
      },
      formatType: FormatType.map,
      width: "12px"
    },
    {
      name: "",
      itemKey: "comments",
      width: "45px"
    },
    {
      name: "Title",
      itemKey: "title",
      onClick: item => {
        let prLink = this.prUrlTemplate.format(item.repository.id, item.pullRequestId);

        window.open(prLink, "_blank");
      },
      width: 1
    },
    {
      name: "Status",
      itemKey: "status",
      width: "60px"
    },
    {
      name: "Created By",
      itemKey: "createdBy.displayName",
      width: "200px"
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
      width: "145px"
    },
    {
      name: "Codeflow",
      format: "<img style='display: block; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);' src='./images/codeflow.png'/>",
      formatType: FormatType.html,
      onClick: item => {
        let codeflowLinkTemplate = "codeflow:open?server={0}&project={1}&repo={2}&pullRequest={3}";
        let codeflowLink = codeflowLinkTemplate.format(this.projectUrl, item.repository.project.id, item.repository.id, item.pullRequestId);

        window.open(codeflowLink, "_self");
      },
      width: "75px"
    },
    {
      name: "",
      format: "<div style='text-align: center; position: absolute; top: 50%; transform: translate(0, calc(-50% - 4px));'>\u2026</div>",
      formatType: FormatType.html,
      onClick: (item, event: MouseEvent) => {
        let element = document.elementFromPoint(event.clientX, event.clientY);
        let bound = element.getBoundingClientRect();

        ContextMenu.show(bound.left, bound.bottom, this._supplyPullRequestCommands(item));
      },
      width: "25px"
    }
  ];

  public me: IProfile;
  public panels: {panel: Panel, repoId: string}[] = [];
  public prUrlTemplate = "https://msazure.visualstudio.com/One/_git/{0}/pullrequest/{1}"
  public projectUrl = "https://msazure.visualstudio.com/DefaultCollection";
  public refreshIntervalMin = ko.observable(0);
  public trackedRepos: ITrackedRepo[];
  public upn: string;
  public vsoProxy: VsoProxy;

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

      let trackedRepos = (JSON.parse(localStorage.getItem("trackedRepos")) || []) as ITrackedRepo[];

      // Fix things for backward compatibility
      trackedRepos = trackedRepos.filter(repo => repo != undefined).map(repo => {
        if(typeof(repo) === "string") {
          return <ITrackedRepo>{
            isMinimized: false,
            justMine: true,
            repoId: repo
          }
        }

        return repo;
      });

      this.trackedRepos = trackedRepos;
      localStorage.setItem("trackedRepos", JSON.stringify(this.trackedRepos));

      let repoFetches = this.trackedRepos.map(repo => this.vsoProxy.fetchRepository(repo.repoId));

      Q.all(repoFetches).then(repos => {
        repos.forEach(repo => {
          let trackedRepo = this.trackedRepos.filter(tr => tr.repoId === repo.id)[0];
          let table = this.addRepoTable(repo.name, repo.id, trackedRepo.isMinimized, trackedRepo.justMine);
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
        let comments = ko.observable("<div style='position: absolute; top: 50%; transform: translate(0, -50%);''><img src='/images/comment.png' style='width: 16px; height: 16px; position: relative; top:4px;'/><span style='margin-left: 5px;'>-</span></div>");
        pullRequest["comments"] = comments;

        return this.vsoProxy.fetchThreads(pullRequest).then(threads => {
          let commentCount = 0;
          threads.filter(thread => thread.properties != undefined && thread.properties.CodeReviewThreadType == undefined).forEach(thread => {
            commentCount += thread.comments.length;
          });

          comments(`<div style='position: absolute; top: 50%; transform: translate(0, -50%);''><img src='/images/comment.png' style='width: 16px; height: 16px; position: relative; top:4px;'/><span style='margin-left: 5px;'>${commentCount}</span></div>`);
        });
      })

      table.items(pullRequests);
    });
  }

  public addRepoTable(title: string, repoId: string, isMinimized: boolean, showOnlyMine: boolean): Table<IPullRequest> {
    let repo = this.trackedRepos.filter(repo => repo.repoId === repoId)[0];

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

    let justMine = ko.observable(showOnlyMine);
    let loadData = () => {
      if(justMine()) {
        return this.loadPullRequests(repoId, table, this.upn);
      }

      return this.loadPullRequests(repoId, table);
    };

    let panel = new Panel({
      title: title,
      loadContent: loadData,
      onRemove: () => {
        this.trackedRepos = this.trackedRepos.filter(repo => repo.repoId != repoId);
        localStorage.setItem("trackedRepos", JSON.stringify(this.trackedRepos));
        this.panels = this.panels.filter(p => p.repoId !== repoId);
      },
      refresh: () => {
        return loadData();
      },
      refreshInterval: this.refreshIntervalMin,
      minimized: isMinimized,
    });
    panel.minimizedText = ko.computed(() => {
      return panel.loading() ? "Loading..." : `${table.items().length} PR${table.items().length === 1 ? "" : "s"}`;
    });
    panel.commands([
      {
        label: "Mine",
        active: justMine,
        onClick: () => {
          justMine(true);
          panel.loading(true);

          if(repo != undefined) {
            repo.justMine = true;
            localStorage.setItem("trackedRepos", JSON.stringify(this.trackedRepos));
          }

          return loadData().then(() => panel.loading(false));
        }
      },
      {
        label: "Everyones",
        active: ko.computed(() => !justMine()),
        onClick: () => {
          justMine(false);
          panel.loading(true);

          if(repo != undefined) {
            repo.justMine = false;
            localStorage.setItem("trackedRepos", JSON.stringify(this.trackedRepos));
          }

          return loadData().then(() => panel.loading(false));
        }
      }
    ]);

    panel.minimized.subscribe(newValue => {
      if(repo != undefined) {
        repo.isMinimized = newValue;
        localStorage.setItem("trackedRepos", JSON.stringify(this.trackedRepos));
      }
    });

    panel.getHtml().then(html => {
      let reference = $(`<span>${html}</span>`);
      let element = reference[0];
      (<any>panel)._reference = reference;
      $("#content").append(element);
      ko.applyBindings(panel, element);
      panel.setChild(table);
    })
    this.panels.push({
      panel: panel,
      repoId: repoId
    });

    if(repo == undefined) {
      repo = <ITrackedRepo>{
        isMinimized: isMinimized,
        justMine: showOnlyMine,
        repoId: repoId
      };
      this.trackedRepos.push(repo);
      localStorage.setItem("trackedRepos", JSON.stringify(this.trackedRepos));
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
      let resultsTable = new Table<IRepository>(null, {
        columns: <IColumn<IRepository>[]>[
          {
            name: "Name",
            itemKey: "name",
            onClick: item => {
              let table = this.addRepoTable(item.name, item.id, false, true);
            }
          }
        ]
      });

      let panel = new Panel({
        title: "Search Results",
        loadContent: () => {
          return this.vsoProxy.listRepositories().then(repositories => {
            let searchString = (repoSearchBox.val() as string).toLowerCase();
            repositories = repositories.filter(repo => repo.name.toLowerCase().search(searchString) >= 0);
            resultsTable.items(repositories);
          });
        },
        invisible: true
      });

      repoSearchContainer.find(".panel").parent().remove();
      panel.getHtml().then(html => {
        let reference = $(`<span>${html}</span>`);
        let element = reference[0];
        (<any>panel)._reference = reference;
        repoSearchContainer.append(element);
        ko.applyBindings(panel, element);
      })
      panel.setChild(resultsTable);
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
            // Completing takes a few seconds. TODO - Make this poll on status
            return Q.delay(4000).then(() => {
              this.panels.forEach(p => p.repoId == item.repository.id ? p.panel.refresh() : null);
            });
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
