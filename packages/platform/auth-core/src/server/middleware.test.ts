import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuth } from './auth.js';
import { requireOrganization, requirePermission } from './middleware.js';

vi.mock('./auth.js', () => ({
  getAuth: vi.fn(),
}));

function mockResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as Response;

  (res.status as unknown as ReturnType<typeof vi.fn>).mockReturnValue(res);

  return res;
}

describe('requireOrganization', () => {
  it('denies unauthenticated requests with 401', async () => {
    const req = {
      params: { organizationId: 'org-a' },
    } as unknown as Request;

    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    requireOrganization()(req, res, next);

    await Promise.resolve();

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('allows access when route organization matches active organization', async () => {
    const req = {
      params: { organizationId: 'org-a' },
      auth: {
        user: { id: 'user-1' },
        session: {},
        organizationId: 'org-a',
        role: 'admin',
      },
    } as unknown as Request;

    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    requireOrganization()(req, res, next);

    await Promise.resolve();

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('denies access to another organization with 403', async () => {
    const req = {
      params: { organizationId: 'org-b' },
      auth: {
        user: { id: 'user-1' },
        session: {},
        organizationId: 'org-a',
        role: 'admin',
      },
    } as unknown as Request;

    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    requireOrganization()(req, res, next);

    await Promise.resolve();

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('requirePermission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('denies unauthenticated requests with 401', async () => {
    const req = {} as Request;

    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    requirePermission({
      member: ['create'],
    })(req, res, next);

    await Promise.resolve();

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('denies authenticated user with no active organization', async () => {
    const req = {
      headers: {},
      auth: {
        user: { id: 'user-1' },
        session: {},
        organizationId: null,
        role: null,
      },
    } as unknown as Request;

    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    requirePermission({
      member: ['create'],
    })(req, res, next);

    await Promise.resolve();

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('allows OWNER when permission check succeeds', async () => {
    const hasPermission = vi.fn().mockResolvedValue({
      success: true,
    });

    vi.mocked(getAuth).mockReturnValue({
      api: {
        hasPermission,
      },
    } as any);

    const req = {
      headers: {},
      auth: {
        user: { id: 'owner-1' },
        session: {},
        organizationId: 'org-a',
        role: 'owner',
      },
    } as unknown as Request;

    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    requirePermission({
      member: ['create'],
    })(req, res, next);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(hasPermission).toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('allows ADMIN when permission check succeeds', async () => {
    const hasPermission = vi.fn().mockResolvedValue({
      success: true,
    });

    vi.mocked(getAuth).mockReturnValue({
      api: {
        hasPermission,
      },
    } as any);

    const req = {
      headers: {},
      auth: {
        user: { id: 'admin-1' },
        session: {},
        organizationId: 'org-a',
        role: 'admin',
      },
    } as unknown as Request;

    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    requirePermission({
      member: ['create'],
    })(req, res, next);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(hasPermission).toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('denies MEMBER when permission check fails', async () => {
    const hasPermission = vi.fn().mockResolvedValue({
      success: false,
    });

    vi.mocked(getAuth).mockReturnValue({
      api: {
        hasPermission,
      },
    } as any);

    const req = {
      headers: {},
      auth: {
        user: { id: 'member-1' },
        session: {},
        organizationId: 'org-a',
        role: 'member',
      },
    } as unknown as Request;

    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    requirePermission({
      member: ['create'],
    })(req, res, next);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(hasPermission).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
