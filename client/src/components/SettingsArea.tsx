import * as React from "react";

export class SettingsArea extends React.Component {
    public render(): JSX.Element {
        return <form className="settings" onSubmit={this._onSubmit}>
                <h2>Settings</h2>
                <label className="setting">
                    Refresh Interval
                    <input type="number" />
                </label>
                <h3>Repositories</h3>
                
            </form>;
    }

    private _onSubmit(event: React.MouseEvent<HTMLFormElement>) {
        event.preventDefault();
    }
}