module.exports = {
  missingComponent: (name) => {
    return { error: `Can't find processor for ${name}` };
  },
  missingSession: (id) => {
    return { error: `Cant find session for id: ${id}` };
  },
  missingFunction: (functionName, componentName) => {
    return { error: `Cant find function with name: ${functionName}, for processor: ${componentName}` }
  }
};