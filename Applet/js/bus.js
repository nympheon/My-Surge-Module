/* Cuttlefish / ddgksf2013 zhangshanggongjiao.js readable port.
 * Match exact JSON property tokens and numeric 1, preventing Ad:10 -> Ad:00.
 * Parsed data is only inspected, never serialized; all other raw bytes survive. */
(function () {
  var body = $response.body, output = body;
  try {
    var root = JSON.parse(body);
    if (root && typeof root === 'object' && !root.error && !root.errorMessage) {
      var tokens = /"(?:\\.|[^"\\])*"|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
      var edits = [], match;
      while ((match = tokens.exec(body))) {
        if (match[0][0] !== '"') continue;
        var key = JSON.parse(match[0]);
        if (key !== 'Ad' && key !== 'Ad_ab') continue;
        var suffix = body.slice(tokens.lastIndex).match(/^\s*:\s*(1)(?=\s*[,}\]])/);
        if (suffix) edits.push(tokens.lastIndex + suffix[0].lastIndexOf('1'));
      }
      for (var i = edits.length - 1; i >= 0; i--) output = output.slice(0, edits[i]) + '0' + output.slice(edits[i] + 1);
    }
  } catch (_) { output = body; }
  $done({ body: output });
})();
