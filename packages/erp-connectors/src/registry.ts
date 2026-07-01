import type { ERPConnector } from './ERPConnector.js';
import { CustomERPAdapter } from './adapters/custom.js';
import { DATEVAdapter } from './adapters/datev.js';
import { DynamicsAdapter } from './adapters/dynamics.js';
import { OracleCloudAdapter } from './adapters/oracle-cloud.js';
import { QuickBooksAdapter } from './adapters/quickbooks.js';
import { SAPAdapter } from './adapters/sap.js';
import { XeroAdapter } from './adapters/xero.js';
import type { ERPProvider } from './types.js';

export type ERPAdapterFactory = () => ERPConnector;

const ADAPTER_FACTORIES: Record<ERPProvider, ERPAdapterFactory> = {
  sap: () => new SAPAdapter(),
  'oracle-cloud': () => new OracleCloudAdapter(),
  datev: () => new DATEVAdapter(),
  dynamics: () => new DynamicsAdapter(),
  quickbooks: () => new QuickBooksAdapter(),
  xero: () => new XeroAdapter(),
  custom: () => new CustomERPAdapter(),
};

export const ERP_PROVIDER_LABELS: Record<ERPProvider, string> = {
  sap: 'SAP S/4HANA / Business One',
  'oracle-cloud': 'Oracle Fusion Cloud ERP',
  datev: 'DATEV (German Accounting)',
  dynamics: 'Microsoft Dynamics 365 Finance',
  quickbooks: 'QuickBooks Online',
  xero: 'Xero',
  custom: 'Custom REST API',
};

export function listERPProviders(): ERPProvider[] {
  return Object.keys(ADAPTER_FACTORIES) as ERPProvider[];
}

export function createERPAdapter(provider: ERPProvider): ERPConnector {
  const factory = ADAPTER_FACTORIES[provider];
  if (!factory) {
    throw new Error(`Unknown ERP provider: ${provider}`);
  }
  return factory();
}

export function isERPProvider(value: string): value is ERPProvider {
  return value in ADAPTER_FACTORIES;
}
