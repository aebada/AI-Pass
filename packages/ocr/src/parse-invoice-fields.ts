/** Parse amount strings like 1,234.56 or 1.234,56 */
function parseAmount(raw: string): number | undefined {
  const cleaned = raw.trim();
  if (!cleaned) return undefined;

  let normalized = cleaned;
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  if (hasComma && hasDot) {
    // 1,234.56 (US) vs 1.234,56 (EU)
    normalized =
      cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')
        ? cleaned.replace(/\./g, '').replace(',', '.')
        : cleaned.replace(/,/g, '');
  } else if (hasComma) {
    normalized = cleaned.replace(',', '.');
  }

  const amount = Number.parseFloat(normalized);
  return Number.isNaN(amount) ? undefined : amount;
}

/** Heuristic field extraction from Unlimited-OCR markdown/text output */
export function parseInvoiceFieldsFromText(
  rawText: string,
): Record<string, { value: unknown; confidence: number }> {
  const fields: Record<string, { value: unknown; confidence: number }> = {
    raw_text: { value: rawText.slice(0, 8000), confidence: 1 },
  };

  const invoiceNumber =
    rawText.match(/(?:invoice\s*(?:#|no\.?|number)?\s*[:#]?\s*)([A-Z0-9][A-Z0-9\-_/]{3,})/i)?.[1] ??
    rawText.match(/\b(INV[-_][A-Z0-9\-_/]{3,})\b/i)?.[1];
  if (invoiceNumber) {
    fields.invoice_number = { value: invoiceNumber, confidence: 0.82 };
  }

  const totalMatch =
    rawText.match(/(?:total|amount\s+due|grand\s+total|summe|gesamt)\s*[:.]?\s*(?:EUR|USD|CHF|€|\$)?\s*([\d.,]+)/i) ??
    rawText.match(/(?:EUR|USD|CHF|€|\$)\s*([\d.,]+)/i);
  if (totalMatch) {
    const amount = parseAmount(totalMatch[1]);
    if (amount !== undefined) {
      fields.total = { value: amount, confidence: 0.78 };
    }
  }

  const vendor =
    rawText.match(/(?:from|vendor|supplier|lieferant|rechnung\s+von)\s*[:.]?\s*([^\n]{3,80})/i)?.[1] ??
    rawText.split('\n').find((line) => line.trim().length > 3 && line.trim().length < 80);
  if (vendor) {
    fields.vendor = { value: vendor.trim(), confidence: 0.7 };
  }

  const dateMatch = rawText.match(
    /\b(\d{4}-\d{2}-\d{2}|\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\b/,
  );
  if (dateMatch) {
    fields.date = { value: dateMatch[1], confidence: 0.75 };
  }

  const currencyMatch = rawText.match(/\b(EUR|USD|CHF|GBP)\b/i);
  if (currencyMatch) {
    fields.currency = { value: currencyMatch[1].toUpperCase(), confidence: 0.85 };
  }

  return fields;
}
