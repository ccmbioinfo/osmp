function getKeys<O extends {}>(o: O) {
    return Object.keys(o) as Array<keyof O>;
}

export default getKeys;
