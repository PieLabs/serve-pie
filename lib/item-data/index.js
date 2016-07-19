const path = require('path');
const fs = require('fs-extra');
const logFactory = require('../log-factory');

class ItemData {
  constructor(rootDir, name) {
    this.rootDir = rootDir;
    this.name = name;
    this._logger = logFactory.fileLogger(__filename);
  }

  get json() {
    this._logger.info('[get] json');
    let jsonPath = path.join(this.rootDir, `${this.name}.json`);
    let loadedJson = fs.readJsonSync(jsonPath);
    this._logger.debug(`[get] json: ${JSON.stringify(loadedJson)}`);
    return loadedJson;
  }

  get markup() {
    this._logger.info('[get] markup');
    let markupPath = path.join(this.rootDir, `${this.name}.html`);
    return fs.readFileSync(markupPath, 'utf-8');
  }
}

module.exports = ItemData;