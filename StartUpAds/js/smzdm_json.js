// StartUpAds enables only advert_distribution/get_all_advertise.
(function () {
  var result = {};
  try {
    var obj = parseLossless($response.body);
    if (/\/advert_distribution\/get_all_advertise(?:\?|$)/.test($request.url) && obj && obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
      var before = JSON.stringify(obj);
      obj.data.start_date = '2030-12-24 00:00:00';
      obj.data.end_date = '2030-12-24 23:59:59';
      obj.data.unix_start_date = '1924272000';
      obj.data.unix_end_date = '1924358399';
      obj.data.is_show_ad = '0';
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
