// Request-stage guard; non-ad operations continue to their real server.
(function () {
  var headers = $request.headers || {};
  var key = Object.keys(headers).find(function (name) { return name.toLowerCase() === 'rpid'; });
  var value = key ? headers[key] : '';
  var matched = typeof value === 'string' && (value.indexOf('10000012') !== -1 || value.indexOf('1000019') !== -1);
  $done(matched ? {response: {status: 404, headers: {}, body: ''}} : {});
})();
