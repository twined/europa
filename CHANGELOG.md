# Change Log

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
