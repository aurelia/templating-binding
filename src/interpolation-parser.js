export function parse(str, doYield) {
  var index = 0;
  var state = 0;
  var match, curlies, start, lcurly, rcurly;

  while (true) {
    switch (state) {
      case 0:
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
            index = match + 2;
            curlies = 1;
            start = index;
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
        index = match + 2;
        index = match + 2;
        curlies = 1;
        start = index;
        state = 1;
        continue;

      case 1:
        lcurly = str.indexOf('{', index);
        rcurly = str.indexOf('}', index);

        if (lcurly !== -1 && lcurly < rcurly) {
          ++curlies;
          index = lcurly + 1;
          continue;
        } else if (rcurly !== -1) {
          index = rcurly + 1;
          if (--curlies === 0) {
            doYield(
              'expr',
              start,
              rcurly
            );
            state = 0;
            continue;
          }

          continue;
        } else {
          // alternatively, treat as string
          throw new Error('Interpolation expression started at ' + (start - 2) + ' does not end');
        }
    }
  }
}