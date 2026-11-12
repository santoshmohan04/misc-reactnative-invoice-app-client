import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useGetCustomersQuery, useGetItemsQuery } from '@store/apis/dataApi';
import { useAuthUser } from '@store/hooks';
import { getCurrency } from '../../../utils/currencies.utils';
import { downloadInvoicePdf, printInvoice, type InvoiceDocumentData } from '../../../utils/invoicePdf';

const idOf = (v: any): string => (v && typeof v === 'object' ? String(v._id ?? v.id ?? '') : String(v ?? ''));

/**
 * Builds the printable invoice document from a saved invoice and exposes
 * print / PDF-download actions.
 */
export const useInvoiceExport = () => {
  const user = useAuthUser() as any;
  const { data: customers = [] } = useGetCustomersQuery();
  const { data: items = [] } = useGetItemsQuery();

  const buildData = useCallback(
    (invoice: any): InvoiceDocumentData => {
      const customer = invoice.customer && typeof invoice.customer === 'object'
        ? invoice.customer
        : customers.find((c: any) => idOf(c) === idOf(invoice.customer)) ?? {};

      const lines = (invoice.items ?? []).map((line: any) => {
        const quantity = Number(line.quantity ?? 0);
        const subtotal = Number(line.subtotal ?? 0);
        const catalogItem: any = typeof line.item === 'object' && line.item
          ? line.item
          : items.find((i: any) => idOf(i) === idOf(line.item));
        const price = Number(line.price ?? (quantity ? subtotal / quantity : 0));
        return { name: catalogItem?.name ?? line.description ?? 'Item', quantity, price, subtotal: subtotal || quantity * price };
      });

      return {
        number: String(invoice.number ?? ''),
        issued: invoice.issued,
        due: invoice.due,
        currency: getCurrency(user?.base_currency) ?? '',
        merchant: { name: user?.company || user?.name, email: user?.email, phone: user?.phone, address: user?.address },
        customer: { name: customer.name, email: customer.email, phone: customer.phone, address: customer.address },
        lines,
        subtotal: Number(invoice.subtotal ?? 0),
        discount: Number(invoice.discount ?? 0),
        total: Number(invoice.total ?? 0),
        notes: invoice.notes,
      };
    },
    [customers, items, user],
  );

  const run = useCallback(
    async (action: (d: InvoiceDocumentData) => Promise<void>, invoice: any, failure: string) => {
      try {
        await action(buildData(invoice));
      } catch (e) {
        Alert.alert('Error', failure);
      }
    },
    [buildData],
  );

  return {
    print: (invoice: any) => run(printInvoice, invoice, 'Failed to print the invoice.'),
    downloadPdf: (invoice: any) => run(downloadInvoicePdf, invoice, 'Failed to create the PDF.'),
  };
};
