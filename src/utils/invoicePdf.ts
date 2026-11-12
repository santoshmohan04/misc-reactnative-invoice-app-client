import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export type InvoiceDocumentData = {
  number: string;
  issued?: string | Date;
  due?: string | Date;
  currency: string;
  merchant: { name?: string; email?: string; phone?: string; address?: string };
  customer: { name?: string; email?: string; phone?: string; address?: string };
  lines: Array<{ name: string; quantity: number; price: number; subtotal: number }>;
  subtotal: number;
  discount: number;
  total: number;
  notes?: string;
};

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const formatDate = (value?: string | Date): string => {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toISOString().split('T')[0];
};

const money = (currency: string, value: number): string => `${escapeHtml(currency)}${Number(value || 0).toFixed(2)}`;

const partyBlock = (title: string, p: InvoiceDocumentData['customer']): string => `
  <div class="party">
    <div class="muted">${title}</div>
    <div class="strong">${escapeHtml(p.name)}</div>
    ${p.email ? `<div>${escapeHtml(p.email)}</div>` : ''}
    ${p.phone ? `<div>${escapeHtml(p.phone)}</div>` : ''}
    ${p.address ? `<div>${escapeHtml(p.address)}</div>` : ''}
  </div>`;

export const buildInvoiceHtml = (d: InvoiceDocumentData): string => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; font-size: 13px; padding: 24px; }
  h1 { margin: 0; font-size: 26px; }
  .muted { color: #64748b; font-size: 12px; margin-bottom: 2px; }
  .strong { font-weight: 700; }
  .header, .parties { display: flex; justify-content: space-between; margin-bottom: 24px; }
  .party { max-width: 48%; line-height: 1.5; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { text-align: left; background: #f1f5f9; padding: 8px; border-bottom: 1px solid #cbd5e1; }
  td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
  .num { text-align: right; }
  .totals { margin-left: auto; width: 260px; }
  .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
  .grand { font-weight: 700; font-size: 16px; border-top: 2px solid #0f172a; margin-top: 4px; padding-top: 8px; }
  .notes { margin-top: 24px; color: #475569; }
</style>
</head>
<body>
  <div class="header">
    <div><h1>INVOICE</h1><div class="muted">${escapeHtml(d.number)}</div></div>
    <div style="text-align:right">
      <div><span class="muted">Issued:</span> ${escapeHtml(formatDate(d.issued))}</div>
      <div><span class="muted">Due:</span> ${escapeHtml(formatDate(d.due))}</div>
    </div>
  </div>
  <div class="parties">
    ${partyBlock('From', d.merchant)}
    ${partyBlock('Bill to', d.customer)}
  </div>
  <table>
    <thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Subtotal</th></tr></thead>
    <tbody>
      ${d.lines
        .map(
          (l) => `<tr><td>${escapeHtml(l.name)}</td><td class="num">${escapeHtml(l.quantity)}</td>` +
            `<td class="num">${money(d.currency, l.price)}</td><td class="num">${money(d.currency, l.subtotal)}</td></tr>`,
        )
        .join('')}
    </tbody>
  </table>
  <div class="totals">
    <div><span>Subtotal</span><span>${money(d.currency, d.subtotal)}</span></div>
    <div><span>Discount</span><span>${money(d.currency, d.discount)}</span></div>
    <div class="grand"><span>Total</span><span>${money(d.currency, d.total)}</span></div>
  </div>
  ${d.notes ? `<div class="notes"><div class="muted">Notes</div>${escapeHtml(d.notes)}</div>` : ''}
</body>
</html>`;

const fileName = (number: string): string => `invoice-${number.replace(/[^\w-]+/g, '_')}.pdf`;

export const printInvoice = async (data: InvoiceDocumentData): Promise<void> => {
  const html = buildInvoiceHtml(data);

  if (Platform.OS === 'web') {
    // expo-print on web prints the current page, so render the invoice in a hidden iframe.
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc || !iframe.contentWindow) {
      iframe.remove();
      throw new Error('Print frame unavailable');
    }
    doc.open();
    doc.write(html);
    doc.close();
    const win = iframe.contentWindow;
    win.onafterprint = () => iframe.remove();
    setTimeout(() => {
      win.focus();
      win.print();
    }, 300);
    return;
  }

  await Print.printAsync({ html });
};

export const downloadInvoicePdf = async (data: InvoiceDocumentData): Promise<void> => {
  const html = buildInvoiceHtml(data);

  if (Platform.OS === 'web') {
    const { default: html2pdf } = await import('html2pdf.js');
    const container = document.createElement('div');
    container.innerHTML = html;
    await html2pdf()
      .set({
        filename: fileName(data.number),
        margin: 10,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(container)
      .save();
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: fileName(data.number) });
  }
};
