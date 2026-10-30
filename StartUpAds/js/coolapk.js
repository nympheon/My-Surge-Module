// Plain implementation of the five branches enabled by StartUpAds.
(function () {
  var result = {};
  try {
    var obj = parseLossless($response.body);
    var url = $request.url;
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      var before = JSON.stringify(obj);
      if (/\/feed\/replyList(?:\?|$)/.test(url) && Array.isArray(obj.data)) {
        obj.data = obj.data.filter(function (row) { return row && row.id; });
      } else if (/\/main\/init(?:\?|$)/.test(url) && Array.isArray(obj.data)) {
        obj.data = obj.data.filter(function (row) { return !row || !(row.entityId == 945 || row.entityId == 6390 || row.entityId == 24455 || row.entityId == 36839); });
      } else if (/\/main\/indexV8(?:\?|$)/.test(url) && Array.isArray(obj.data)) {
        obj.data = obj.data.filter(function (row) {
          return !row || !(row.entityTemplate == 'sponsorCard' || row.entityId == 8639 || row.entityId == 29349 || row.entityId == 33006 || row.entityId == 32557 || /值得买|红包/.test(typeof row.title === 'string' ? row.title : ''));
        });
      } else if (/\/dataList(?:\?|$)/.test(url) && Array.isArray(obj.data)) {
        obj.data = obj.data.filter(function (row) {
          return !row || (['sponsorCard', 'iconButtonGridCard', 'iconLargeScrollCard'].indexOf(row.entityTemplate) === -1 && !/流量|精选配件/.test(typeof row.title === 'string' ? row.title : ''));
        });
      } else if (/\/feed\/detail(?:\?|$)/.test(url) && obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
        ['hotReplyRows', 'topReplyRows'].forEach(function (key) {
          if (Array.isArray(obj.data[key])) obj.data[key] = obj.data[key].filter(function (row) { return row && row.id; });
        });
        ['include_goods_ids', 'include_goods', 'detailSponsorCard'].forEach(function (key) {
          if (obj.data[key]) obj.data[key] = [];
        });
      }
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
