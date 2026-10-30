// Only the threadpost page=1 endpoint is enabled by the module.
(function () {
  var result = {};
  try {
    var obj = parseLossless($response.body);
    var detail = obj && obj.Variables && obj.Variables.data && obj.Variables.data.threaddetail;
    if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
      var before = JSON.stringify(obj);
      detail.tagadv = '';
      detail.threadapp_ad_video = [];
      detail.pingyouadv = '';
      detail.middleadv = '';
      detail.bottomadv = '';
      detail.appdetailadv = [];
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
