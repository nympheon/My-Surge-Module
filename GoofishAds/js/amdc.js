/* AMDC request-stage port. Upstream: ddgksf2013/Scripts amdc.js V1.0.11.
 * Own copy: this module installs independently; no runtime loader or dependency.
 * Only User-Agent is inspected. No body is requested or parsed.
 */
(function () {
  var headers = $request.headers || {};
  var names = Object.keys(headers);
  var ua = '';
  for (var i = 0; i < names.length; i++) {
    if (names[i].toLowerCase() === 'user-agent') {
      ua = headers[names[i]];
      break;
    }
  }
  var matched = typeof ua === 'string' && /(AMap|Cainiao|%E9%97%B2%E9%B1%BC|%E9%A3%9E%E7%8C%AA%E6%97%85%E8%A1%8C|%E5%96%B5%E8%A1%97|%E5%A4%A9%E7%8C%AB|Alibaba|MovieApp|Hema4iPhone|Moon|DMPortal)/.test(ua);
  $done(matched ? {
    response: {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'ddgksf2013'
    }
  } : {});
})();
