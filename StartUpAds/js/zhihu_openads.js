// Exact parsed duration keys only. Strings are inspected only when they contain
// valid encoded JSON objects/arrays, and retained verbatim when nothing changes.
(function () {
  var result = {};
  try {
    var obj = parseLossless($response.body);
    if (visit(obj)) result.body = JSON.stringify(obj);
  } catch (_) {}
  $done(result);

  // Preserve every numeric token through JSON.parse/stringify. Quoted strings
  // are skipped here and any encoded JSON is checked separately before editing.
  function parseLossless(text) {
    var parsed = JSON.parse(text);
    var tokens = /"(?:\\.|[^"\\])*"|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
    var match;
    while ((match = tokens.exec(text))) {
      var token = match[0];
      if (token[0] === '"') continue;
      var number = Number(token);
      if (!Number.isFinite(number) || String(number) !== token || (Number.isInteger(number) && !Number.isSafeInteger(number))) throw new Error('numeric token cannot round-trip safely');
    }
    return parsed;
  }

  function visit(node) {
    if (!node || typeof node !== 'object') return false;
    var changed = false;
    Object.keys(node).forEach(function (key) {
      var value = node[key];
      if ((key === 'img_play_duration' || key === 'launch_timeout') && typeof value === 'number' && Number.isInteger(value) && value >= 0) {
        if (value !== 0) { node[key] = 0; changed = true; }
      } else if (value && typeof value === 'object') {
        if (visit(value)) changed = true;
      } else if (typeof value === 'string' && /^\s*[\[{]/.test(value)) {
        try {
          var encoded = parseLossless(value);
          if (encoded && typeof encoded === 'object' && visit(encoded)) {
            node[key] = JSON.stringify(encoded);
            changed = true;
          }
        } catch (_) {}
      }
    });
    return changed;
  }
})();
