(function () {
  var result = {};
  try {
    var obj = parseLossless($response.body);
    var collection = obj && obj.data;
    if (collection && typeof collection === 'object') {
      var rows = Object.values(collection);
      var array = Array.isArray(collection);
      var recognized = array || rows.some(function (row) {
        return row && !Array.isArray(row) && (typeof row.position_type === 'number' || typeof row.position_type === 'string');
      });
      if (recognized) {
        var filtered = rows.filter(function (row) { return !row || !(row.position_type == 320 || row.position_type == 710 || row.position_type == 50); });
        if (!array || filtered.length !== rows.length) { obj.data = filtered; result.body = JSON.stringify(obj); }
      }
    }
  } catch (_) {}
  $done(result);

  // Numeric JSON tokens must survive parsing/serialization unchanged.
  // Quoted string contents are never treated as numeric tokens.
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
})();
