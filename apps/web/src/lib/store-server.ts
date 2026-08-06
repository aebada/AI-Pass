import { getStorePlatform } from '@ai-pass/store-core';

export function getStore() {
  return getStorePlatform().store;
}
