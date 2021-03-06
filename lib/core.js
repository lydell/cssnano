'use strict';

var TRBLOptimiser = require('./trblCache');

var collapsableTRBLProps = [
    'margin',
    'padding',
    'border-color',
    'border-width',
    'border-style',
];

function minimiseWhitespace (rule) {
    rule.before = rule.between = rule.after = '';
    rule.semicolon = false;
}

module.exports = function () {
    return function (css) {
        css.eachDecl(function (declaration) {
            // Ensure that !important values do not have any excess whitespace
            if (declaration.important) {
                declaration._important = '!important';
            }
            // Trim unnecessary space around e.g. 12px / 18px
            declaration.value = declaration.value.replace(/\s*(\/)\s*/, '$1');
            if (~[
                    'background',
                    'border',
                    'border-left',
                    'border-right',
                    'border-top',
                    'border-bottom'
                ].indexOf(declaration.prop)) {
                declaration.value = declaration.value.replace('none', '0 0');
            }
            if (~[
                    'outline',
                    'outline-left',
                    'outline-right',
                    'outline-top',
                    'outline-bottom'
                ].indexOf(declaration.prop)) {
                declaration.value = declaration.value.replace('none', '0');
            }
            if (~collapsableTRBLProps.indexOf(declaration.prop)) {
                var opt = new TRBLOptimiser();
                opt.importShorthand(declaration.value);
                declaration.value = '' + opt;
            }
            // Remove whitespaces around ie 9 hack
            declaration.value = declaration.value.replace(/\s*(\\9)\s*/, '$1');
            // Remove extra semicolons and whitespace before the declaration
            declaration.before = declaration.before.replace(/[;\s]/g, '');
            declaration.between = ':';
            declaration.semicolon = false;
        });

        css.eachRule(minimiseWhitespace);
        css.eachAtRule(minimiseWhitespace);

        // Remove final newline
        css.after = '';
    };
};
