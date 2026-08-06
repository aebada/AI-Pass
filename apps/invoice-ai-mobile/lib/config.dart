/// API configuration for Invoice AI mobile client.
const String apiBaseUrl = String.fromEnvironment(
  'INVOICE_AI_API_URL',
  defaultValue: 'http://localhost:8000/api/v1/invoice-ai',
);

const String defaultTenantId = 'tenant_acme';
