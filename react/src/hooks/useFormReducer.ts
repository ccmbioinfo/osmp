import { Reducer, useReducer } from 'react';

export type FormState<S> = { [K in keyof S]: { value: S[K]; error: string } };

interface RuleFunc<S> {
    (state: FormState<S>, value: any): boolean;
}

interface RequiredFunc<S> {
    (state: FormState<S>): boolean;
}
interface Rule<S> {
    valid: RuleFunc<S>;
    error: string;
}

export type Validator<S> = {
    [K in keyof S]?: {
        required?: boolean | RequiredFunc<S>;
        rules?: Rule<S>[];
    };
};

const makeFreshState = <S>(state: S): FormState<S> =>
    Object.entries(state)
        .map(([k, v]: [any, any]) => ({ [k]: { value: v, error: '' } }))
        .reduce((a, c) => ({ ...a, ...c }), {} as FormState<S>);

const useFormReducer = <S>(initialState: S, Validator?: Validator<S>) => {
    const stateWithErrorFields = makeFreshState(initialState);

    const [state, dispatch] = useReducer<Reducer<FormState<S>, any>>(
        makeReducer(Validator),
        stateWithErrorFields as FormState<S>
    );

    return [
        state,
        (field: keyof S) => (value: S[keyof S]) =>
            dispatch({ type: 'update', payload: { field, value } }),
        () => dispatch({ type: 'reset', payload: initialState }),
    ] as const;
};

const makeReducer =
    <S>(validator?: Validator<S>) =>
    <R extends FormState<S>, A extends { type: string; payload: unknown }>(state: R, action: A) => {
        switch (action.type) {
            case 'update':
                const { field, value } = action.payload as { field: keyof S; value: S[keyof S] };
                const newState = { ...state, ...{ [field]: { value, error: '' } } };
                return validator ? setErrors(newState, validator) : newState;
            case 'reset':
                return makeFreshState(action.payload as S);
            default:
                return state;
        }
    };

const getFieldRequired = <S extends {}>(
    state: FormState<S>,
    fieldName: keyof S,
    validator: Validator<S>
) => {
    const required = validator[fieldName]?.required!;
    let isRequired = false;
    if (typeof required === 'function' && required(state)) {
        isRequired = true;
    }
    if (typeof required === 'boolean' && required) {
        isRequired = true;
    }
    return isRequired;
};

const validateField = <S>(
    state: FormState<S>,
    validator: Validator<S> | undefined,
    field: keyof S,
    value: S[keyof S] | undefined
) => {
    if (!validator || !validator[field]) {
        return '';
    }
    if (!!validator[field]?.required) {
        const required = getFieldRequired(state, field, validator);
        if (required && !value) {
            return `${field} is required!`;
        }
    }
    let error = '';
    validator[field]?.rules?.forEach(rule => {
        if (!rule.valid(state, value) && getFieldRequired(state, field, validator)) {
            error = rule.error;
            return;
        }
    });
    return error;
};

export const setErrors = <S>(form: FormState<S>, validator: Validator<S>) => {
    for (let field in form) {
        form[field]['error'] = validateField(form, validator, field, form[field].value);
    }
    return form;
};

export const formIsValid = <S>(form: FormState<S>, validator: Validator<S>) => {
    let error;
    for (let field in form) {
        error = validateField(form, validator, field, form[field].value);
        if (error) break;
    }
    return !!error ? false : true;
};

export default useFormReducer;
