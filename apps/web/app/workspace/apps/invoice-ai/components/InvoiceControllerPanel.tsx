'use client';

import { useCallback, useState } from 'react';
import type { InvoiceDetailResponse } from '@ai-pass/invoice-ai';
import { canPerform, type InvoiceAIRole } from '@ai-pass/invoice-ai';
import { useApp } from '../../../../components/premium/AppProviders';
import { useInvoiceAI } from './InvoiceAIProvider';
import {
  buildInvoiceRecommendations,
  canTakeControllerAction,
  isControllerReviewStatus,
} from './invoice-lifecycle-utils';
import { isControllerRole, resolveInvoiceUserRoles } from './resolve-user-roles';
import styles from '../invoice-ai.module.css';

function recommendationClass(tone: string): string {
  switch (tone) {
    case 'approve':
      return styles.recommendationApprove;
    case 'deny':
      return styles.recommendationDeny;
    case 'warn':
      return styles.recommendationWarn;
    default:
      return styles.recommendationInfo;
  }
}

export function InvoiceControllerPanel({ detail }: { detail: InvoiceDetailResponse }) {
  const { user } = useApp();
  const { approveInvoice, rejectInvoice } = useInvoiceAI();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [denyReason, setDenyReason] = useState('');
  const [approveComment, setApproveComment] = useState('');

  const roles = resolveInvoiceUserRoles(user);
  const isController = isControllerRole(roles);
  const canApprove = canPerform(roles, 'invoice.approve');
  const canReject = canPerform(roles, 'invoice.reject');
  const actionable = canTakeControllerAction(detail);
  const showReviewBadge = isControllerReviewStatus(detail.invoice.status);
  const recommendations = buildInvoiceRecommendations(detail);

  const handleApprove = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    try {
      await approveInvoice(detail.invoice.id, approveComment.trim() || 'Approved by controller');
      setMessage('Invoice approved and queued for ERP sync.');
      setApproveComment('');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setBusy(false);
    }
  }, [approveInvoice, approveComment, detail.invoice.id]);

  const handleDeny = useCallback(async () => {
    if (!denyReason.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      await rejectInvoice(detail.invoice.id, denyReason.trim());
      setMessage('Invoice denied.');
      setShowDenyModal(false);
      setDenyReason('');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Rejection failed');
    } finally {
      setBusy(false);
    }
  }, [rejectInvoice, denyReason, detail.invoice.id]);

  return (
    <>
      <section className={styles.controllerPanel}>
        <div className={styles.controllerHeader}>
          <div>
            <h3 className={styles.cardTitle}>Controller</h3>
            <p className={styles.controllerSub}>Review, approve, or deny this invoice</p>
          </div>
          <div className={styles.controllerBadges}>
            {showReviewBadge && (
              <span className={styles.controllerReviewBadge}>Controller review</span>
            )}
            {isController && (
              <span className={styles.roleBadge}>{formatPrimaryRole(roles)}</span>
            )}
          </div>
        </div>

        {(canApprove || canReject) && (
          <div className={styles.controllerActions}>
            {canApprove && (
              <button
                type="button"
                className={styles.btnApprove}
                disabled={busy || !actionable}
                onClick={handleApprove}
                title={actionable ? 'Approve invoice' : 'No pending approval for this invoice'}
              >
                Approve
              </button>
            )}
            {canReject && (
              <button
                type="button"
                className={styles.btnDeny}
                disabled={busy || !actionable}
                onClick={() => setShowDenyModal(true)}
                title={actionable ? 'Deny invoice' : 'No pending approval for this invoice'}
              >
                Deny
              </button>
            )}
            {!actionable && (detail.invoice.status === 'pending_approval' || detail.invoice.status === 'flagged') && (
              <span className={styles.controllerHint}>Awaiting approval routing</span>
            )}
          </div>
        )}

        {canApprove && actionable && (
          <label className={styles.field} style={{ marginTop: 12 }}>
            Approval comment (optional)
            <input
              type="text"
              value={approveComment}
              onChange={(e) => setApproveComment(e.target.value)}
              placeholder="e.g. Within budget — approved for payment"
              disabled={busy}
            />
          </label>
        )}

        {message && <p className={styles.bannerInfo}>{message}</p>}

        <div className={styles.recommendationsSection}>
          <h4 className={styles.recommendationsTitle}>Recommendations</h4>
          <div className={styles.recommendationsList}>
            {recommendations.map((rec) => (
              <article
                key={rec.id}
                className={`${styles.recommendationCard} ${recommendationClass(rec.tone)}`}
              >
                <p className={styles.recommendationTitle}>{rec.title}</p>
                <p className={styles.recommendationDetail}>{rec.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {showDenyModal && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={() => !busy && setShowDenyModal(false)}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-labelledby="deny-invoice-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="deny-invoice-title">Deny invoice</h2>
            <p className={styles.hint}>
              Provide a reason for rejecting {detail.invoice.invoiceNumber}. This will be recorded in
              the audit trail.
            </p>
            <label className={styles.field}>
              Reason
              <textarea
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                rows={3}
                placeholder="e.g. Fraud alert unresolved — vendor verification required"
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--ai-border)',
                  background: 'var(--ai-bg)',
                  color: 'var(--ai-text)',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </label>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                disabled={busy}
                onClick={() => setShowDenyModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnDeny}
                disabled={busy || !denyReason.trim()}
                onClick={handleDeny}
              >
                Deny invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function formatPrimaryRole(roles: InvoiceAIRole[]): string {
  const priority: InvoiceAIRole[] = [
    'platform_admin',
    'tenant_admin',
    'finance_manager',
    'approver',
    'accountant',
    'auditor',
    'viewer',
  ];
  const match = priority.find((role) => roles.includes(role));
  return match ? match.replace(/_/g, ' ') : 'controller';
}
