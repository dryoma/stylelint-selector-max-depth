var ruleTester = require('stylelint-rule-tester');
var selectorMaxDepth = require('..');

var messages = selectorMaxDepth.messages;
var testRule = ruleTester(selectorMaxDepth.rule, selectorMaxDepth.ruleName);

function basics(tr) {
  tr.ok('');
  tr.ok('a {}');
  tr.ok('@import "foo.css";');
  tr.ok('a { top: 0; }');
  tr.ok('a.class#id[ type = "value"]::before { top: 0; }');
  tr.ok('a[ type = "value"].class[data-val] { top: 0; }');
}

testRule(2, function (tr) {
  basics(tr);

  tr.ok('a b { top: 0; }');
  tr.ok('a b, a b.c { top: 0; }');
  tr.notOk('a b c { top: 0; }', messages.rejected('a b c', 2));
  tr.ok('a { b { top: 0; }}');
  tr.ok('@media print { a b { top: 0; }}');
  tr.notOk('@media print { a { b { c { top: 0; }}}}',
    messages.rejected('a b c', 2));
  tr.notOk('a { @media print { b { c { top: 0; }}}}',
    messages.rejected('a b c', 2));
  tr.ok('a { top: 0; b { top: 0; }}');
  tr.notOk('a { top: 0; b { top: 0; c { top: 0; }}}',
    messages.rejected('a b c', 2));
  tr.notOk('a { b { top: 0; c { top: 0; }} top: 0; }',
    messages.rejected('a b c', 2));
});

testRule(1, function (tr) {
  basics(tr);

  tr.ok('E:not(s1) { top: 0; }');
  tr.ok('E.warning { top: 0; }');
  tr.ok('E#myid { top: 0; }');
  tr.ok('E[foo="bar"] { top: 0; }');
  tr.ok('E[foo="bar" i] { top: 0; }');
  tr.ok('E[foo~="bar"] { top: 0; }');
  tr.ok('E[foo^="bar"] { top: 0; }');
  tr.notOk('E[foo^="bar"] a { top: 0; }',
    messages.rejected('E[foo^="bar"] a', 1));
  tr.ok('E:any-link { top: 0; }');
  tr.ok('E:lang(zh, *-hant) { top: 0; }');
  tr.ok('E:lang( zh a a , *-hant ) { top: 0; }');
  tr.ok('E:local-link( 0 ) { top: 0; }');
});

testRule(2, function (tr) {
  basics(tr);
  tr.ok('a+b z { top: 0; }');
  tr.ok('a + b z { top: 0; }');
  tr.ok('a~b z { top: 0; }');
  tr.ok('a ~ b z { top: 0; }');
  tr.ok('a ~ b + c z { top: 0; }');
  tr.ok('a + b ~ c z { top: 0; }');

  tr.ok('a + b ~ c z { top: 0; }');
  tr.notOk('a > b ~ c z { top: 0; }', messages.rejected('a > b ~ c z', 2));
  tr.ok('a > b ~ c + z { top: 0; }');
});

testRule(3, function (tr) {
  basics(tr);

  tr.ok('a+b z { top: 0; }');
  tr.ok('a+b z + d > c { top: 0; }');
  tr.ok('a { @media print { b { c { top: 0; }}}}');
});
