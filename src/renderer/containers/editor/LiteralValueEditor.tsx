import * as React from 'react';
import {IValueEditorProps} from "./ValueEditor";
import {FieldValue, toTextValue} from "../../components/field/Field";
import {TextField} from "../../components/field/TextField";

// Note: DictValueEditor and LiteralValueEditor are almost the same - use the React HLC pattern

interface ILiteralValueEditorProps extends IValueEditorProps<string> {
    placeholder?: string;
    validator?: (value: any) => void;
}

export class LiteralValueEditor extends React.Component<ILiteralValueEditorProps, null> {
    private static TEXT_FIELD_STYLE = {flexGrow: 1};

    constructor(props: ILiteralValueEditorProps) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(value: FieldValue<string>) {
        this.props.onChange(this.props.input, value);
    }

    render() {
        const textValue = toTextValue(this.props.value);
        return (
            <TextField
                value={textValue}
                validator={this.props.validator || validatePythonLiteralText}
                size={36}
                placeholder={this.props.placeholder || 'Enter constant (Python) literal'}
                onChange={this.onChange}
                style={LiteralValueEditor.TEXT_FIELD_STYLE}
            />
        );
    }
}

export function validatePythonLiteralText(value: string|null) {
    if (!value || value.trim() === '') {
        return;
    }
    // Define Python eval context:
    //
    //noinspection JSUnusedLocalSymbols
    // eslint-disable-next-line
    const None = null;
    //noinspection JSUnusedLocalSymbols
    // eslint-disable-next-line
    const True = true;
    //noinspection JSUnusedLocalSymbols
    // eslint-disable-next-line
    const False = false;
    //
    // Use JavaScript's eval() to validate Python literals.
    // This is not exact, but works for most literals.
    // eslint-disable-next-line
    eval(value);
}
