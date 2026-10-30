// 可莉航旅纵横规则：只拦截指定广告 rpid，缺少头部时正常放行。
(() => {
  const headers = $request.headers || {};
  const key = Object.keys(headers).find(k => k.toLowerCase() === "rpid");
  const value = key ? String(headers[key]) : "";
  $done(/1000002|1000019/.test(value)
    ? { response: { status: 404, body: "" } }
    : {});
})();
