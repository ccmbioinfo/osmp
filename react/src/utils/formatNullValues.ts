const formatNullValues = <T>(object: T) => {
    const getKeys = Object.keys as <T>(obj: T) => Array<keyof T>;
    getKeys(object).forEach(key => {
        object[key] =
            object[key] && object[key] !== ('NA' as unknown as T[keyof T])
                ? object[key]
                : (' ' as unknown as T[keyof T]);
    });
    return object;
};

export default formatNullValues;
