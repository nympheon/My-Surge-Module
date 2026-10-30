/* Readable port of ddgksf2013 applet.js. Edits raw scalar tokens, never
 * reserializes a parsed response: unrelated escaping and numeric bytes survive.
 * Corrected original suffix-key/quote corruption; see AUDIT.md. */
(function () {
  var body = $response.body;
  var output = body;
  try {
    var root = JSON.parse(body);
    if (root && typeof root === 'object' &&
        !root.error && !root.errorMessage &&
        !(Array.isArray(root.ret) && root.ret.some(function (v) { return typeof v === 'string' && /^FAIL_/.test(v); }))) {
      var tokens = /"(?:\\.|[^"\\])*"|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
      var edits = [], match;
      while ((match = tokens.exec(body))) {
        var raw = match[0], start = match.index, end = tokens.lastIndex;
        if (raw[0] !== '"') continue;
        var value = JSON.parse(raw);
        var after = body.slice(end).match(/^\s*:\s*/);
        if (after) {
          var valueStart = end + after[0].length;
          tokens.lastIndex = valueStart;
          var next = tokens.exec(body);
          if (!next || next.index !== valueStart) { tokens.lastIndex = end; continue; }
          var replacement = undefined;
          if ((value === 'excitationAd' || value === 'Ad') && /^"\d"$/.test(next[0])) replacement = '"0"';
          else if (value === 'ad' && next[0] === 'true') replacement = 'false';
          else if ((value === 'AdId' || value === 'adid') && next[0][0] === '"') replacement = '""';
          else if (value === 'fr_videp_if' && next[0] === '"1"') replacement = '"0"';
          if (replacement !== undefined) edits.push({ start: valueStart, end: tokens.lastIndex, value: replacement });
          else tokens.lastIndex = end; // Revisit value tokens for ad-unit IDs/HTML, and nested object keys.
        } else {
          var cleaned = value;
          if (/^adunit(?:\d+|-[a-fA-F0-9]+)$/.test(value)) cleaned = '';
          else cleaned = value.replace(/(\bunit-id\s*=\s*["'])adunit-[a-fA-F0-9]+(?=["'])/g, '$1');
          if (cleaned !== value) edits.push({ start: start, end: end, value: JSON.stringify(cleaned) });
        }
      }
      for (var i = edits.length - 1; i >= 0; i--) output = output.slice(0, edits[i].start) + edits[i].value + output.slice(edits[i].end);
    }
  } catch (_) { output = body; }
  $done({ body: output });
})();
