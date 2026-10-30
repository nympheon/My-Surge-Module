(function () {
  var result = {};
  try {
    var obj = parseLossless($response.body);
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      var changed = false;
      if (/^https?:\/\/api\.m\.jd\.com\/client\.action\?functionId=hotWords(?:&|$)/.test($request.url)) {
        var hasWords = Object.prototype.hasOwnProperty.call(obj, 'hotwords');
        var hasTabs = Object.prototype.hasOwnProperty.call(obj, 'tabs');
        if ((hasWords || hasTabs) && (!hasWords || collection(obj.hotwords)) && (!hasTabs || collection(obj.tabs))) {
          changed = !empty(obj.hotwords) || !empty(obj.tabs) || Object.prototype.hasOwnProperty.call(obj, 'abver');
          if (changed) { obj.hotwords = {}; obj.tabs = {}; delete obj.abver; }
        }
      } else if (/^https?:\/\/api\.m\.jd\.com\/client\.action\?functionId=hotSearchTerms(?:&|$)/.test($request.url) && obj.topData && typeof obj.topData === 'object' && !Array.isArray(obj.topData) && collection(obj.topData.data) && collection(obj.data)) {
        changed = !empty(obj.topData.data) || !empty(obj.data);
        if (changed) { obj.topData.data = {}; obj.data = {}; }
      }
      if (changed) result.body = JSON.stringify(obj);
    }
  } catch (_) {}
  $done(result);

  // Known collection payloads are arrays or the already-cleared {} shape.
  // New object wrappers need inspection before their content can be discarded.
  function empty(value) { return value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0; }
  function collection(value) { return Array.isArray(value) || empty(value); }

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
