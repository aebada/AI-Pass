'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getInvoiceAIService,
  resolveInvoiceAITenantId,
  shouldSeedDemoData,
  type FakeInvoiceDetection,
  type InvoiceAIService,
  type UploadInvoiceResponse,
} from '@ai-pass/invoice-ai';
import type { MembershipTier } from '@ai-pass/shared';
import type { InvoiceUseCase } from '@ai-pass/shared/invoice-ai';
import { useApp } from '../../../../components/premium/AppProviders';

function resolveTier(plan?: string): MembershipTier {
  if (plan === 'enterprise') return 'enterprise';
  if (plan === 'pro') return 'power';
  if (plan === 'free') return 'free';
  return 'professional';
}

export interface InvoiceUploadItemResult {
  fileName: string;
  success: boolean;
  data?: UploadInvoiceResponse;
  error?: string;
}

interface InvoiceAIContextValue {
  tenantId: string;
  service: InvoiceAIService;
  isDemoMode: boolean;
  version: number;
  activeUseCase: InvoiceUseCase;
  useCases: InvoiceUseCase[];
  supportedFormats: string[];
  setActiveUseCase: (id: string) => void;
  createCustomUseCase: (params: {
    name: string;
    description: string;
    industry: string;
    complianceFrameworks: string[];
  }) => InvoiceUseCase;
  installPack: (packId: string, packName: string, industry: string) => InvoiceUseCase;
  uploadInvoice: (file: File) => Promise<UploadInvoiceResponse>;
  uploadInvoices: (
    files: File[],
    callbacks?: {
      onItemStart?: (index: number) => void;
      onItemComplete?: (index: number, result: InvoiceUploadItemResult) => void;
    },
  ) => Promise<InvoiceUploadItemResult[]>;
  approveInvoice: (invoiceId: string, comment?: string) => Promise<void>;
  rejectInvoice: (invoiceId: string, reason: string) => Promise<void>;
  chat: (query: string) => Promise<string>;
  detectFakeInvoice: (invoiceId: string) => Promise<FakeInvoiceDetection>;
  refresh: () => void;
}

const InvoiceAIContext = createContext<InvoiceAIContextValue | null>(null);

export function InvoiceAIProvider({ children }: { children: ReactNode }) {
  const { user } = useApp();
  const [version, setVersion] = useState(0);

  const tenantId = useMemo(
    () => resolveInvoiceAITenantId(user),
    [user?.id, user?.workspace, user?.email],
  );

  const isDemoMode = useMemo(
    () => shouldSeedDemoData(tenantId, user?.email),
    [tenantId, user?.email],
  );

  const service = useMemo(
    () => getInvoiceAIService(tenantId, { email: user?.email }),
    [tenantId, user?.email],
  );

  useEffect(() => {
    return service.subscribe(() => setVersion((v) => v + 1));
  }, [service]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const tier = resolveTier(user?.plan);

  const value = useMemo<InvoiceAIContextValue>(
    () => ({
      tenantId,
      service,
      isDemoMode,
      version,
      activeUseCase: service.getActiveUseCase(),
      useCases: service.listUseCases(),
      supportedFormats: service.getSupportedFileFormats(),
      setActiveUseCase: (id) => {
        service.setActiveUseCase(id);
      },
      createCustomUseCase: (params) => service.createCustomUseCase(params),
      installPack: (packId, packName, industry) =>
        service.installAutomationPack(packId, packName, industry),
      uploadInvoice: async (file) =>
        service.upload({
          tenantId,
          userId: user?.id ?? 'anonymous',
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          tier,
        }),
      uploadInvoices: async (files, callbacks) => {
        const results: InvoiceUploadItemResult[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          callbacks?.onItemStart?.(i);
          let result: InvoiceUploadItemResult;
          try {
            const data = await service.upload({
              tenantId,
              userId: user?.id ?? 'anonymous',
              fileName: file.name,
              mimeType: file.type || 'application/octet-stream',
              tier,
            });
            result = { fileName: file.name, success: true, data };
          } catch (err) {
            result = {
              fileName: file.name,
              success: false,
              error: err instanceof Error ? err.message : 'Upload failed',
            };
          }
          results.push(result);
          callbacks?.onItemComplete?.(i, result);
        }
        return results;
      },
      approveInvoice: async (invoiceId, comment) => {
        await service.approve({
          invoiceId,
          tenantId,
          approverId: user?.id ?? 'anonymous',
          approverName: user?.name ?? 'Approver',
          comment,
        });
      },
      rejectInvoice: async (invoiceId, reason) => {
        await service.reject({
          invoiceId,
          tenantId,
          approverId: user?.id ?? 'anonymous',
          approverName: user?.name ?? 'Approver',
          reason,
        });
      },
      chat: async (query) => {
        const result = await service.chat({
          tenantId,
          userId: user?.id ?? 'anonymous',
          query,
          tier,
        });
        return result.answer;
      },
      detectFakeInvoice: async (invoiceId) => service.detectFakeInvoice(invoiceId),
      refresh,
    }),
    [tenantId, service, isDemoMode, version, user?.id, user?.name, user?.plan, tier, refresh],
  );

  return <InvoiceAIContext.Provider value={value}>{children}</InvoiceAIContext.Provider>;
}

export function useInvoiceAI(): InvoiceAIContextValue {
  const ctx = useContext(InvoiceAIContext);
  if (!ctx) throw new Error('useInvoiceAI must be used within InvoiceAIProvider');
  return ctx;
}
