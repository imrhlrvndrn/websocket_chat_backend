const omitProperty = (targetObject, arrayOfPropertyNames) =>
    Object.keys(targetObject)
        .filter((propertyName) => !arrayOfPropertyNames.includes(propertyName))
        .reduce((acc, property) => ({ ...acc, [property]: targetObject[property] }), {});

module.exports = {
    omitProperty,
};
