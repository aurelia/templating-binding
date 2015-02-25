import {parse} from '../src/interpolation-parser';

function checkParse(text, expected) {
  let results = [];
  parse(text, (type, start, stop, extra) => {
    results.push({type, value: text.substring(start, stop) + (extra || '')});
  });
  expect(results.reduce((seed, value) => {
    if (value.type === 'text' && seed.length && seed[seed.length - 1].type === 'text') {
      seed[seed.length - 1].value += value.value;
      return seed;
    }
    seed.push(value);
    return seed;
  }, [])).toEqual(expected);
}

describe('interpolation-parser', () => {
  it('parses strings as strings', () => {
    checkParse('test', [
      {type: 'text', value: 'test'}
    ]);
  });

  it('parses expressions as expressions', () => {
    checkParse('${test}', [
      {type: 'expr', value: 'test'}
    ]);
  });

  it('allows for objects in expressions', () => {
    checkParse('${test | blah:{a:b}}', [
      {type: 'expr', value: 'test | blah:{a:b}'}
    ]);
  });

  it('allows for interpolations inside expressions', () => {
    // this probably wouldn't work in browsers that doesn't
    // support ES6 (i.e. all of them), but eventually it will
    // and should be future proofed.
    checkParse('${`${test}`}', [
      {type: 'expr', value: '`${test}`'}
    ]);
  });

  it('allows for multiple expressions', () => {
    checkParse('${a}${b}', [
      {type: 'expr', value: 'a'},
      {type: 'expr', value: 'b'}
    ]);
  });

  it('allows for a combination of text and expressions', () => {
    checkParse('a${b}c${d}e', [
      {type: 'text', value: 'a'},
      {type: 'expr', value: 'b'},
      {type: 'text', value: 'c'},
      {type: 'expr', value: 'd'},
      {type: 'text', value: 'e'}
    ]);
  });

  it('allows escaping of the interpolation', () => {
    // Note: in HTML this would be \${test}
    checkParse('\\${test}', [
      {type: 'text', value: '${test}'}
    ]);
  });

  it('allows escaping the escape sequence', () => {
    // Note: in HTML this would be \\${test}
    checkParse('\\\\${test}', [
      {type: 'text', value: '\\'},
      {type: 'expr', value: 'test'}
    ]);
  });

  it('throws on uncompleted interpolations', () => {
    expect(() => {
      parse('${test')
    }).toThrowError(/^Interpolation not closed\./);
  });

  it('handles quotes', () => {
    checkParse('${ foo | bar:"baz" }', [
      {type: 'expr', value: ' foo | bar:"baz" '}
    ]);

    checkParse('${ foo | bar:\'baz\' }', [
      {type: 'expr', value: ' foo | bar:\'baz\' '}
    ]);

    // would be \${ foo | bar:"baz" } in browser
    checkParse('\\${ foo | bar:"baz" }', [
      {type: 'text', value: '${ foo | bar:"baz" }'}
    ]);

    // would be \\${ foo | bar:"baz" } in browser
    checkParse('\\\\${ foo | bar:"baz" }', [
      {type: 'text', value: '\\'},
      {type: 'expr', value: ' foo | bar:"baz" '}
    ]);

    checkParse('${ foo | bar: \'{\' }', [
      {type: 'expr', value: ' foo | bar: \'{\' '}
    ]);

    checkParse('${ foo | bar: "{" }', [
      {type: 'expr', value: ' foo | bar: "{" '}
    ]);

    checkParse('${ foo | bar: `{` }', [
      {type: 'expr', value: ' foo | bar: `{` '}
    ]);

    checkParse('${ foo | bar: \'}\' }', [
      {type: 'expr', value: ' foo | bar: \'}\' '}
    ]);

    checkParse('${ foo | bar: "}" }', [
      {type: 'expr', value: ' foo | bar: "}" '}
    ]);

    checkParse('${ foo | bar: `}` }', [
      {type: 'expr', value: ' foo | bar: `}` '}
    ]);

    checkParse('${ foo | bar: "\\"" }', [
      {type: 'expr', value: ' foo | bar: "\\"" '}
    ]);

    checkParse('${ foo | bar: "\\\\" }', [
      {type: 'expr', value: ' foo | bar: "\\\\" '}
    ]);

    checkParse('${ foo | bar: "\\\\\\"" }', [
      {type: 'expr', value: ' foo | bar: "\\\\\\"" '}
    ]);
  });

  it('handles long input', () => {
    const baseString = 'foo ${bar} baz ${baffo | babel} bop ${batz}, \\${escaped} \\\\${not(escaped)}';
    const baseResult = [
      {type: 'text', value: 'foo '},
      {type: 'expr', value: 'bar'},
      {type: 'text', value: ' baz '},
      {type: 'expr', value: 'baffo | babel'},
      {type: 'text', value: ' bop '},
      {type: 'expr', value: 'batz'},
      {type: 'text', value: ', ${escaped} \\'},
      {type: 'expr', value: 'not(escaped)'}
    ];

    checkParse(baseString, baseResult);
    let longString = '';
    let longResult = [];
    for (let i = 0; i < 100; i++) {
      longString += baseString;
      longResult = longResult.concat(baseResult);
    }

    checkParse(longString, longResult);
  });
});