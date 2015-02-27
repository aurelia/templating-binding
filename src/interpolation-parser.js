function interpolationError(msg, index, string) {
  var error = new Error(`${msg}\n\n${string}`);
  error.index = index;
  error.string = string;
  error.name = 'InterpolationError';
  return error;
}

export function parse(str, doYield) {
  var index = 0;
  var state = 0;
  var match, curlies, start, char, quote;

  _parse: while (true) {
    switch (state) {
      case 0:
        // normal scanning, not inside interpolation.
        if (index === str.length)
          return;

        match = str.indexOf('${', index);
        // if there is no match, doYield the rest of the string.
        if (match === -1) {
          doYield(
            'text',
            index,
            str.length
          );
          return;
        }

        // check if escaped
        if (match > 0 && str.charAt(match - 1) === '\\') {
          // check if double escaped
          if (match > 1 && str.charAt(match - 2) === '\\') {
            // if double escaped, doYield up to and including slashes,
            // then rerun from that point.
            doYield(
              'text',
              index,
              match - 2,
              '\\'
            );
            index = match + 1;
            curlies = 1;
            start = index + 1;
            state = 1;
            continue;
          }

          // if escaped, remove the slash, yiled the parts as text
          doYield(
            'text',
            index,
            match - 1,
            '${'
          );
          index = match + 2;
          continue;
        }

        // if it's not escaped
        if (index < match) {
          doYield(
            'text',
            index,
            match
          );
        }
        index = match + 1;
        curlies = 1;
        start = index + 1;
        state = 1;
        continue;

      case 1:
        // Start interpolation scan
        // scan char by char
        while (true) {
          if (index === str.length) {
            throw interpolationError('Interpolation not closed.', start - 2, str);
          }

          char = str.charCodeAt(++index);
          switch (char) {
            case 34: // "
            case 39: // '
            case 96: // `
              quote = char;
              state = 2;
              continue _parse;

            case 123: // {
              ++curlies;
              continue;

            case 125: // }
              if (--curlies === 0) {
                doYield(
                  'expr',
                  start,
                  index
                );
                ++index;
                state = 0;
                continue _parse;
              }
          }
        }

      case 2:
        // Scan string inside interpolation
        while (true) {
          if (index === str.length) {
            throw interpolationError('String not closed.', start - 2, str);
          }

          char = str.charCodeAt(++index);
          switch (char) {
            case 92: // \
              ++index;
              continue;

            case quote:
              state = 1;
              continue _parse;
          }
        }
    }
  }
}