// Decoded upstream channelid operation names; request-stage guard.
(function () {
  var headers = $request.headers || {};
  var key = Object.keys(headers).find(function (name) { return name.toLowerCase() === 'channelid'; });
  var value = key ? headers[key] : '';
  var matched = typeof value === 'string' && ['getStartParam', 'getAdverInfo', 'recommond_center'].some(function (operation) { return value.indexOf(operation) !== -1; });
  $done(matched ? {response: {status: 404, headers: {}, body: ''}} : {});
})();
