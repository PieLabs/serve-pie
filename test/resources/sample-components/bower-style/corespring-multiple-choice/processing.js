var _ = require('lodash');
var feedbackUtils = require('corespring.server-shared.server.feedback-utils');
var keys = feedbackUtils.keys;

exports.createOutcome = createOutcome;
exports.isCorrect = isCorrect;
exports.isPartiallyCorrect = isPartiallyCorrect;
exports.keys = keys;
exports.preprocess = preprocess;

//-------------------------------------------------------------

/*
 Create a response to the answer based on the question, the answer and the respond settings
 */
function createOutcome(question, answer, settings) {
  if (_.isEmpty(answer)) {
    return {
      correctness: 'warning',
      score: 0,
      feedback: settings.showFeedback ? {
        emptyAnswer: true,
        message: keys.DEFAULT_WARNING_FEEDBACK
      } : null
    };
  }

  if (question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  var isSingleChoice = question.model.config.choiceType === "radio";
  var answerIsCorrect = isCorrect(answer, question.correctResponse.value, isSingleChoice);

  var response = {
    correctness: answerIsCorrect ? "correct" : "incorrect",
    score: calculateScore(question, answer, isSingleChoice),
    comments: question.comments
  };

  if (settings.showFeedback) {
    response.feedback = buildFeedback(question, answer, settings, answerIsCorrect);
  }
  return response;
}

function isCorrect(answer, correctAnswer, isSingleChoice) {
  var diff, diff2;
  diff = _.difference(answer, correctAnswer);
  diff2 = _.difference(correctAnswer, answer);
  return diff.length === 0 && (diff2.length === 0 || isSingleChoice);
}

function calculateScore(question, answer, isSingleChoice) {
  var definedAsCorrect = question.correctResponse.value.length;
  var answeredCorrectly = countAnsweredCorrectly();
  var answeredIncorrectly = answer.length - answeredCorrectly;

  if (isSingleChoice) {
    return answeredCorrectly > 0 ? 1 : 0;
  }

  if (answeredIncorrectly > 0) {
    return 0;
  }

  if (answeredCorrectly === definedAsCorrect) {
    return 1;
  }

  if (question.allowPartialScoring) {
    return calculatePartialScore(answeredCorrectly) / 100;
  }

  return 0;

  //--------------------------

  function countAnsweredCorrectly() {
    var sum = _.reduce(answer, function(sum, a) {
      var contains = _.contains(question.correctResponse.value, a);
      var newsum = sum + (contains ? 1 : 0);
      return newsum;
    }, 0);
    return sum;
  }

  function calculatePartialScore(correctCount) {
    var partialScore = _.find(question.partialScoring, function(ps) {
      return ps.numberOfCorrect === correctCount;
    });

    return _.isUndefined(partialScore) ? 0 : partialScore.scorePercentage;
  }

}

function feedbackByValue(q, v) {
  var originalFb = _.find(q.feedback, function(f) {
    return f.value === v;
  });
  return _.cloneDeep(originalFb);
}

function handleDefaultAndNoneFeedback(fb, isCorrect) {
  if (fb.feedbackType === 'default') {
    fb.feedback = isCorrect ? keys.DEFAULT_CORRECT_FEEDBACK : keys.DEFAULT_INCORRECT_FEEDBACK;
  }
  if (fb.notChosenFeedbackType === 'default') {
    fb.notChosenFeedback = keys.DEFAULT_NOT_CHOSEN_FEEDBACK;
  }
  if (fb.feedbackType === 'none') {
    delete fb.feedback;
  }
  if (fb.notChosenFeedbackType === 'none') {
    delete fb.notChosenFeedback;
  }
}

function correctResponseFeedback(fbArray, q, userGotItRight, answer) {

  var correctKey, fb, nc, i, _len, correctResponses;

  correctResponses = q.correctResponse.value;

  for (i = 0; i < correctResponses.length; i++) {
    correctKey = correctResponses[i];

    fb = feedbackByValue(q, correctKey) || {
      value: correctKey
    };

    if (!fb) {
      return;
    }

    fb = _.clone(fb);

    handleDefaultAndNoneFeedback(fb, userGotItRight || _.indexOf(answer, correctKey) !== -1);

    if (userGotItRight) {
      delete fb.notChosenFeedback;
    } else {
      if (_.indexOf(answer, correctKey) === -1) {
        nc = fb.notChosenFeedback || exports.keys.DEFAULT_NOT_CHOSEN_FEEDBACK;
        fb.feedback = nc;
        delete fb.notChosenFeedback;
      } else {
        delete fb.notChosenFeedback;
      }
    }

    fb.correct = true;
    fbArray.push(fb);
  }
}

function preprocess(json) {
  if (_.isUndefined(json.model.config.choiceType)) {
    json.model.config.choiceType = (json.correctResponse.value.length === 1) ? "radio" : "checkbox";
  }
  return json;
}

function isPartiallyCorrect(answers, correctAnswers) {
  var countAnsweredCorrectly = _.reduce(answers, function(sum, answer) {
    var increment = _.contains(correctAnswers, answer) ? 1 : 0;
    return sum + increment;
  }, 0);
  return countAnsweredCorrectly < correctAnswers.length;
}

function isCorrectChoice(q, choice) {
  return _.indexOf(q.correctResponse.value, choice) !== -1;
}

function userResponseFeedback(fbArray, q, answer) {
  var fb, userChoice, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = answer.length; _i < _len; _i++) {
    userChoice = answer[_i];
    fb = feedbackByValue(q, userChoice) || {
      value: userChoice
    };
    if (fb) {
      fb.correct = isCorrectChoice(q, userChoice);
      if (fb.correct) {
        delete fb.notChosenFeedback;
      }
      handleDefaultAndNoneFeedback(fb, fb.correct);
      _results.push(fbArray.push(fb));
    }
  }
  return _results;
}

function buildFeedback(question, answer, settings, isCorrect) {
  var out;
  out = [];
  if (isCorrect) {
    if (settings.highlightCorrectResponse || settings.highlightUserResponse) {
      correctResponseFeedback(out, question, true, answer);
    }
  } else {
    if (settings.highlightCorrectResponse) {
      correctResponseFeedback(out, question, false, answer);
    }
    if (settings.highlightUserResponse && answer) {
      userResponseFeedback(out, question, answer);
    }
  }
  return out;
}