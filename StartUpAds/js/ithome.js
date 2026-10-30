(function () {
  var result = {};
  try {
    var obj = parseLossless($response.body);
    var collection = obj && obj.data && obj.data.list;
    if (collection && typeof collection === 'object') {
      var rows = Object.values(collection);
      var array = Array.isArray(collection);
      var recognized = array || rows.some(function (row) {
        return row && !Array.isArray(row) && row.feedContent && (typeof row.feedContent.flag === 'number' || typeof row.feedContent.flag === 'string');
      });
      if (recognized) {
        var filtered = rows.filter(function (row) { return !row || !row.feedContent || row.feedContent.flag != 2; });
        if (!array || filtered.length !== rows.length) { obj.data.list = filtered; result.body = JSON.stringify(obj); }
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
