const _ = require('lodash');

_.mixin({
  swap: (arr, key, newValue) => {
    if (_.isArray(arr)) {
      return _.map(arr, (a) => {
        return a === key ? newValue : a;
      });
    }
  }
});

class Override {

  constructor(config) {
    this.config = config;
  }

  static fromMain(m) {
    if(_.isString(m)){
      return new Override({add: [m]});
    } else if(_.isArray(m)){
      return new Override({add: m});
    } else {
      return new Override(m || {});
    }
  }

  apply(main) {
    let swapped = _.reduce(this.config.swap || {}, (acc, update, srcName) => {
      return _.swap(acc, srcName, update);
    }, main);

    let added = _.concat(swapped, _.flatten([this.config.add || []]));
    let removed = _.pullAll(added, _.flatten([this.config.remove || []]));
    return _.uniq(removed);
  }
}

module.exports = Override;
