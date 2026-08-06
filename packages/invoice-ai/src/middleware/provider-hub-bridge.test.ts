import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isProviderHubLive } from './provider-hub-live.js';

describe('Provider Hub live detection', () => {
  it('isProviderHubLive is false without env keys', () => {
    const prev = process.env.PROVIDER_HUB_LIVE;
    delete process.env.PROVIDER_HUB_LIVE;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    assert.equal(isProviderHubLive(), false);
    if (prev) process.env.PROVIDER_HUB_LIVE = prev;
  });

  it('isProviderHubLive is true when PROVIDER_HUB_LIVE=1', () => {
    const prev = process.env.PROVIDER_HUB_LIVE;
    process.env.PROVIDER_HUB_LIVE = '1';
    assert.equal(isProviderHubLive(), true);
    if (prev) process.env.PROVIDER_HUB_LIVE = prev;
    else delete process.env.PROVIDER_HUB_LIVE;
  });

  it('isProviderHubLive is true when OPENAI_API_KEY is set', () => {
    const prevLive = process.env.PROVIDER_HUB_LIVE;
    const prevKey = process.env.OPENAI_API_KEY;
    delete process.env.PROVIDER_HUB_LIVE;
    process.env.OPENAI_API_KEY = 'sk-test';
    assert.equal(isProviderHubLive(), true);
    if (prevLive) process.env.PROVIDER_HUB_LIVE = prevLive;
    else delete process.env.PROVIDER_HUB_LIVE;
    if (prevKey) process.env.OPENAI_API_KEY = prevKey;
    else delete process.env.OPENAI_API_KEY;
  });
});
