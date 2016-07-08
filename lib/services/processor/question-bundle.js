const errorMsgs = require('./error-msgs');
const _ = require('lodash');

class QuestionBundle {

  constructor(question, def, session) {
    this.question = question;
    this.def = def;
    this.session = session;
    this._errors = [];
    this._logger = require('../../log-factory').fileLogger(__filename);
  }

  get component() {
    return this.question ? this.question.component : {};
  }

  get id() {
    return this.question ? this.question.id : null;
  }

  get hasErrors() {
    return this._errors.length > 0;
  }

  get errorResult() {
    return {
      id: this.id,
      component: this.component,
      errors: this._errors
    }
  }

  withDef(def, fnName) {
    let componentName = this.component ? this.component.name : '?';
    if (!def) {
      this._errors.push(errorMsgs.missingComponent(componentName));
    } else if (!_.isFunction(def.processor[fnName])) {
      this._errors.push(errorMsgs.missingFunction(fnName, componentName));
    } else {
      this.def = def;
    }
    return this;
  }

  withSession(session) {
    if (!session) {
      this._errors.push(errorMsgs.missingSession(this.id));
    } else {
      this.session = session;
    }
    return this;
  }
}

module.exports = QuestionBundle;