import * as PropTypes from "prop-types";
import * as React from "react";

function makeLookup(arr:any[], prop?:any):any {
    let lkup:any = {};
    for (let i:number = 0, l:number = arr.length; i < l; i++) {
        if (prop) {
            lkup[arr[i][prop]] = true;
        } else {
            lkup[arr[i]] = true;
        }
    }
    return lkup;
}

function getItemsByProp(arr:any[], prop:any, values:any[]):any[] {
    let items:any[] = [];
    let found: number = 0;
    let valuesLookup: any = makeLookup(values);
    for (let i:number = 0, la:number = arr.length, lv:number = values.length;
        i < la && found < lv;
        i++) {
        if (valuesLookup[arr[i][prop]]) {
            items.push(arr[i]);
            found++;
        }
    }
    return items;
}

const DEFAULT_CLASS_NAMES: any = {
    button: "FilteredMultiSelect__button",
    buttonActive: "FilteredMultiSelect__button--active",
    filter: "FilteredMultiSelect__filter",
    select: "FilteredMultiSelect__select"
};

declare type Props = {
    defaultFilter: string,
    selectedOptions?: any,
    options?: any,
    classNames?: any,
    className?: any,
    disabled?: boolean,
    placeholder?: string,
    size?: number,
    textProp: string,
    valueProp?: any,
    buttonText?: string,
    onChange: (options: any[]) => void
};

declare type State = {
    filter: string,
    filteredOptions: any,
    selectedValues: any[]
};

export class FilteredMultiSelect extends React.Component<Props, State> {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        options: PropTypes.array.isRequired,

        buttonText: PropTypes.string,
        className: PropTypes.string,
        classNames: PropTypes.object,
        defaultFilter: PropTypes.string,
        disabled: PropTypes.bool,
        placeholder: PropTypes.string,
        selectedOptions: PropTypes.array,
        size: PropTypes.number,
        textProp: PropTypes.string,
        valueProp: PropTypes.string
    };

    static defaultProps = {
        buttonText: "Select",
        className: "FilteredMultiSelect",
        classNames: {},
        defaultFilter: "",
        disabled: false,
        placeholder: "type to filter",
        size: 6,
        selectedOptions: [],
        textProp: "text",
        valueProp: "value"
    };

    private _select: EventTarget & HTMLSelectElement;

    constructor(props: Props) {
        super(props);

        let { defaultFilter, selectedOptions } = props;
        this.state = {
            // filter text
            filter: defaultFilter,
            // options which haven't been selected and match the filter text
            filteredOptions: this._filterOptions(defaultFilter, selectedOptions),
            // values of <options> currently selected in the <select>
            selectedValues: []
        };
    }

    public componentWillReceiveProps(nextProps: Props):void {
        // update visible options in response to options or selectedOptions
        // changing. Also update selected values after the re-render completes, as
        // one of the previously selected options may have been removed.
        if (nextProps.options !== this.props.options ||
            nextProps.selectedOptions !== this.props.selectedOptions ||
            nextProps.options.length !== this.props.options.length ||
            nextProps.selectedOptions.length !== this.props.selectedOptions.length) {
            this.setState({
                filteredOptions: this._filterOptions(this.state.filter,
                    nextProps.selectedOptions,
                    nextProps.options)
            }, this._updateSelectedValues);
        }
    }

    private _getClassName(name: string, ...modifiers:any[]): string {
        let classNames:string[] = [this.props.classNames[name] || DEFAULT_CLASS_NAMES[name]];
        for (let i: number = 0, l:number = modifiers.length; i < l; i++) {
            if (modifiers[i]) {
                classNames.push(this.props.classNames[modifiers[i]] || DEFAULT_CLASS_NAMES[modifiers[i]]);
            }
        }
        return classNames.join(" ");
    }

    private _filterOptions(filter?:string, selectedOptions?:any, options?:any):any[] {
        if (typeof filter == "undefined") {
            filter = this.state.filter;
        }
        if (typeof selectedOptions == "undefined") {
            selectedOptions = this.props.selectedOptions;
        }
        if (typeof options == "undefined") {
            options = this.props.options;
        }
        filter = filter.toUpperCase();

        let { textProp, valueProp } = this.props;
        let selectedValueLookup:any = makeLookup(selectedOptions, valueProp);
        let filteredOptions:any[] = [];

        for (let i:number = 0, l:number = options.length; i < l; i++) {
            if (!selectedValueLookup[options[i][valueProp]] &&
                (!filter || options[i][textProp].toUpperCase().indexOf(filter) !== -1)) {
                filteredOptions.push(options[i]);
            }
        }

        return filteredOptions;
    }

    private _selectRef = (select:any) => {
        this._select = select;
    }

    private _onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let filter:string = e.target.value;
        this.setState({
            filter,
            filteredOptions: this._filterOptions(filter)
        }, this._updateSelectedValues);
    }

    private _onFilterKeyPress = (e:React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (this.state.filteredOptions.length === 1) {
                let selectedOption:any = this.state.filteredOptions[0];
                let selectedOptions:any[] = this.props.selectedOptions.concat([selectedOption]);
                this.setState({ filter: "", selectedValues: [] }, () => {
                    this.props.onChange(selectedOptions);
                });
            }
        }
    }

    private _updateSelectedValues = (e?:React.ChangeEvent<HTMLSelectElement>) => {
        let el:EventTarget & HTMLSelectElement = e ? e.target : this._select;
        let selectedValues:any[] = [];
        for (let i:number = 0, l:number = el.options.length; i < l; i++) {
            if (el.options[i].selected) {
                selectedValues.push(el.options[i].value);
            }
        }
        // always update if we were handling an event, otherwise only update if
        // selectedValues has actually changed.
        if (e || String(this.state.selectedValues) !== String(selectedValues)) {
            this.setState({ selectedValues });
        }
    }

    /**
     * Adds backing objects for the currently selected options to the selection
     * and calls back with the new list.
     */
    _addSelectedToSelection = () => {
        let selectedOptions: any[] =
            this.props.selectedOptions.concat(getItemsByProp(this.state.filteredOptions,
                this.props.valueProp,
                this.state.selectedValues));
        this.setState({ selectedValues: [] }, () => {
            this.props.onChange(selectedOptions);
        });
    }

    public render():JSX.Element {
        let { filter, filteredOptions, selectedValues } = this.state;
        let { className, disabled, placeholder, size, textProp, valueProp } = this.props;
        let hasSelectedOptions:boolean = selectedValues.length > 0;
        return <div className={className}>
            <input
                type="text"
                className={this._getClassName("filter")}
                placeholder={placeholder}
                value={filter}
                onChange={this._onFilterChange}
                onKeyPress={this._onFilterKeyPress}
                disabled={disabled}
            />
            <select multiple
                ref={this._selectRef}
                className={this._getClassName("select")}
                size={size}
                value={selectedValues}
                onChange={this._updateSelectedValues}
                onDoubleClick={this._addSelectedToSelection}
                disabled={disabled}>
                {filteredOptions.map((option:any) => {
                    return <option key={option[valueProp]} value={option[valueProp]}>{option[textProp]}</option>;
                })}
            </select>
            <button type="button"
                className={this._getClassName("button", hasSelectedOptions && "buttonActive")}
                disabled={!hasSelectedOptions}
                onClick={this._addSelectedToSelection}>
                {this.props.buttonText}
            </button>
        </div>;
    }
}

export default FilteredMultiSelect;
