// Match parsed keys, so escaped strings and unrelated suffix keys stay intact.
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
      var replacement = value;
      if (key === 'sday' && typeof value === 'string') replacement = '2029-12-01 00:00:00';
      else if (key === 'eday' && typeof value === 'string') replacement = '2029-12-30 00:00:00';
      else if (key === 'intval' && typeof value === 'number' && Number.isInteger(value) && value >= 0) replacement = 0;
      if (replacement !== value) { node[key] = replacement; changed = true; }
      else if (visit(value)) changed = true;
    });
    return changed;
  }
})();
