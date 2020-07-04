# Changelog

### 0.2.3

- Add option to provide hardcoded `@fontsize` and `@rfs` parameters


### 0.2.2

- Fix `dbg-grid` for max sized containers.
- Add `translateX`, `translateY`, `translateZ` and `scale` shortcuts to `@space`


### 0.2.1

- Add `@grid`. Sets up column gap with correct gutter across all breakpoints.
- Allow querying `@fontsize` by keypath:
  `@fontsize product.name;`

  Config would then be:

  ```
  typography: {
    sizes: {
      product: {
        name: {
          xs: '14px',
          sm: '16px',
          // ...
        }
      }
    }
  }
  ```


### 0.2.0

- BREAKING: Enforce container max width config when using `@container`.
- Fix source mapping for most plugins
- Add optional breakpoint param to `@row <cols> [bpQuery]`
- Add simple calc() interpolation. I.e: `@space width calc(100vw - var[container] + var[1])`.
  `var[container]` gets replaced with the container padding for each breakpoint and `var[1]`
  gets replaced with 1 gutter unit for each breakpoint.
- Add `container/2` and `-container/2` as spacing options
  `@space container/2 $desktop;`
- Fix `@font` under `@responsive`


### 0.1.17

- Set default Moonwalk style to `opacity: 0` instead of `visibility: hidden`.
 Remember to update `jupiter` if you use Moonwalk. This was done to fix an
 accessibility problem when trying to tab to an invisible element.


### 0.1.16

- Add `-container` as `@space` param for negative container width


### 0.1.15

- Add `breakpointCollections` to config
- Allow setting a media query key to `@row`


### 0.1.14

- Reduced motion fix.


### 0.1.13

- Skip


### 0.1.12

- Add `@color` rule — `@color fg green.dark`
- Add child count parameter to `@row`
- Add `colors.grid` - colorizes the debug grid
- Bump dependencies


### 0.1.11

- Add `[data-moonwalk-run]` with visibility hidden


### 0.1.10

- Add `@font` rule. Selects family, can also be used for fontsize:
  `@font serif xs`


### 0.1.9

- Actually COMMIT the change from 0.1.8.. Jeez.


### 0.1.8

- Drop setting lineheights in body from Europa.
  Do this yourself in your own css:

  ```
  @iterate theme.typography.lineHeight {
    @responsive $key {
      line-height: $value;
    }
  }
  ```


### 0.1.7

- Fix @fontsize parsing under @responsive


### 0.1.6

- Nicer default underlines in base

**BREAKING CHANGES**
- Switch gutter sizing to be 1 whole unit of gutter instead of a half in `@space`. The brings
  it in line with `@column` spacing (which was 1 unit). So if you had:
  `@space margin-left 2;` it would now be `@space margin-left 1;`. You can still do half
  units: `@space margin-left 0.5;`


### 0.1.5

- Add moonwalk sections as initially hidden.
- Remove moonwalk opacity values
- Add Node 12 to test matrix


### 0.1.4

- Performance optimizations


### 0.1.3

- Bump dependencies
- Build base.css


### 0.1.2

- Add Chrome lazyload fix


### 0.1.1

- Allow advanced breakpoints as `@columns` param.
- Fix flex for IE11 by splitting out `flex: 0 0 x` to `flex-grow/shrink/..`
- More base styles.
- Align @columns param format with rest. Now is `@columns 1/3 xs`.
  Column alignment is removed.


### 0.1.0

- Initial release
