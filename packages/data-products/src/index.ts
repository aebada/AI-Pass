export type {
  ContractStatus,
  DataContract,
  DataProduct,
  DataProductCatalogSnapshot,
  DataProductStatus,
  LineageStub,
  Owner,
  QualityDimension,
  QualityScore,
  Schema,
  SchemaField,
} from './types.js';

export { DEMO_PRODUCTS, createDemoCatalog } from './seed.js';

export {
  DATA_PRODUCTS_STORAGE_KEY,
  InMemoryDataProductRepository,
  LocalStorageDataProductRepository,
  getDataProductRepository,
  resetDataProductRepository,
  createProductId,
  createDraftProduct,
} from './catalog.js';
export type { DataProductRepository } from './catalog.js';
