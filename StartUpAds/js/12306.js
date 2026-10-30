// Requires the request body. Unknown or malformed request formats pass through.
(function () {
  var result = {};
  try {
    var request = JSON.parse($request.body);
    if (request && typeof request === 'object' && !Array.isArray(request) && typeof request.placementNo === 'string') {
      var body;
      if (request.placementNo === '0007') {
        body = {materialsList: [{billMaterialsId: '6491', filePath: 'ddgksf2013', creativeType: 1}], advertParam: {skipTime: 1}, code: '00'};
      } else if (request.placementNo === 'G0054') {
        body = {code: '00', materialsList: [{}]};
      } else {
        body = {code: '00', message: '无广告返回'};
      }
      result.response = {status: 200, headers: {'Content-Type': 'application/json; charset=utf-8'}, body: JSON.stringify(body)};
    }
  } catch (_) {}
  $done(result);
})();
