/* Readable ddgksf2013 chelaile.js port. A small JSON span reader locates only
 * cityList and its item properties. It never serializes unrelated JSON values,
 * so unsafe integers, decimals, string escapes and wrapper siblings survive. */
(function () {
  var body = $response.body, output = body;
  try {
    if (!/\/goocity\/city!/.test($request.url)) throw new Error('unsupported URL');
    var open = body.indexOf('**YGKJ'), close = body.lastIndexOf('YGKJ**');
    if (open < 0 || close < open + 6 || body.indexOf('**YGKJ', open + 6) !== -1) throw new Error('unknown wrapper');
    var start = open + 6, text = body.slice(start, close), parsed = JSON.parse(text);
    function error(value) { return value && typeof value === 'object' && (value.error || value.errorMessage || (Array.isArray(value.ret) && value.ret.some(function (v) { return typeof v === 'string' && /^FAIL_/.test(v); }))); }
    if (error(parsed) || error(parsed.jsonr)) throw new Error('error envelope');
    var position = 0;
    function space() { while (/\s/.test(text[position] || '') && position < text.length) position++; }
    function read(depth) {
      if (depth > 100) throw new Error('depth');
      space();
      var begin = position, character = text[position], node = { start: begin };
      if (character === '{' || character === '[') {
        var object = character === '{'; node.type = object ? 'object' : 'array'; node.children = [];
        position++; space();
        var seen = Object.create(null);
        while (text[position] !== (object ? '}' : ']')) {
          var key, propertyStart = position;
          if (object) {
            var keyNode = read(depth + 1); key = JSON.parse(text.slice(keyNode.start, keyNode.end));
            if (typeof key !== 'string' || seen[key]) throw new Error('duplicate/invalid key');
            seen[key] = true; space(); if (text[position++] !== ':') throw new Error('colon');
          }
          var child = read(depth + 1); child.key = key; child.propertyStart = propertyStart; node.children.push(child);
          space(); if (text[position] !== ',') break; position++; space();
        }
        position++;
      } else if (character === '"') {
        node.type = 'string'; position++;
        while (position < text.length) { var next = text[position++]; if (next === '\\') position++; else if (next === '"') break; }
      } else {
        node.type = 'scalar'; while (position < text.length && !/[\s,}\]]/.test(text[position])) position++;
      }
      node.end = position; return node;
    }
    function get(node, key) {
      if (!node || node.type !== 'object') return null;
      for (var i = 0; i < node.children.length; i++) if (node.children[i].key === key) return node.children[i];
      return null;
    }
    var tree = read(0), list = get(get(get(tree, 'jsonr'), 'data'), 'cityList');
    if (!list || list.type !== 'array') throw new Error('unknown list');
    var retained = [];
    for (var i = 0; i < list.children.length; i++) {
      var item = list.children[i], title = get(item, 'title');
      if (!title || title.type !== 'string') throw new Error('unknown item');
      var name = JSON.parse(text.slice(title.start, title.end));
      if (['首页', '我的', '路线规划'].indexOf(name) === -1) continue;
      var fields = [];
      for (var j = 0; j < item.children.length; j++) {
        var field = item.children[j];
        if (field.key !== 'picUrl' && field.key !== 'clickIconUrl') fields.push(text.slice(field.propertyStart, field.end));
      }
      retained.push('{' + fields.join(',') + '}');
    }
    output = body.slice(0, start + list.start) + '[' + retained.join(',') + ']' + body.slice(start + list.end);
  } catch (_) { output = body; }
  $done({ body: output });
})();
