'use strict';
// Offline behavior checks for the selected Kelee additions; no device changes.
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseModule, runJq } = require('../../tests/helpers');
const sections = parseModule('kelee');
const matches = (pattern, url) => {
  const insensitive = pattern.startsWith('(?i)');
  return new RegExp(insensitive ? pattern.slice(4) : pattern, insensitive ? 'i' : '').test(url);
};
const mapping = url => sections['Map Local'].filter(entry => matches(entry.tokens[0], url));
const rewrite = value => {
  const url = 'https://mme.api.moji.com/json/entrance/list';
  const entries = sections['Body Rewrite'].filter(entry => matches(entry.tokens[1], url));
  assert.equal(entries.length, 1, 'one Moji entrance transformation');
  return JSON.parse(runJq(entries[0].tokens[2].slice(1, -1), value));
};

test('Moji removes only the selected personal-page promotions', () => {
  const input = { normal: 7, entrance_region_res_list: [
    { region_name: '皇冠区域', entrance_res_list: [{ entrance_name: '会员' }] },
    { region_name: 'banner区' },
    { region_name: '服务', entrance_res_list: [
      { entrance_name: '墨迹钱包' }, { entrance_name: '墨圈' },
      { entrance_name: '天气预报', id: 'keep' }, { unknown: true }, null
    ] },
    { region_name: '新区域', entrance_res_list: null }, null
  ] };
  assert.deepEqual(rewrite(input), { normal: 7, entrance_region_res_list: [
    { region_name: '服务', entrance_res_list: [{ entrance_name: '天气预报', id: 'keep' }, { unknown: true }, null] },
    { region_name: '新区域', entrance_res_list: null }, null
  ] });
});

test('Moji leaves absent or unknown entrance structures unchanged', () => {
  for (const input of [{ code: 503 }, { entrance_region_res_list: null },
    { entrance_region_res_list: {} }, [], null]) assert.deepEqual(rewrite(input), input);
});

test('Moji static responses retain upstream status and body types', () => {
  const fixtures = [
    ['https://fcard.api.moji.com/flycard/flyCard?a=1', 404, ''],
    ['https://vdo.api.moji.com/shortvideo/card/subscribe', 200, '{}'],
    ['https://vdo.api.moji.com/shortvideo/video/index_flow?a=1', 200, '{}'],
    ['https://vdo.api.moji.com/shortvideo/video_user/hotGuyRcm?a=1', 200, '{}'],
    ['https://vdo.api.moji.com/shortvideo/zone/follow_src_zone?a=1', 200, '{}'],
    ['https://sns.api.moji.com/user/dynamic_v9/json/someone_interest?a=1', 200, '{}']
  ];
  for (const [url, status, body] of fixtures) {
    const entries = mapping(url);
    assert.equal(entries.length, 1, url);
    assert.ok(entries[0].tokens.includes('status-code=' + status), url);
    assert.ok(entries[0].tokens.includes('data=' + JSON.stringify(body)), url);
  }
  for (const url of ['https://vdo.api.moji.com/shortvideo/card/subscriptions',
    'https://sns.api.moji.com/user/dynamic_v9/json/profile?a=1',
    'https://fcard.api.moji.com.evil.invalid/flycard/flyCard?a=1']) {
    assert.equal(mapping(url).length, 0, url);
  }
});

test('360 Smart Life blocks the ad host and only its selected config endpoint', () => {
  assert.ok(sections.Rule.some(entry => entry.text === 'DOMAIN,ad.iot.360.cn,REJECT'));
  const entries = mapping('https://app.home.360.cn/v1/config/custom_config?v=1');
  assert.equal(entries.length, 1);
  assert.ok(entries[0].tokens.includes('data="{}"'));
  assert.ok(entries[0].tokens.includes('status-code=200'));
  for (const url of ['https://app.home.360.cn/v1/device/list',
    'https://app.home.360.cn.evil.invalid/v1/config/custom_config']) assert.equal(mapping(url).length, 0);
});
