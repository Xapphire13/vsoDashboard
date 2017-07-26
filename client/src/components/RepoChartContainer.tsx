import "../styles/repoChartContainer.less";

import * as React from "react";
import * as moment from "moment";

import {Chart, ChartOptions} from "chart.js";

declare type Properties = {
  isMinimized: boolean,
  numberOfPullRequests: number
};

declare type State = {
  mouseIsOver: boolean
};

export class RepoChartContainer extends React.Component<Properties, State> {
  private _canvas: HTMLCanvasElement | null;

  constructor() {
    super();

    this.state = {
      mouseIsOver: false
    };
  }

  public componentDidUpdate(previousProps: Properties, previousState: State): void {
    if ((!previousState.mouseIsOver && previousProps.isMinimized) && (!this.props.isMinimized || this.state.mouseIsOver)) {
      this._renderChart();
    }
  }

  public render(): JSX.Element {
    if (this.props.isMinimized && !this.state.mouseIsOver) {
      return <div
        className="repoChartContainer"
        onMouseEnter={() => this.setState({mouseIsOver: true})}
        onMouseLeave={() => this.setState({mouseIsOver: false})}>
        <p>Repo stats</p>
        <div>
          <h1>{this.props.numberOfPullRequests}</h1>
          <p className="pullRequestCount">Total PR{this.props.numberOfPullRequests !== 1 && "s"}</p>
        </div>
        <div className="expandIcon">{String.fromCharCode(0x25BE)}</div>
      </div>
    }

    return <div
      className="repoChartContainer"
      onMouseEnter={() => this.setState({mouseIsOver: true})}
      onMouseLeave={() => this.setState({mouseIsOver: false})}>
      <p>Repo stats</p>
      <div>
        <h1>{this.props.numberOfPullRequests}</h1>
        <p className="pullRequestCount">Total PR{this.props.numberOfPullRequests !== 1 && "s"}</p>
      </div>
      <div className="chartContainer">
        <canvas ref={(element) => { this._canvas = element;}}></canvas>
        <h1>42</h1>
      </div>
      <hr/>
      <p>Code velocity</p>
    </div>;
  }

  private _renderChart(): void {
    if (this._canvas) {
      const ctx = this._canvas.getContext("2d");

      if(ctx) {
        new Chart(ctx, {
          type: "line",
          data: {
            labels: Array.from(new Array(7)).map((_, index) => moment.weekdays()[(moment().day() + 7 + index) % 7]),
            datasets: [
              {
                data: [0, 1, 4, 0, 0, 7, 5],
                borderColor: "#409ebb",
                fill: false,
                pointBackgroundColor: "#409ebb",
                lineTension: 0
              }
            ]
          },
          options: {
            layout: {
              padding: {
                top: 5,
                bottom: 5,
                left: 5,
                right: 5
              }
            },
            legend: {
              display: false
            },
            scales: {
              xAxes: [
                {
                  gridLines: {
                    display: false
                  },
                  display: false
                }
              ],
              yAxes: [
                {
                  gridLines: {
                    display: false
                  },
                  display: false
                }
              ],
            }
          } as (ChartOptions & {layout: any})
        });
      }
    }
  }
}
