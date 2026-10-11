import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sendMeetingRequest } from '../src/components/bodhgaya/meeting-request';

function example() {
  const data = new FormData();
  data.set('naam', 'Example seeker'); data.set('phone', '+910000000000');
  data.set('email', 'example@example.com'); data.set('yatra', 'आत्म-विचार क्या है?');
  return data;
}
test('successful submission preserves Hindi and campaign attribution in the existing inbox', async () => {
  let calls = 0;
  const stub: typeof fetch = async (url, init) => {
    calls++;
    assert.equal(url, 'https://formspree.io/f/xqeogwza');
    assert.equal(init?.method, 'POST');
    const body = JSON.parse(String(init?.body));
    assert.equal(body.yatra, 'आत्म-विचार क्या है?');
    assert.equal(body._language, 'hi');
    assert.equal(body._source_url, 'https://www.nirvandham.in/bodhgaya-samvad?utm_campaign=seekers');
    assert.ok(init?.signal);
    return new Response('{"ok":true}', { status: 200 });
  };
  await sendMeetingRequest(example(), { language: 'hi', sourceUrl: 'https://www.nirvandham.in/bodhgaya-samvad?utm_campaign=seekers' }, stub);
  assert.equal(calls, 1);
});
test('validation and service errors reject instead of producing a false success', async () => {
  for (const status of [400, 422, 429, 500]) {
    const stub: typeof fetch = async () => new Response('{"error":"unavailable"}', { status });
    await assert.rejects(sendMeetingRequest(example(), { language: 'en', sourceUrl: 'test' }, stub), /rejected/);
  }
});
test('network failure propagates and leaves the submitted form data intact', async () => {
  const data = example();
  const stub: typeof fetch = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(sendMeetingRequest(data, { language: 'en', sourceUrl: 'test' }, stub), /Failed to fetch/);
  assert.equal(data.get('naam'), 'Example seeker');
  assert.equal(data.get('yatra'), 'आत्म-विचार क्या है?');
});
