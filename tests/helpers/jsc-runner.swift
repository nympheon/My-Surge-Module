import Foundation
import JavaScriptCore

// No native conversion of binary JSValue: both directions stay in the JSC realm.
let transport = """
function decodeBoundary(node) {
  switch (node[0]) {
    case 'undefined': return undefined;
    case 'bytes': return new Uint8Array(node[1]);
    case 'value': return node[1];
    case 'array': return node[1].map(decodeBoundary);
    case 'object': var out = {}; node[1].forEach(function(pair) {
      Object.defineProperty(out, pair[0], {value:decodeBoundary(pair[1]), enumerable:true, writable:true, configurable:true});
    }); return out;
  }
  throw new Error('Unknown boundary tag');
}
function encodeBoundary(value) {
  if (value === undefined) return ['undefined'];
  if (value instanceof Uint8Array) return ['bytes', Array.from(value)];
  if (Array.isArray(value)) return ['array', value.map(encodeBoundary)];
  if (value !== null && typeof value === 'object') return ['object', Object.keys(value).map(function(key) {return [key,encodeBoundary(value[key])];})];
  return ['value',value];
}
var calls = [];
var $done = function(value) {calls.push(value);};
var BigInt = undefined, TextDecoder = undefined, Buffer = undefined, require = undefined;
"""
do {
  let data = FileHandle.standardInput.readDataToEndOfFile()
  let fixtures = try JSONSerialization.jsonObject(with:data) as! [[String:Any]]
  var outputs: [Any] = []
  for (index, fixture) in fixtures.enumerated() {
    let context = JSContext()!
    var failure: String? = nil
    context.exceptionHandler = { _, value in failure = value?.toString() ?? "JavaScript exception" }
    context.evaluateScript(transport)
    let encoded = try JSONSerialization.data(withJSONObject:fixture["globals"]!)
    let globals = String(data:encoded,encoding:.utf8)!
    context.evaluateScript("var input = decodeBoundary(\(globals)); Object.keys(input).forEach(function(key) { this[key] = input[key]; });")
    context.evaluateScript(fixture["source"] as! String, withSourceURL:URL(fileURLWithPath:fixture["path"] as! String))
    if let message = failure { throw NSError(domain:"JSC fixture \(index)",code:1,userInfo:[NSLocalizedDescriptionKey:message]) }
    let count = context.evaluateScript("calls.length")!.toInt32()
    guard count == 1 else { throw NSError(domain:"JSC fixture \(index)",code:2,userInfo:[NSLocalizedDescriptionKey:"Expected one $done, got \(count)"]) }
    let json = context.evaluateScript("JSON.stringify(encodeBoundary(calls[0]))")!.toString()!
    outputs.append(try JSONSerialization.jsonObject(with:json.data(using:.utf8)!))
  }
  let output = try JSONSerialization.data(withJSONObject:outputs,options:[.sortedKeys])
  FileHandle.standardOutput.write(output)
} catch {
  FileHandle.standardError.write("\(error)\n".data(using:.utf8)!)
  exit(1)
}
