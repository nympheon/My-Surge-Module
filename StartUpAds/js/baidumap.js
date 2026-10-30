// Baidu's ads endpoint is BE32(header length) + protobuf RepHead + payload.
// Only Ads.Content banner/splash start/end fields are replaced. Unknown fields,
// message order, payload gaps and non-ad content are retained as raw bytes.
// The module must enable binary-body-mode and cap the body at 1048576 bytes.
(function () {
  var result = {};
  try {
    var source = $response.body;
    if (source instanceof ArrayBuffer) source = new Uint8Array(source);
    if (!source || typeof source !== 'object' || typeof source.length !== 'number' || source.length < 4 || source.length > 1048576) throw new Error('unknown binary body');
    var bytes = new Uint8Array(source);
    var headerLength = bytes[0] * 16777216 + bytes[1] * 65536 + bytes[2] * 256 + bytes[3];
    if (headerLength <= 0 || headerLength > bytes.length - 4) throw new Error('invalid frame length');
    var header = parse(bytes.slice(4, 4 + headerLength));
    var payload = bytes.slice(4 + headerLength);
    var entries = header.filter(function (field) { return field.id === 3 && field.wire === 2; }).map(function (field) {
      var message = parse(field.value);
      return {field: field, message: message, offset: number(message, 1, 0), length: number(message, 2, -1), name: text(value(message, 3))};
    });
    if (!entries.some(function (entry) { return entry.name === 'Result'; }) || !entries.some(function (entry) { return entry.name === 'Ads'; })) throw new Error('unknown message layout');
    var changed = false;
    entries.sort(function (a, b) { return a.offset - b.offset; });
    var parts = [];
    var cursor = 0;
    var newOffset = 0;
    entries.forEach(function (entry) {
      if (entry.offset < cursor || entry.length < 0 || entry.offset + entry.length > payload.length) throw new Error('invalid message range');
      var gap = payload.slice(cursor, entry.offset);
      parts.push(gap);
      newOffset += gap.length;
      var data = payload.slice(entry.offset, entry.offset + entry.length);
      if (entry.name === 'Ads') {
        var ads = parse(data);
        ads.forEach(function (field) {
          if (field.id !== 2 || field.wire !== 2) return;
          var content = parse(field.value);
          var type = text(value(content, 1));
          if ((type.indexOf('_banner') !== -1 || type.indexOf('splash_screen1040') !== -1) && hasNumber(content, 4) && hasNumber(content, 5)) {
            if (number(content, 4) !== 1648746061 || number(content, 5) !== 1648832461) {
              replace(content, 4, 0, 1648746061);
              replace(content, 5, 0, 1648832461);
              field.raw = encoded(2, 2, join(content.map(function (item) { return item.raw; })));
              changed = true;
            }
          }
        });
        data = join(ads.map(function (field) { return field.raw; }));
      }
      if (entry.offset !== newOffset) replace(entry.message, 1, 0, newOffset);
      if (entry.length !== data.length) replace(entry.message, 2, 0, data.length);
      entry.field.raw = encoded(3, 2, join(entry.message.map(function (field) { return field.raw; })));
      parts.push(data);
      newOffset += data.length;
      cursor = entry.offset + entry.length;
    });
    if (changed) {
      parts.push(payload.slice(cursor));
      var nextPayload = join(parts);
      replace(header, 1, 2, ascii(md5(nextPayload)));
      var nextHeader = join(header.map(function (field) { return field.raw; }));
      var prefix = new Uint8Array([nextHeader.length >>> 24, nextHeader.length >>> 16 & 255, nextHeader.length >>> 8 & 255, nextHeader.length & 255]);
      result.body = join([prefix, nextHeader, nextPayload]);
    }
  } catch (_) {}
  $done(result);

  function join(parts) {
    var length = parts.reduce(function (size, part) { return size + part.length; }, 0);
    if (length > 1048576) throw new Error('body limit');
    var out = new Uint8Array(length);
    var offset = 0;
    parts.forEach(function (part) { out.set(part, offset); offset += part.length; });
    return out;
  }
  function varint(data, state) {
    var n = 0;
    var factor = 1;
    for (var i = 0; i < 10; i++) {
      if (state.pos >= data.length) throw new Error('truncated varint');
      var b = data[state.pos++];
      n += (b & 127) * factor;
      if (!(b & 128)) return n;
      factor *= 128;
    }
    throw new Error('invalid varint');
  }
  function writeVarint(n) {
    var bytes = [];
    do { bytes.push(n % 128 | (n >= 128 ? 128 : 0)); n = Math.floor(n / 128); } while (n);
    return new Uint8Array(bytes);
  }
  function parse(data) {
    var fields = [];
    var state = {pos: 0};
    while (state.pos < data.length) {
      var start = state.pos;
      var tag = varint(data, state);
      var wire = tag % 8;
      var id = Math.floor(tag / 8);
      if (id < 1 || id > 536870911) throw new Error('invalid field');
      var content;
      if (wire === 0) content = varint(data, state);
      else if (wire === 1 || wire === 5) state.pos += wire === 1 ? 8 : 4;
      else if (wire === 2) {
        var size = varint(data, state);
        if (!Number.isSafeInteger(size) || size < 0 || size > data.length - state.pos) throw new Error('invalid field length');
        content = data.slice(state.pos, state.pos + size);
        state.pos += size;
      } else throw new Error('unknown wire format');
      if (state.pos > data.length) throw new Error('truncated field');
      fields.push({id: id, wire: wire, value: content, raw: data.slice(start, state.pos)});
    }
    return fields;
  }
  function value(fields, id) {
    var matches = fields.filter(function (field) { return field.id === id && field.wire === 2; });
    return matches.length ? matches[matches.length - 1].value : new Uint8Array();
  }
  function hasNumber(fields, id) { return fields.some(function (field) { return field.id === id && field.wire === 0; }); }
  function number(fields, id, fallback) {
    var matches = fields.filter(function (field) { return field.id === id && field.wire === 0; });
    return matches.length ? matches[matches.length - 1].value : fallback;
  }
  function text(bytes) {
    var out = '';
    for (var i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
    return out;
  }
  function ascii(text) {
    var out = new Uint8Array(text.length);
    for (var i = 0; i < text.length; i++) out[i] = text.charCodeAt(i);
    return out;
  }
  function encoded(id, wire, content) {
    return wire === 0 ? join([writeVarint(id * 8), writeVarint(content)]) : join([writeVarint(id * 8 + 2), writeVarint(content.length), content]);
  }
  function replace(fields, id, wire, content) {
    var found = false;
    fields.forEach(function (field) {
      if (field.id === id && field.wire === wire) { field.raw = encoded(id, wire, content); found = true; }
    });
    if (!found) fields.push({id: id, wire: wire, value: content, raw: encoded(id, wire, content)});
  }
  // RFC 1321 MD5, used by RepHead as a payload integrity checksum.
  function md5(input) {
    var length = Math.ceil((input.length + 9) / 64) * 64;
    var padded = new Uint8Array(length);
    padded.set(input);
    padded[input.length] = 128;
    var view = new DataView(padded.buffer);
    view.setUint32(length - 8, input.length * 8, true);
    view.setUint32(length - 4, Math.floor(input.length / 536870912), true);
    var sums = [1732584193, -271733879, -1732584194, 271733878];
    var shifts = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
    for (var offset = 0; offset < length; offset += 64) {
      var a = sums[0], b = sums[1], c = sums[2], d = sums[3];
      for (var i = 0; i < 64; i++) {
        var f, word;
        if (i < 16) { f = b & c | ~b & d; word = i; }
        else if (i < 32) { f = d & b | ~d & c; word = (5 * i + 1) % 16; }
        else if (i < 48) { f = b ^ c ^ d; word = (3 * i + 5) % 16; }
        else { f = c ^ (b | ~d); word = 7 * i % 16; }
        var sum = (a + f + Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) + view.getInt32(offset + word * 4, true)) | 0;
        var shift = shifts[Math.floor(i / 16) * 4 + i % 4];
        a = d; d = c; c = b; b = (b + (sum << shift | sum >>> (32 - shift))) | 0;
      }
      sums[0] = sums[0] + a | 0; sums[1] = sums[1] + b | 0;
      sums[2] = sums[2] + c | 0; sums[3] = sums[3] + d | 0;
    }
    var hex = '';
    sums.forEach(function (word) {
      for (var i = 0; i < 4; i++) hex += ('0' + (word >>> (i * 8) & 255).toString(16)).slice(-2);
    });
    return hex;
  }
})();
