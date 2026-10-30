'use strict';
// Frozen codecs are an offline semantic oracle only. Never imported by published JS.
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { root } = require('./index');
const source = fs.readFileSync(path.join(root, 'references/moyu-independent/scripts/tieba-proto.js'), 'utf8');
function realm(body, url, status = 204, argument = '') {
  const context = vm.createContext(Object.create(null), { codeGeneration: { strings: false, wasm: false } });
  vm.runInContext(`var result, calls=0; var console={log(){}}; var $done=function(v){result=v;calls++};
    var $request={url:${JSON.stringify(url)}}; var $response={status:${status},body:new Uint8Array(${JSON.stringify(Array.from(body))})};
    var $argument=${JSON.stringify(argument)};`, context, { timeout: 1000 });
  vm.runInContext(source, context, { timeout: 1000 });
  return context;
}
function decode(type, body) {
  const context = realm(body, '');
  return JSON.parse(vm.runInContext(`JSON.stringify(${type}.toJson(${type}.fromBinary($response.body)))`, context, { timeout: 1000 }));
}
function original(body, url, type, argument = '') {
  const context = realm(body, url, 200, argument);
  return JSON.parse(vm.runInContext(`JSON.stringify(${type}.toJson(${type}.fromBinary(result.body)))`, context, { timeout: 1000 }));
}
module.exports = { decode, original };
