/// Fallback demo data when API is offline.
class DemoInvoice {
  const DemoInvoice({
    required this.id,
    required this.invoiceNumber,
    required this.vendorName,
    required this.amount,
    required this.status,
  });

  final String id;
  final String invoiceNumber;
  final String vendorName;
  final double amount;
  final String status;

  Map<String, dynamic> toJson() => {
        'id': id,
        'invoiceNumber': invoiceNumber,
        'vendorName': vendorName,
        'amount': amount,
        'status': status,
      };
}

const demoInvoices = [
  DemoInvoice(
    id: 'inv_001',
    invoiceNumber: 'INV-2026-0142',
    vendorName: 'Acme Supplies GmbH',
    amount: 4820.50,
    status: 'pending_approval',
  ),
  DemoInvoice(
    id: 'inv_002',
    invoiceNumber: 'INV-2026-0138',
    vendorName: 'CloudHost Pro',
    amount: 12800,
    status: 'approved',
  ),
  DemoInvoice(
    id: 'inv_003',
    invoiceNumber: 'INV-2026-0131',
    vendorName: 'Rapid Logistics Ltd',
    amount: 2340,
    status: 'flagged',
  ),
];

const demoDashboard = {
  'awaitingApproval': 3,
  'fraudAlerts': 1,
  'monthlySpend': 48200,
  'todayProcessed': 7,
};

const demoApprovals = [
  {
    'id': 'appr_001',
    'invoiceNumber': 'INV-2026-0142',
    'vendorName': 'Acme Supplies GmbH',
    'amount': 4820.50,
    'status': 'pending',
  },
  {
    'id': 'appr_002',
    'invoiceNumber': 'INV-2026-0135',
    'vendorName': 'MediCare Billing AG',
    'amount': 8900,
    'status': 'pending',
  },
];
