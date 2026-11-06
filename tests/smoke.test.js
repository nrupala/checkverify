// CheckVerify smoke test — loads the real page script from index.html and
// exercises its core behaviour: token generation/parsing, expiry maths,
// link creation, and the verification verdicts (valid / expired / invalid).
// Run: node tests/smoke.test.js   (no dependencies; Node 18+)
'use strict';
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

let passed = 0;
function ok(name, cond) {
  assert.ok(cond, name);
  passed += 1;
  console.log('ok -', name);
}

// --- (a) Page structure: core UI elements, options, and logic hooks ---
for (const id of ['linkType', 'linkName', 'linkData', 'linkExpiry',
  'generatedLink', 'verifyInput', 'verifyResult', 'linkList', 'linkCount',
  'validCount']) {
  ok(`page has #${id}`, html.includes(`id="${id}"`));
}
for (const fn of ['createLink', 'verifyLink', 'testLink', 'copyLink', 'exportLinks']) {
  ok(`page wires ${fn}()`, html.includes(`onclick="${fn}(`));
}
for (const t of ['credential', 'certificate', 'profile', 'custom']) {
  ok(`link type "${t}" exists`, html.includes(`value="${t}"`));
}
for (const h of ['1', '24', '168', '720', '8760']) {
  ok(`expiry option ${h}h exists`, html.includes(`<option value="${h}">`));
}
ok('page declares a version', /<meta name="version" content="\d+\.\d+\.\d+">/.test(html));

// --- (b) Load the page's own inline script with minimal DOM stubs ---
const store = new Map();
const localStorageStub = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const elements = new Map();
function element(id) {
  if (!elements.has(id)) {
    elements.set(id, {
      id, value: '', textContent: '', innerHTML: '',
      classList: { add() {}, remove() {} },
    });
  }
  return elements.get(id);
}
const alerts = [];
const context = {
  console,
  btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
  atob: (s) => Buffer.from(s, 'base64').toString('binary'),
  localStorage: localStorageStub,
  navigator: { clipboard: { writeText() {} } },
  document: {
    getElementById: (id) => element(id),
    querySelectorAll: () => [],
    createElement: () => ({ click() {}, style: {} }),
  },
  alert: (msg) => alerts.push(String(msg)),
};
vm.createContext(context);
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatch, 'index.html carries an inline script');
vm.runInContext(scriptMatch[1], context);
const run = (expr) => vm.runInContext(expr, context);

// --- (c) Token generation and parsing round-trip ---
const token = run("genToken({type:'credential', name:'AWS Cert', payload:'cred-123'}, 24)");
ok('token is a base64 string', /^[A-Za-z0-9+/=]+$/.test(token));
context.__token = token;
const payload = run('parseToken(__token)');
ok('parseToken recovers the payload', !!payload);
ok('payload data survives the round-trip',
  payload.data.type === 'credential' && payload.data.name === 'AWS Cert' &&
  payload.data.payload === 'cred-123');
ok('expiry is created + 24h (within clock tick)',
  Math.abs((payload.expiry - payload.created) - 24 * 3600000) <= 1000);
ok('payload carries a non-empty nonce',
  typeof payload.nonce === 'string' && payload.nonce.length > 0);
const payload2 = run("parseToken(genToken({type:'credential', name:'AWS Cert', payload:'cred-123'}, 24))");
ok('each token gets its own nonce', payload2.nonce !== payload.nonce);
ok('a 1-hour token expires 1h after creation',
  Math.abs(((p) => p.expiry - p.created)(run("parseToken(genToken('x', 1))")) - 3600000) <= 1000);

// --- (d) Malformed tokens parse to null, never throw ---
ok('garbage token parses to null', run("parseToken('!!!not-a-token!!!')") === null);
context.__notJson = Buffer.from('not json', 'binary').toString('base64');
ok('base64 of non-JSON parses to null', run('parseToken(__notJson)') === null);

// --- (e) Creating a link builds the verify URL and stores the link ---
element('linkType').value = 'credential';
element('linkName').value = 'AWS Solutions Architect';
element('linkData').value = '{"cert":"aws-sa-2026"}';
element('linkExpiry').value = '24';
run('createLink()');
const generated = element('generatedLink').textContent;
ok('generated link is a checkinfo.me verify URL',
  generated.startsWith('https://checkinfo.me/verify?t='));
let links = run('links');
ok('one link stored after create', links.length === 1);
ok('stored link matches the form',
  links[0].name === 'AWS Solutions Architect' && links[0].type === 'credential');
ok('stored expiry is ~24h after stored creation',
  Math.abs((links[0].expiry - links[0].created) - 24 * 3600000) <= 1000);
context.__storedToken = links[0].token;
ok('the URL token parses back to the same data',
  run('parseToken(__storedToken)').data.payload === '{"cert":"aws-sa-2026"}');
ok('links persisted to localStorage',
  JSON.parse(store.get('checkverify_links')).length === 1);
ok('counts rendered: 1 link, 1 valid',
  element('linkCount').textContent === 1 && element('validCount').textContent === 1);
ok('creation was announced', alerts.some((a) => a.includes('Link generated')));

// --- (f) Verification verdicts: valid, expired, invalid ---
element('verifyInput').value = generated;
run('verifyLink()');
ok('a fresh link verifies VALID', element('verifyResult').innerHTML.includes('VALID'));
ok('the result shows the link name',
  element('verifyResult').innerHTML.includes('AWS Solutions Architect'));

context.__expired = run("genToken({type:'credential', name:'Old', payload:'x'}, -1)");
element('verifyInput').value = run('__expired');
run('verifyLink()');
ok('a past-expiry token verifies EXPIRED',
  element('verifyResult').innerHTML.includes('EXPIRED'));

element('verifyInput').value = 'totally-bogus-token';
run('verifyLink()');
ok('a malformed token reports Invalid token',
  element('verifyResult').innerHTML.includes('Invalid token'));

// Tokens are self-contained and unsigned by design (see README): a hand-built
// payload with a future expiry verifies. This assertion pins that documented
// property so a future signing change must update the test and the docs.
context.__forged = Buffer.from(JSON.stringify({
  data: { type: 'custom', name: 'Hand-built', payload: 'typed by hand' },
  created: Date.now(), expiry: Date.now() + 3600000, nonce: 'handmade',
}), 'binary').toString('base64');
element('verifyInput').value = run('__forged');
run('verifyLink()');
ok('a hand-built unsigned token with future expiry verifies (documented design)',
  element('verifyResult').innerHTML.includes('VALID'));

// --- (g) handshake.js: register / send / receive round-trip ---
global.localStorage = localStorageStub;
const Handshake = require(path.join(root, 'handshake.js'));
const a = new Handshake();
a.register('checkverify', { version: '1.0.0', capabilities: ['verify'] });
ok('handshake send to a named peer succeeds',
  a.send({ name: 'checkanchor' }, { action: 'verify', data: { token } }) === true);
const b = new Handshake();
b.register('checkanchor', { version: '1.0.0', capabilities: ['anchor'] });
const inbox = b.receive();
ok('handshake delivers the queued message to its addressee',
  inbox.length === 1 && inbox[0].message.action === 'verify' && inbox[0].from === 'checkverify');

console.log(`\nPASS — ${passed} assertions`);
