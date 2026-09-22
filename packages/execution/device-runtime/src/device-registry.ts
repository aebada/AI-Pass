import type { DeviceExecutionAdapter, DeviceType, RegisteredDevice } from './types.js';
import {
  createDesktopAdapter,
  createMobileAdapter,
  createWebAdapter,
  StubDeviceAdapter,
} from './adapters/index.js';

export class DeviceRegistry {
  private devices = new Map<string, RegisteredDevice>();
  private adapters = new Map<DeviceType, DeviceExecutionAdapter>();

  constructor() {
    this.registerAdapter(createWebAdapter());
    this.registerAdapter(createDesktopAdapter());
    this.registerAdapter(createMobileAdapter());
    this.registerAdapter(new StubDeviceAdapter('wearables_stub'));
    this.registerAdapter(new StubDeviceAdapter('iot_stub'));
    this.registerAdapter(new StubDeviceAdapter('enterprise'));
    this.registerAdapter(new StubDeviceAdapter('tablet'));
    this.registerAdapter(new StubDeviceAdapter('pwa'));
  }

  register(device: RegisteredDevice): void {
    this.devices.set(device.id, { ...device, lastSeenAt: new Date().toISOString() });
  }

  registerAdapter(adapter: DeviceExecutionAdapter): void {
    this.adapters.set(adapter.deviceType, adapter);
  }

  getAdapter(type: DeviceType): DeviceExecutionAdapter | undefined {
    return this.adapters.get(type);
  }

  list(): RegisteredDevice[] {
    return [...this.devices.values()];
  }

  heartbeat(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.lastSeenAt = new Date().toISOString();
      this.devices.set(deviceId, device);
    }
  }
}

export const defaultDeviceRegistry = new DeviceRegistry();
