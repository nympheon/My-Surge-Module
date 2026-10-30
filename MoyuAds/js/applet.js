/* Readable port of ddgksf2013 applet.js. Edits raw scalar tokens, never
 * reserializes a parsed response: unrelated escaping and numeric bytes survive.
 * Corrected original suffix-key/quote corruption; see AUDIT.md. */
(function () {
  var body = $response.body;
  var output = body;
  // Consume complete tags and quoted attributes before examining exact attribute names.
  // Comments/raw-text elements are opaque; examples inside them are article content.
  function clearHtmlUnits(value) {
    var tags = /<!--[\s\S]*?(?:-->|$)|<(script|style|textarea|title)(?=[\t\n\f\r />])(?:[^"'<>]|"[^"]*"|'[^']*')*>[\s\S]*?(?:<\/\1\s*>|$)|<[A-Za-z][A-Za-z0-9:-]*(?=[\t\n\f\r />])(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi;
    return value.replace(tags, function (tag, rawTextName) {
      if (tag.indexOf('<!--') === 0 || rawTextName) return tag;
      var position = tag.match(/^<[A-Za-z][A-Za-z0-9:-]*/)[0].length;
      var patches = [];
      while (position < tag.length - 1) {
        // Anchored scanning consumes another attribute's entire quoted value,
        // so unit-id-like prose inside title/data-* values cannot become a match.
        var attribute = tag.slice(position).match(/^([\t\n\f\r ]+)([^\t\n\f\r "'<>/=]+)(?:([\t\n\f\r ]*=[\t\n\f\r ]*)("[^"]*"|'[^']*'|[^\t\n\f\r "'=<>`]+))?/);
        if (!attribute) break;
        var token = attribute[4];
        if (attribute[2].toLowerCase() === 'unit-id' && token &&
            (token[0] === '"' || token[0] === "'") && /^adunit-[a-fA-F0-9]+$/.test(token.slice(1, -1))) {
          var start = position + attribute[1].length + attribute[2].length + attribute[3].length + 1;
          patches.push({ start: start, end: start + token.length - 2 });
        }
        position += attribute[0].length;
      }
      for (var i = patches.length - 1; i >= 0; i--) tag = tag.slice(0, patches[i].start) + tag.slice(patches[i].end);
      return tag;
    });
  }
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
          else cleaned = clearHtmlUnits(value);
          if (cleaned !== value) edits.push({ start: start, end: end, value: JSON.stringify(cleaned) });
        }
      }
      for (var i = edits.length - 1; i >= 0; i--) output = output.slice(0, edits[i].start) + edits[i].value + output.slice(edits[i].end);
    }
  } catch (_) { output = body; }
  $done({ body: output });
})();
