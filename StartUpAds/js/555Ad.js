// 555 movie recommendations. Preserve unfamiliar rows and cards.
(function () {
  var result = {};
  try {
    var obj = parseLossless($response.body);
    if (obj && !Array.isArray(obj) && Array.isArray(obj.data)) {
      var before = JSON.stringify(obj);
      obj.data = obj.data.filter(function (row) { return !row || row.layout !== 'advert_self'; });
      obj.data.forEach(function (row) {
        if (row && Array.isArray(row.list)) row.list = row.list.filter(function (card) { return !card || card.type !== 3; });
      });
      if (JSON.stringify(obj) !== before) result.body = JSON.stringify(obj);
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
