<p align="center">
  <sup><em>«On the count of ten you will be in...»</em></sup>
</p>

![](http://univers.agency/europa.svg)

<p align="center">
    <a href="https://travis-ci.org/univers-agency/europacss"><img src="https://img.shields.io/travis/univers-agency/europacss/master.svg" alt="Build Status"></a>
    <a href="https://badge.fury.io/js/%40univers-agency%2Feuropacss"><img src="https://badge.fury.io/js/%40univers-agency%2Feuropacss.svg" alt="npm version" height="18"></a>
</p>

------

EuropaCSS originally began as a collection of SASS mixins and functions that came in
handy when working with design agencies that had very specific designs over different
breakpoints. These design systems translate pretty well to configurations and allows
weeding out a lot of the boilerplate involved.

## USAGE WITH WEBPACK

Example `postcss.config.js`:

```js
module.exports = {
  plugins: [
    require('postcss-easy-import')({ prefix: '_', extensions: ['pcss', 'scss', 'css'] }),
    require('europacss'),
    require('autoprefixer')({ grid: 'on' }),
    require('css-mqgroup')({ sort: true }),
  ]
}
```

## NOTES

- Remember to keep your `@import` statements at the top of your `.pcss` file
- Add

    @europa arrows;
    @europa base;

  to your main stylesheet


## CONFIG

TODO

### Typography
#### Sizes

`typography`
  `sizes`
    `size_name`
      `breakpoint_name`: `value`

**Examples**

A regular setup:

```
  typography: {
    sizes: {
      base: {
        mobile: '16px'
      }
    }
  }
```

If `value` is an object, all properties will be added to the selector, i.e:

```
  typography: {
    sizes: {
      base: {
        mobile: {
          'font-size': '16px',
          'line-height': 1.25
        }
      }
    }
  }
```


## AT-RULES

todo

### `@responsive {breakpointQuery} block`

todo

### `@color {fg/bg} {colorName}`

Gets `colorName` from `theme.colors`


### `@row [childrenPerRow[/wrapModifier]] [breakpointQuery]`

Spaces children correctly per row. Does not set child widths/columns!
If no params are given, only the first child gets a margin-left of 0.

`wrapModifier` defaults to `nowrap`.

**EXAMPLE**:

```
.row {
  @row 3/wrap;

  .child {
    @column 4/12;
  }
}
```


### `@embed-responsive {aspectRatio}

**PARAMS**:

`{aspectRatio}`
  - 16/9


### `@space {decl} {sizeQuery} [breakpointQuery]`

**PARAMS**:

`{decl}`
  - `margin-x`, `margin-y`, `padding-x`, `padding-y`
  - Any prop that accepts the values you give it.

`{sizeQuery}`
  - `xs` > Gets XS from `theme.spacing` map.
  - `2` > Gets `2` times the gutter padding.
  - `1/3` > Calcs a fraction.
  - `3:1/6` > Calcs a 3/6 fraction but with 1 added gutter unit
  - `xs/2` > Gets half of the XS from `theme.spacing` map.
  - `container` > Gets value from `theme.container.padding` for breakpoint.
  - `-container` > Gets negative value of `theme.container.padding` for breakpoint.
  - `vertical-rhythm(theme.typography.sizes.xl)` > Grabs object for breakpoint and multiplies with default line-height.
  - `vertical-rhythm(theme.typography.sizes.xl, 1.2)` > Grabs object for breakpoint and multiplies with 1.2 as line-height.
  - `calc(100vw - var[container] + var[1])` > Switches out `var[container]` and `var[1]` with correct values for
    container padding and 1 gutter unit per breakpoint.

**EXAMPLES**:

```postcss
.block {
  @space margin-y xl/2;

  &:first-of-type {
    @space margin-top xl;
  }

  &:last-of-type {
    @space margin-bottom: xl;
  }
}
```

If you need the set properties to be marked as `!important` you can use `@space!`

```postcss
  @space! margin-left xs;
```

### `@font {fontFamily} [fsQuery]`

Selects a font family. Can also be passed a font size query.

**PARAMS**:

`{fontFamily}`
  - picks `fontFamily` from `typography.families`

`[fsQuery]`
  - can also be passed. Will then create a `@fontsize` rule with `fsQuery` as params


### `@fontsize {fsQuery} [breakpointQuery]`

**PARAMS**:

`{fsQuery}`
  - `lg` > Picks the `lg` key from `theme.typography.sizes` across breakpoints
  - `lg/2.0` > Also sets `line-height` to `2.0`
  - `lg(2.0)/2.0` > Adds a modifier `(2.0)` that gets used as a multiplier in a calc() for the final font-size.

`[breakpointQuery]`
  - `xs` > Only for the `xs` breakpoint
  - `>=md` > Only for larger or equal to `md`


### `@if {value} {block}`

Renders `{block}` if `{value}` is true. Ignores it otherwise.

**PARAMS**:

`{value}`
  - `theme.typography.optimizeLegibility` > Checks value in theme config.

**EXAMPLES**:

```postcss
@if theme.typography.optimizeLegibility {
  article {
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```

### `@rfs {fsQuery} [breakpointQuery]`

Responsive Font Size helper. `theme.typography.rfs.minimum` values must be set for all keys used.

**PARAMS**:

`{fsQuery}`
  - `base` > Creates a responsive font size between `theme.typography.sizes.base` and `theme.typography.rfs.minimum` for all breakpoints.
  - `base/2.0` > Same as above, but sets `line-height` to 2.0

`[breakpointQuery]`
  - `xs`
  - `>=md`
  - etc..

**EXAMPLES**:

```postcss
article {
  @rfs base sm;
}
```

### `@column {sizeQuery} [breakpointQuery] `

Creates a flex column inside rule.

**PARAMS**:

`{sizeQuery}`
  - `1/3` > Takes up one third of container, across all breakpoints
  - `3:1/6` > Takes up one third of container, across all breakpoints, with 1 unit of gutter

`[breakpointQuery]`
  - `xs` > For xs breakpoint only
  - `xs/sm/xl` > For xs, sm and xl breakpoints
  - `<=md` > Less and equal to the md breakpoint


**EXAMPLES**:

```postcss
article {
  @column 1/3;
  @column 3/3 xs;
}
/* Column is 1/3 wide on all devices, except xs, which is 3/3. */
```

### `@iterate {iterable} block`

Iterates through a config object.

**PARAMS**:

`{iterable}`
  - a path in the theme.object, I.E `theme.header.padding.small`

**EXAMPLES**:

```postcss
article {
  @iterate theme.header.padding.small {
    @responsive $key {
      padding-top: $value;
      padding-bottom: $value;
    }
  }
}
```

This creates a media query for each key in `theme.header.padding.small`

### `@unpack {object}`

Unpacks a config object.

**PARAMS**:

`{object}`
  - a path in the theme object, I.E `theme.typography.sections.navigation`

**EXAMPLES**:

```postcss
article {
  @unpack theme.typography.sections.navigation;
}
```

results in

```css
  @media (min-size: 0) and (max-size: 749px) {
    article {
      font-size: 1.2rem;
      line-height: 1.6;
    }
  }

  @media (min-size: 750px) and (max-size: 1039px) {
    article {
      font-size: 1.4rem;
      line-height: 1.5;
    }
  }

  /* ... */
```


## POSTCSS PLUGINS IN USE

This would not be possible without the following great plugins:

  - `postcss-extend-rule`
  - `postcss-functions`
  - `postcss-nested`
