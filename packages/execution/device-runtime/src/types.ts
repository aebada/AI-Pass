import { createId } from '@ai-pass/shared';
import type { ExecuteRequest, ExecuteResponse } from '@ai-pass/runtime-core';

export type DeviceType =
  | 'web'
  | 'flutter'
  | 'desktop'
  | 'tablet'
  | 'pwa'
  | 'wearables_stub'
  | 'iot_stub'
  | 'enterprise';

export type DeviceOS = 'macos' | 'windows' | 'linux' | 'ios' | 'android' | 'web' | 'unknown';

export interface DeviceCapabilities {
  camera: boolean;
  microphone: boolean;
  gps: boolean;
  bluetooth: boolean;
  nfc: boolean;
  biometrics: boolean;
  offline: boolean;
  pushNotifications: boolean;
}

export interface DevicePermissions {
  network: boolean;
  storage: boolean;
  notifications: boolean;
  location: boolean;
  camera: boolean;
  microphone: boolean;
}

export interface DeviceAuth {
  method: 'session' | 'oauth' | 'sso' | 'api_key' | 'device_token';
  authenticated: boolean;
  userId?: string;
}

export interface DeviceHardware {
  cpuCores?: number;
  memoryMb?: number;
  screenWidth?: number;
  screenHeight?: number;
  pixelRatio?: number;
}

export interface RegisteredDevice {
  id: string;
  name: string;
  type: DeviceType;
  os: DeviceOS;
  capabilities: DeviceCapabilities;
  permissions: DevicePermissions;
  auth: DeviceAuth;
  hardware: DeviceHardware;
  runtimeVersion: string;
  lastSeenAt: string;
  registeredAt: string;
}

/** Cross-platform execution adapter */
export interface DeviceExecutionAdapter {
  readonly deviceType: DeviceType;
  execute(request: ExecuteRequest): Promise<ExecuteResponse>;
  getDeviceInfo(): Partial<RegisteredDevice>;
}

export const DEFAULT_CAPABILITIES: Record<DeviceType, DeviceCapabilities> = {
  web: { camera: true, microphone: true, gps: false, bluetooth: false, nfc: false, biometrics: false, offline: false, pushNotifications: true },
  pwa: { camera: true, microphone: true, gps: true, bluetooth: false, nfc: false, biometrics: false, offline: true, pushNotifications: true },
  desktop: { camera: true, microphone: true, gps: false, bluetooth: true, nfc: false, biometrics: true, offline: true, pushNotifications: true },
  flutter: { camera: true, microphone: true, gps: true, bluetooth: true, nfc: true, biometrics: true, offline: true, pushNotifications: true },
  tablet: { camera: true, microphone: true, gps: true, bluetooth: true, nfc: false, biometrics: true, offline: true, pushNotifications: true },
  wearables_stub: { camera: false, microphone: true, gps: true, bluetooth: true, nfc: false, biometrics: false, offline: true, pushNotifications: true },
  iot_stub: { camera: false, microphone: false, gps: false, bluetooth: true, nfc: false, biometrics: false, offline: true, pushNotifications: false },
  enterprise: { camera: false, microphone: false, gps: false, bluetooth: false, nfc: false, biometrics: true, offline: true, pushNotifications: true },
};

export function createDeviceRegistration(
  partial: Pick<RegisteredDevice, 'name' | 'type' | 'os'> & Partial<RegisteredDevice>,
): RegisteredDevice {
  const now = new Date().toISOString();
  return {
    id: partial.id ?? `dev_${createId()}`,
    name: partial.name,
    type: partial.type,
    os: partial.os,
    capabilities: partial.capabilities ?? DEFAULT_CAPABILITIES[partial.type],
    permissions: partial.permissions ?? { network: true, storage: true, notifications: false, location: false, camera: false, microphone: false },
    auth: partial.auth ?? { method: 'session', authenticated: false },
    hardware: partial.hardware ?? {},
    runtimeVersion: partial.runtimeVersion ?? '0.1.0',
    lastSeenAt: now,
    registeredAt: now,
  };
}
