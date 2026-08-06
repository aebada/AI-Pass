import { createId } from '@ai-pass/shared';
import type {
  AccountAssignmentSuggestion,
  CashDiscountAlert,
  DeliveryNote,
  Invoice,
  PoInvoiceMatch,
  PurchaseOrder,
  Vendor,
} from '@ai-pass/shared/invoice-ai';

/** Comstruct-style procure-to-pay: PO + delivery note + invoice 3-way match */
export class ProcureToPayEngine {
  matchInvoice(
    invoice: Invoice,
    purchaseOrders: PurchaseOrder[],
    deliveryNotes: DeliveryNote[],
    _vendor?: Vendor,
  ): {
    poMatch?: PoInvoiceMatch;
    accountSuggestion: AccountAssignmentSuggestion;
    cashDiscount?: CashDiscountAlert;
  } {
    const po = purchaseOrders.find(
      (p) =>
        p.vendorId === invoice.vendorId ||
        p.poNumber === invoice.extractedFields.po_number?.value ||
        invoice.purchaseOrderId === p.id,
    );

    const deliveryNote = deliveryNotes.find(
      (d) =>
        d.purchaseOrderId === po?.id ||
        d.vendorId === invoice.vendorId ||
        invoice.deliveryNoteId === d.id,
    );

    let poMatch: PoInvoiceMatch | undefined;
    if (po) {
      const poTotal = po.totalAmount;
      const variance = Math.abs(invoice.amount - poTotal);
      const variancePercent = poTotal > 0 ? (variance / poTotal) * 100 : 0;
      const quantityMatch = deliveryNote
        ? deliveryNote.items.every((di) => {
            const poItem = po.items.find((pi) => pi.description.includes(di.description.slice(0, 8)));
            return !poItem || Math.abs(di.quantity - poItem.quantity) < 0.5;
          })
        : true;
      const priceMatch = variancePercent <= 2;
      const contractMatch = Boolean(po.contractRef);

      poMatch = {
        id: `match_${createId()}`,
        invoiceId: invoice.id,
        purchaseOrderId: po.id,
        deliveryNoteId: deliveryNote?.id,
        matched: quantityMatch && priceMatch && contractMatch,
        quantityMatch,
        priceMatch,
        contractMatch,
        varianceAmount: variance,
        variancePercent: Math.round(variancePercent * 100) / 100,
        message: quantityMatch && priceMatch
          ? `3-way match OK — PO ${po.poNumber}${deliveryNote ? `, delivery ${deliveryNote.deliveryNumber}` : ''}`
          : `Match variance: ${variancePercent.toFixed(1)}% — ${!quantityMatch ? 'quantity mismatch' : 'price mismatch'}`,
        checkedAt: new Date().toISOString(),
      };

      invoice.purchaseOrderId = po.id;
      if (deliveryNote) invoice.deliveryNoteId = deliveryNote.id;
      invoice.projectId = po.projectId;
    }

    const category = invoice.items[0]?.category ?? invoice.department ?? 'Operations';
    const accountMap: Record<string, string> = {
      IT: '4930',
      Healthcare: '4970',
      Insurance: '4985',
      Logistics: '4940',
      Operations: '4980',
      Concrete: '5200',
      Rebar: '5210',
    };
    const accountSuggestion: AccountAssignmentSuggestion = {
      id: `acct_${createId()}`,
      invoiceId: invoice.id,
      account: accountMap[category] ?? '4980',
      costCenter: invoice.projectId ?? 'CC-100',
      projectId: invoice.projectId,
      confidence: poMatch?.matched ? 0.96 : 0.82,
      reason: poMatch?.matched
        ? `AI suggestion from matched PO contract ${po?.contractRef ?? 'standard'}`
        : 'AI suggestion from material category and vendor history',
    };

    let cashDiscount: CashDiscountAlert | undefined;
    if (invoice.dueDate) {
      const deadline = new Date(invoice.uploadedAt);
      deadline.setDate(deadline.getDate() + 14);
      const daysRemaining = Math.ceil((deadline.getTime() - Date.now()) / 86400000);
      if (daysRemaining > 0) {
        const discountPercent = 2;
        cashDiscount = {
          id: `skonto_${createId()}`,
          invoiceId: invoice.id,
          discountPercent,
          discountAmount: Math.round(invoice.amount * (discountPercent / 100) * 100) / 100,
          deadline: deadline.toISOString().slice(0, 10),
          daysRemaining,
          status: daysRemaining <= 3 ? 'expiring_soon' : 'available',
        };
        invoice.cashDiscountDeadline = cashDiscount.deadline;
      }
    }

    return { poMatch, accountSuggestion, cashDiscount };
  }

  suggestAccountFromMatch(invoice: Invoice, po?: PurchaseOrder): AccountAssignmentSuggestion {
    return {
      id: `acct_${createId()}`,
      invoiceId: invoice.id,
      account: po?.items[0]?.materialCategory === 'concrete' ? '5200' : '4980',
      costCenter: po?.projectId ?? 'CC-100',
      projectId: po?.projectId,
      confidence: 0.9,
      reason: 'Matched to construction material category',
    };
  }
}
