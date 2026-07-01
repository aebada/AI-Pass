import cors from 'cors';
import express, { type Express } from 'express';
import {
  handleHealth,
  handleModules,
  handleSearch,
  handleWorkspaceSummaryLegacy,
  handleProviders,
  handleWalletBalance,
  handleMarketplaceApps,
  handleAgents,
  handleWorkflows,
  handleTrustValidate,
  handleTrustCertify,
  handleTrustSystems,
  handleTrustReports,
  handleTrustVerification,
  handleTrustMonitoring,
  handleTrustDashboard,
  handleTrustTestSuite,
  PLATFORM_API_ROUTES,
} from '@ai-pass/platform-api';

const PORT = Number(process.env.PORT ?? 4000);

export function createApiServer(): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/v1/health', (_req, res) => res.json(handleHealth()));
  app.get('/api/v1/modules', (_req, res) => res.json(handleModules()));
  app.get('/api/v1/search', (req, res) => res.json(handleSearch(String(req.query.q ?? ''))));
  app.get('/api/v1/workspace/summary', (_req, res) => res.json(handleWorkspaceSummaryLegacy()));
  app.get('/api/v1/providers', (_req, res) => res.json(handleProviders()));
  app.get('/api/v1/wallet/balance', (_req, res) =>
    res.json(
      handleWalletBalance({
        remaining: 500,
        used: 0,
        total: 500,
        spendUsd: 0,
        budgetUsd: 0,
      }),
    ),
  );
  app.get('/api/v1/marketplace/apps', (_req, res) => res.json(handleMarketplaceApps()));
  app.get('/api/v1/agents', (_req, res) => res.json(handleAgents()));
  app.get('/api/v1/workflows', (_req, res) => res.json(handleWorkflows()));

  app.post('/api/v1/trust/validate', (req, res) => res.json(handleTrustValidate(req.body)));
  app.post('/api/v1/trust/certify', (req, res) => res.json(handleTrustCertify(req.body)));
  app.get('/api/v1/trust/systems', (_req, res) => res.json(handleTrustSystems()));
  app.get('/api/v1/trust/reports', (req, res) => res.json(handleTrustReports(String(req.query.systemId ?? ''))));
  app.get('/api/v1/trust/verification/:id', (req, res) => res.json(handleTrustVerification(req.params.id)));
  app.get('/api/v1/trust/monitoring', (req, res) => res.json(handleTrustMonitoring(String(req.query.systemId ?? ''))));
  app.get('/api/v1/trust/dashboard', (_req, res) => res.json(handleTrustDashboard()));
  app.post('/api/v1/trust/testsuite', (req, res) => res.json(handleTrustTestSuite(req.body)));

  app.get('/api/docs', (_req, res) => {
    res.json({
      openapi: '3.1.0',
      info: { title: 'AI Pass Platform API', version: 'v1' },
      paths: Object.fromEntries(
        PLATFORM_API_ROUTES.map((r) => [r.path.replace('/api/v1', ''), { [r.method.toLowerCase()]: { summary: r.summary } }]),
      ),
    });
  });

  return app;
}

export function startApiServer(port = PORT): Express {
  const app = createApiServer();
  app.listen(port, () => {
    console.log(`AI Pass API server listening on http://localhost:${port}`);
  });
  return app;
}
