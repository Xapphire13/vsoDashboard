/// <reference path="../../../typings/index.d.ts" />
/// <reference path="../../../typings/StringFormat.d.ts"/>

import {ClientOAuthHelper} from "../ClientOAuthHelper";
import {ContextMenu} from "../controls/ContextMenu";
import {ControlBase} from "../controls/ControlBase";
import {IAccessToken} from "../../../shared/IAccessToken";
import {IColumn, Table, FormatType} from "../controls/Table";
import {ICommand} from "../models/ICommand";
import {IMenuItem} from "../models/IMenuItem";
import {IPageViewModel} from "../models/IPageViewModel";
import {IProfile} from "../api/models/IProfile";
import {IProject} from "../api/models/IProject";
import {IPullRequest} from "../api/models/IPullRequest";
import {IRepository} from "../api/models/IRepository";
import {ITrackedRepo} from "../api/models/ITrackedRepo";
import {IUser} from "../api/models/IUser";
import {Panel} from "../controls/Panel";
import {PullRequestStatus} from "../api/models/PullRequestStatus";
import {PullRequestVote} from "../api/models/PullRequestVote";
import {VsoProxy} from "../api/VsoProxy";

export class PullRequestPageViewModel
  implements IPageViewModel {
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
  public me: KnockoutObservable<IProfile>;
  public menuItems: KnockoutObservableArray<IMenuItem> = ko.observableArray([]);
  public panels: KnockoutObservableArray<{panel: Panel, repoId: string}> = ko.observableArray<{panel: Panel, repoId: string}>([]);
  public prUrlTemplate = "https://msazure.visualstudio.com/One/_git/{0}/pullrequest/{1}"
  public projectUrl = "https://msazure.visualstudio.com/DefaultCollection";
  public refreshIntervalMin = ko.observable(0);
  public trackedRepos: ITrackedRepo[];
  public viewName: string = "pullRequests";
  public vsoProxy: VsoProxy;

  constructor(vsoProxy: VsoProxy, userProfile: KnockoutObservable<IProfile>) {
    this.vsoProxy = vsoProxy;
    this.me = userProfile;
    let refreshIntervalMin = Number(localStorage.getItem("refreshIntervalMin") || 5);
    this.refreshIntervalMin(refreshIntervalMin);

    this.menuItems([
      {
        label: "Add Repo",
        onClick: () => {},
        active: ko.observable(false)
      }
    ]);

    this.setupRefreshIntervalChange();
    this.setupRepoSearch();
    this._fetchTrackedRepos();
  }

  public load(): Q.Promise<any> {
    let repoFetches = this.trackedRepos.map(repo => this.vsoProxy.fetchRepository(repo.repoId));

    return Q.all(repoFetches).then(repos => {
      repos.forEach(repo => {
        let trackedRepo = this.trackedRepos.filter(tr => tr.repoId === repo.id)[0];
        let table = this.addRepoTable(repo.name, repo.id, trackedRepo.isMinimized, trackedRepo.justMine);
      });
    });
  }

  public unload(): void {
    this.panels().forEach(panel => {
      panel.panel.dispose();
    });
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
          pr.createdBy.uniqueName == this.me().emailAddress);
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
        let me = item.reviewers.filter(reviewer => reviewer.uniqueName == this.me().emailAddress)[0];

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
        return this.loadPullRequests(repoId, table, this.me().emailAddress);
      }

      return this.loadPullRequests(repoId, table);
    };

    let panel = new Panel({
      title: title,
      loadContent: loadData,
      onRemove: () => {
        this.trackedRepos = this.trackedRepos.filter(repo => repo.repoId != repoId);
        localStorage.setItem("trackedRepos", JSON.stringify(this.trackedRepos));
        this.panels.remove(p => p.repoId === repoId);
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
    panel.child(table);

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

    let panel = ko.observable<Panel>()

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

      panel(new Panel({
        title: "Search Results",
        loadContent: () => {
          return this.vsoProxy.listRepositories().then(repositories => {
            let searchString = (repoSearchBox.val() as string).toLowerCase();
            repositories = repositories.filter(repo => repo.name.toLowerCase().search(searchString) >= 0);
            resultsTable.items(repositories);
          });
        },
        invisible: true
      }));

      panel().child(resultsTable);
    });

    //ko.applyBindings(panel ,document.getElementById("repoSearchContainer"));
  }

  private _fetchTrackedRepos(): void {
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
  }

  private _supplyPullRequestCommands(item: IPullRequest): ICommand<any>[] {
    return [
      {
        label: "Send Mail",
        onClick: () => {
          location.assign(`mailto:${item.createdBy.uniqueName}?subject=${encodeURIComponent(`Pull Request: ${item.title}`)}&body=${encodeURIComponent(`Hi ${item.createdBy.displayName.split(" ")[0]},\n\nI am emailing about the following pull request ${this.prUrlTemplate.format(item.repository.id, item.pullRequestId)}\n\nThanks,\n${this.me().displayName.split(" ")[0]}`)}`);
          return Q();
        }
      },
      {
        label: "Approve",
        onClick: () => {
          return this.vsoProxy.modifySignOffVote(item, this.me(), PullRequestVote.approved).then(() => {
            this.panels().forEach(p => p.repoId == item.repository.id ? p.panel.refresh() : null);
          });
        }
      },
      {
        label: "Reject",
        onClick: () => {
          return this.vsoProxy.modifySignOffVote(item, this.me(), PullRequestVote.rejected).then(() => {
            this.panels().forEach(p => p.repoId == item.repository.id ? p.panel.refresh() : null);
          });
        }
      },
      {
        label: "Complete",
        onClick: () => {
          return this.vsoProxy.modifyPullRequestStatus(item, PullRequestStatus.completed).then(() => {
            // Completing takes a few seconds. TODO - Make this poll on status
            return Q.delay(4000).then(() => {
              this.panels().forEach(p => p.repoId == item.repository.id ? p.panel.refresh() : null);
            });
          });
        }
      },
      {
        label: "Abandon",
        onClick: () => {
          return this.vsoProxy.modifyPullRequestStatus(item, PullRequestStatus.abandoned).then(() => {
            this.panels().forEach(p => p.repoId == item.repository.id ? p.panel.refresh() : null);
          });
        }
      }
    ];
  }
}
