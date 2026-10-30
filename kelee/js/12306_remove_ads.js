// 可莉 12306 规则，手工改为 Surge 请求阶段中止。
(() => {
  const headers = $request.headers || {};
  const key = Object.keys(headers).find(k => k.toLowerCase() === "operation-type");
  const operations = new Set([
    "com.cars.otsmobile.integration.activityBanner",
    "com.cars.otsmobile.memberInfo.getMemberQa",
    "com.cars.otsmobile.newHomePage.initData",
    "com.cars.otsmobile.newHomePageBussData",
    "com.cars.otsmobile.paySuccBuss.bussEntryShow"
  ]);
  $done(key && operations.has(headers[key]) ? { abort: true } : {});
})();
