"use strict";

const postcss = require('postcss');

const plugin = require('./');

function run(input, output, opts) {
  return postcss([plugin(opts)]).process(input);
}

it('parses @space per mq size', () => {
  const input = `body article .test {
  @space margin-top xl;
  font-size: 18px;
}`;
  const expected = `body article .test {
  font-size: 18px;
}

@media (min-width: 0){
  body article .test {
    margin-top: 85px;
  }
}

@media (min-width: 740px){
  body article .test {
    margin-top: 100px;
  }
}

@media (min-width: 1024px){
  body article .test {
    margin-top: 140px;
  }
}

@media (min-width: 1399px){
  body article .test {
    margin-top: 140px;
  }
}

@media (min-width: 1900px){
  body article .test {
    margin-top: 180px;
  }
}`;
  return run(input).then(result => {
    expect(result.css).toEqual(expected);
  });
});
it('parses @space only for requested bp', () => {
  const input = `body article .test {
  @space margin-top xl xs;
  font-size: 18px;
}`;
  const expected = `body article .test {
  font-size: 18px;
}

@media (min-width: 0) and (max-width: 739px){
  body article .test {
    margin-top: 85px;
  }
}`;
  return run(input).then(result => {
    expect(result.css).toEqual(expected);
  });
});
it('parses @space with no max for last bp', () => {
  const input = `body article .test {
  @space margin-top xl xl;
  font-size: 18px;
}`;
  const expected = `body article .test {
  font-size: 18px;
}

@media (min-width: 1900px){
  body article .test {
    margin-top: 180px;
  }
}`;
  return run(input).then(result => {
    expect(result.css).toEqual(expected);
  });
}); // it('parses @space per mq size with shortcuts', () => {
//   const expected = `@media (min-width: 0){
//   body
//     margin-top: 75px;
//     margin-bottom: 75px
//   }
// @media (min-width: 740px){
//   body {
//     margin-top: 90px;
//     margin-bottom: 90px
//   }
// }
// @media (min-width: 1024px){
//   body {
//     margin-top: 100px;
//     margin-bottom: 100px
//   }
// }
// @media (min-width: 1399px){
//   body {
//     margin-top: 120px;
//     margin-bottom: 120px
//   }
// }
// @media (min-width: 1900px){
//   body {
//     margin-top: 150px;
//     margin-bottom: 150px
//   }
// }`
//   return run('body { @space margin-y xl }').then(result => {
//     expect(result.css).toEqual(expected)
//   })
// })