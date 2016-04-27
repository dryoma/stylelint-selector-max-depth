# stylelint-selector-max-depth

[![Build Status](https://travis-ci.org/dryoma/stylelint-selector-max-depth.svg)](https://travis-ci.org/dryoma/stylelint-selector-max-depth)

A [stylelint](https://github.com/stylelint/stylelint) custom rule for limiting CSS selectors depth.

## Installation and usage

```
npm install stylelint-selector-max-depth
```

In your stylelint config add `"stylelint-selector-max-depth"` to the `plugins` array, and `"selector-max-depth": N` to the rules, specifying a max selector depth as the primary option, like so:

```js
{
  "plugins": [
    "stylelint-selector-max-depth"
  ],
  "rules": {
    // ...
    // Max selector depth of 2
    "selector-max-depth": 1,
    // ...
  },
};
```

## Details

This rule allows you to limit depth for CSS selectors. To put it simply, selector depth is how many levels of HTML structure (not necesserily direct descendants) the selector is reflecting.

```css
.foo .bar[data-val] > .baz + .boom .lorem {
/* ^        ^         \__________/    ^
   |        |              ^          |
  Lv1      Lv2            Lv3        Lv4  -- these are depth levels */
```

### Why another rule?

At the moment [stylelint](https://github.com/stylelint/stylelint) - a great CSS linter - has no way to control selector depth without hurting something else. It has rules [to control Sass nesting](http://stylelint.io/user-guide/rules/max-nesting-depth/); to disallow certain compound selectors ([type selectors](http://stylelint.io/user-guide/rules/selector-no-type/), [IDs](http://stylelint.io/user-guide/rules/selector-no-id/)) and even [to limit a selector's specificity](http://stylelint.io/user-guide/rules/selector-max-specificity/) - but not the depth.

Consider the case when the requirements are: no more than 3 levels of compound selectors; and no limit to selector type.

```css
.class1 .class2 .class3 { ... }      // 1. We want this to work.
.class1 article .class3 { ... }      // 2. And this.
#element h3 { ... }                  // 3. And even this.

.menu .item div a { ... }            // 4. But not this.
.menu li div a span span { ... }     // 5. And not this.
ul li ul li div a span span { ... }  // 6. No way we would want this!
```

We can't force it with `selector-max-specificity`: `0,3,0`, which is necessary for selector **2** to comply, will cut selector **3**. Selector **6**, on the other hand, has [specificity](http://www.w3.org/TR/selectors/#specificity) of *just 8* for any classname selector not to comply and *as much as 8* to allow eight (!) compound type selectors in a row.

Neither we can force this with `max-nesting-depth`, since it only controls Sass nesting and the selectors can be written without using nesting, e.g:

```css
.foo {
  .bar { /* nesting level 1 */
    .buzz .lightyear #to .the .rescue { /* nesting level 2 */
      ...
    }
  }
}
```
