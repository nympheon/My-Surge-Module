/* TieBa selected protobuf purification, hand-authored for Surge.
 * Source behavior: app2smile/rules tieba-proto.js (frozen 2026-10-31).
 * Wire spans are retained verbatim. Only removed fields and ancestor lengths change.
 * No codec runtime, imports, text decoder or 64-bit numeric conversion is needed.
 */
(function () {
    'use strict';
    // Handwritten selected schema: 0 = varint, 2 = UTF-8 string, object = message.
    // Unknown length-delimited fields stay opaque; they are not assumed to be strings.
    var live = { 1: 0 };
    var app = { 30: { 1: 0 }, 38: { 1: live } };
    var banner = { 1: app, 5: app };
    var thread = { 79: { 1: 2 }, 113: live };
    var post = { 54: { 1: 0 }, 67: { 1: 2 } };
    var feed = { 2: { 5: { 1: 2, 2: 2 } } };
    var frs = { 2: { 33: banner }, 7: thread, 23: { 13: 0 }, 116: { 1: 2 }, 126: { 2: feed } };
    var threadList = { 3: banner };
    var generalTab = { 10: app };
    var personalized = { 9: banner, 2: thread, 17: { 1: 2 } };
    var oldPostPage = { 12: banner, 55: live, 6: post };
    var listPostPage = { 6: post };
    var result = {};
    try {
        var status = $response.status || $response.statusCode;
        var bytes = $response.body;
        var route = /^http(s:\/\/tiebac|:\/\/c\.tieba)\.baidu\.com\/c\/f\/(frs\/(?:page|threadlist|generalTabList)|pb\/page|excellent\/personalized)\?cmd=([^&#]*)(?:&[^#]*)?$/.exec($request.url);
        if (status === 200 && route && bytes instanceof Uint8Array && bytes.length <= 1048576) {
            var endpoint = route[2];
            // Command must be unambiguous. Do not misread an unrelated parameter's digits.
            var command = route[3];
            var duplicateCommand = /&cmd(?:=|&|$)/.test($request.url);
            if (!duplicateCommand && (endpoint !== 'pb/page' || command === '302001' || command === '309751')) {
                var schema = endpoint === 'frs/page' ? frs : endpoint === 'frs/threadlist' ? threadList :
                    endpoint === 'frs/generalTabList' ? generalTab : endpoint === 'excellent/personalized' ? personalized :
                    command === '302001' ? oldPostPage : listPostPage;
                var budget = { fields: 0 };
                var root = parse(0, bytes.length, { 2: schema }, 0);
                var envelopes = children([root], 2);
                if (endpoint === 'frs/page') {
                    cleanBanner(children(children(envelopes, 2), 33), false);
                    cleanThreads(envelopes, 7, false);
                    remove(envelopes, 116);
                    var activities = children(envelopes, 23);
                    if (lastNonzero(activities, 13)) remove(envelopes, 23);
                    var pages = children(envelopes, 126);
                    fields(pages, 2).forEach(function (entry) {
                        var feeds = children([entry.child], 2);
                        var live = fields(feeds, 5).some(function (kv) {
                            return lastAscii([kv.child], 1, 'is_live_card') && lastAscii([kv.child], 2, '1');
                        });
                        if (live) entry.removed = true;
                    });
                } else if (endpoint === 'frs/threadlist') {
                    cleanBanner(children(envelopes, 3), false);
                } else if (endpoint === 'frs/generalTabList') {
                    fields(envelopes, 10).forEach(function (entry) { remove([entry.child], 30); });
                } else if (endpoint === 'excellent/personalized') {
                    cleanBanner(children(envelopes, 9), false);
                    cleanThreads(envelopes, 2, filterVideo());
                    remove(envelopes, 17);
                } else if (command === '302001') {
                    cleanBanner(children(envelopes, 12), true);
                    if (lastNonzero(children(envelopes, 55), 1)) remove(envelopes, 55);
                    fields(envelopes, 6).forEach(function (entry) {
                        remove([entry.child], 54);
                        remove([entry.child], 67);
                    });
                } else {
                    remove(children(envelopes, 6), 67);
                }
                measure(root);
                if (root.changed) {
                    var body = new Uint8Array(root.size);
                    write(root, body, 0);
                    result = { body: body };
                }
            }
        }
    } catch (_) {
        // Invalid framing, known-field wire mismatch, or traversal budget: whole response passes through.
    }
    $done(result);

    // Tags and lengths fit uint32; scalar values never enter JS Number arithmetic.
    function uint32(position, end) {
        var value = 0, factor = 1;
        for (var i = 0; i < 5 && position < end; i++) {
            var b = bytes[position++];
            if (i === 4 && b > 15) throw new Error('uint32 overflow');
            value += (b & 127) * factor;
            if (b < 128) return { value: value, end: position };
            factor *= 128;
        }
        throw new Error('unterminated uint32');
    }
    function scalarEnd(position, end) {
        for (var i = 0; i < 10 && position < end; i++) {
            var b = bytes[position++];
            if (i === 9 && b > 1) throw new Error('uint64 overflow');
            if (b < 128) return position;
        }
        throw new Error('unterminated scalar');
    }
    // Validate bytes in-place, matching the source codec's fatal UTF-8 strings.
    // Each known string is scanned once within the enclosing 1 MiB body bound.
    // No decoded text is allocated and retained bytes are never re-encoded.
    function validateUtf8(position, end) {
        while (position < end) {
            var lead = bytes[position++];
            if (lead < 128) continue;
            var remaining, secondMin = 128, secondMax = 191;
            if (lead >= 194 && lead <= 223) remaining = 1;
            else if (lead >= 224 && lead <= 239) {
                remaining = 2;
                if (lead === 224) secondMin = 160; // Exclude overlong three-byte forms.
                if (lead === 237) secondMax = 159; // Exclude UTF-16 surrogate code points.
            } else if (lead >= 240 && lead <= 244) {
                remaining = 3;
                if (lead === 240) secondMin = 144; // Exclude overlong four-byte forms.
                if (lead === 244) secondMax = 143; // Stop at Unicode U+10FFFF.
            } else throw new Error('invalid UTF-8 leading byte');
            if (position + remaining > end) throw new Error('truncated UTF-8');
            var second = bytes[position++];
            if (second < secondMin || second > secondMax) throw new Error('invalid UTF-8 second byte');
            for (var i = 1; i < remaining; i++) {
                var continuation = bytes[position++];
                if (continuation < 128 || continuation > 191) throw new Error('invalid UTF-8 continuation');
            }
        }
    }
    function parse(start, end, schema, depth) {
        if (depth > 12) throw new Error('depth limit');
        var node = { start: start, end: end, fields: [] };
        var position = start;
        while (position < end) {
            if (++budget.fields > 100000) throw new Error('field limit');
            var begin = position;
            var tag = uint32(position, end);
            position = tag.end;
            var id = Math.floor(tag.value / 8), wire = tag.value % 8;
            if (!id) throw new Error('zero field');
            var spec = schema[id];
            var known = Object.prototype.hasOwnProperty.call(schema, id);
            if (known && wire !== (typeof spec === 'object' ? 2 : spec)) throw new Error('schema mismatch');
            var field = { id: id, start: begin, tagEnd: position, payload: position };
            if (wire === 0) position = scalarEnd(position, end);
            else if (wire === 1) position += 8;
            else if (wire === 5) position += 4;
            else if (wire === 2) {
                var length = uint32(position, end);
                field.payload = length.end;
                position = length.end + length.value;
                if (position > end) throw new Error('length overflow');
                if (known && typeof spec === 'object') field.child = parse(field.payload, position, spec, depth + 1);
                else if (known && spec === 2) validateUtf8(field.payload, position);
            } else throw new Error('unsupported wire');
            if (position > end) throw new Error('truncated fixed field');
            field.end = position;
            node.fields.push(field);
        }
        return node;
    }
    // Repeated singular messages merge in wire order. Keep their chunks in place;
    // collect them together only to make a decision about the effective last scalar.
    function fields(nodes, id) {
        var found = [];
        nodes.forEach(function (node) {
            node.fields.forEach(function (field) { if (field.id === id) found.push(field); });
        });
        return found;
    }
    function children(nodes, id) {
        return fields(nodes, id).map(function (field) { return field.child; });
    }
    function remove(nodes, id) {
        fields(nodes, id).forEach(function (field) { field.removed = true; });
    }
    function lastNonzero(nodes, id) {
        var matches = fields(nodes, id);
        if (!matches.length) return false;
        var last = matches[matches.length - 1];
        for (var i = last.payload; i < last.end; i++) if ((bytes[i] & 127) !== 0) return true;
        return false;
    }
    function lastAscii(nodes, id, expected) {
        var matches = fields(nodes, id);
        if (!matches.length) return false;
        var last = matches[matches.length - 1];
        if (last.end - last.payload !== expected.length) return false;
        for (var i = 0; i < expected.length; i++) if (bytes[last.payload + i] !== expected.charCodeAt(i)) return false;
        return true;
    }
    function cleanBanner(nodes, oldPost) {
        fields(nodes, 1).forEach(function (entry) { remove([entry.child], 30); });
        if (oldPost) {
            var pbBanner = children(nodes, 5);
            remove(pbBanner, 30);
            remove(pbBanner, 38);
        }
    }
    function cleanThreads(nodes, id, video) {
        fields(nodes, id).forEach(function (entry) {
            // Presence is sufficient here, including alaInfo.liveId=0.
            if (fields([entry.child], 113).length || (video && fields([entry.child], 79).length)) entry.removed = true;
        });
    }
    function filterVideo() {
        // Existing upstream option, default 0. The module adds no new setting.
        var option = 0;
        if (typeof $argument === 'string') {
            $argument.split('&').forEach(function (pair) {
                var parts = pair.split('=');
                if (parts[0] === 'per_filter_video_thread') option = parts[1];
            });
        } else if (typeof $argument === 'object' && $argument) option = $argument.per_filter_video_thread;
        return !!Number(option);
    }
    function varintSize(value) {
        var size = 1;
        while (value >= 128) { value = Math.floor(value / 128); size++; }
        return size;
    }
    function measure(node) {
        node.size = 0;
        node.changed = false;
        node.fields.forEach(function (field) {
            if (field.removed) { node.changed = true; return; }
            if (field.child) measure(field.child);
            if (field.child && field.child.changed) {
                node.changed = true;
                node.size += field.tagEnd - field.start + varintSize(field.child.size) + field.child.size;
            } else node.size += field.end - field.start;
        });
    }
    function write(node, output, position) {
        node.fields.forEach(function (field) {
            if (field.removed) return;
            if (field.child && field.child.changed) {
                output.set(bytes.subarray(field.start, field.tagEnd), position);
                position += field.tagEnd - field.start;
                var length = field.child.size;
                while (length >= 128) {
                    output[position++] = length % 128 + 128;
                    length = Math.floor(length / 128);
                }
                output[position++] = length;
                position = write(field.child, output, position);
            } else {
                output.set(bytes.subarray(field.start, field.end), position);
                position += field.end - field.start;
            }
        });
        return position;
    }
})();
