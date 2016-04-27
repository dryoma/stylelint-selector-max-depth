var stylelint = require('stylelint');
var resolvNested = require('postcss-resolve-nested-selector');

var ruleName = 'selector-max-depth';

var messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: function (selector, maxDepth) {
    return 'Expected \'' + selector + '\' to have depths not greater than ' +
      maxDepth;
  }
});

module.exports = stylelint.createPlugin(ruleName, function (max) {
  return function (root, result) {
    // Checks the main rule value
    var validOptions = stylelint.utils.validateOptions({
      ruleName: ruleName,
      result: result,
      // The only option is the value, so we check if it is a positive number
      actual: max,
      possible: [function (x) {
        return typeof x === 'number' && x > 0;
      }]
    });

    // Checks a simple selector's (without :not/:matches) depth
    function checkDepth(selector, rule) {
      var depth;
      // Stripping "[...]", "(...)", "+", "~" (the last two might come with
      // spaces) for simplicity and since we don't need those to count depth
      var stripped = selector.replace(/\(.*?\)|\[.*?\]|(\s*)[+~](\s*)/g, []);
      // Trimming redundant spaces
      stripped = stripped.replace(/\s+/g, ' ');
      // Finally find everything between spaces and ">" (possibly with spaces)
      depth = stripped.match(/[^\s>]+/g).length;
      if (depth > max) {
        stylelint.utils.report({
          ruleName: ruleName,
          result: result,
          node: rule,
          message: messages.rejected(selector, max)
        });
      }
    }

    if (!validOptions) { return; }

    root.walkRules(function (rule) {
      // There can be a comma-separated selectors set, so using
      // `rule.selectors` instead of `rule.selector`
      rule.selectors.forEach(function (selector) {
        // Don't check selectors with interpolation
        if (/#{.+?}|@{.+?}|\$\(.+?\)/.test(selector)) {
          return;
        }

        resolvNested(selector, rule).forEach(function (resolvedSelector) {
          var notReg = /:not\((.*?)\)/g;
          var notRegDel = /(:not\((.*?)\))/;
          var match = notReg.exec(resolvedSelector);

          // 1. Find :not, check its contents
          while (match !== null) {
            checkDepth(match[1], rule);
            match = notReg.exec(resolvedSelector);
          }

          // 2. Delete :not and :matches, check the rest
          checkDepth(resolvedSelector.replace(notRegDel, ''), rule);
        });
      });
    });
  };
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;
