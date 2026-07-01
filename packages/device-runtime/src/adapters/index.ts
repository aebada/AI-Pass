import { getExecutionEngine, type ExecuteRequest, type ExecuteResponse } from '@ai-pass/runtime-core';
import type { DeviceExecutionAdapter, DeviceType, RegisteredDevice } from '../types.js';
import { createDeviceRegistration } from '../types.js';

abstract class BaseDeviceAdapter implements DeviceExecutionAdapter {
  abstract readonly deviceType: DeviceType;

  constructor(protected device: RegisteredDevice) {}

  async execute(request: ExecuteRequest): Promise<ExecuteResponse> {
    const engine = getExecutionEngine();
    const response = await engine.execute(request);
    return response;
  }

  getDeviceInfo(): Partial<RegisteredDevice> {
    return {
      id: this.device.id,
      type: this.device.type,
      os: this.device.os,
      capabilities: this.device.capabilities,
      runtimeVersion: this.device.runtimeVersion,
    };
  }
}

export class WebDeviceAdapter extends BaseDeviceAdapter {
  readonly deviceType = 'web' as const;

  constructor() {
    super(createDeviceRegistration({ name: 'Web Browser', type: 'web', os: 'web' }));
  }
}

export class DesktopDeviceAdapter extends BaseDeviceAdapter {
  readonly deviceType = 'desktop' as const;

  constructor(os: RegisteredDevice['os'] = 'macos') {
    super(createDeviceRegistration({ name: 'Desktop Client', type: 'desktop', os }));
  }
}

export class MobileDeviceAdapter extends BaseDeviceAdapter {
  readonly deviceType = 'flutter' as const;

  constructor(os: 'ios' | 'android' = 'ios') {
    super(createDeviceRegistration({ name: 'Mobile App', type: 'flutter', os }));
  }
}

export class PwaDeviceAdapter extends BaseDeviceAdapter {
  readonly deviceType = 'pwa' as const;

  constructor() {
    super(createDeviceRegistration({ name: 'PWA', type: 'pwa', os: 'web' }));
  }
}

export class StubDeviceAdapter extends BaseDeviceAdapter {
  readonly deviceType: DeviceType;

  constructor(type: DeviceType) {
    super(createDeviceRegistration({ name: `${type} stub`, type, os: 'unknown' }));
    this.deviceType = type;
  }
}

export function createWebAdapter(): WebDeviceAdapter {
  return new WebDeviceAdapter();
}

export function createDesktopAdapter(os?: RegisteredDevice['os']): DesktopDeviceAdapter {
  return new DesktopDeviceAdapter(os);
}

export function createMobileAdapter(os?: 'ios' | 'android'): MobileDeviceAdapter {
  return new MobileDeviceAdapter(os);
}
