import 'package:flutter/material.dart';
import '../api/invoice_ai_client.dart';
import '../auth/session.dart';
import '../models/demo_data.dart';

class PortfolioScreen extends StatefulWidget {
  const PortfolioScreen({super.key});

  @override
  State<PortfolioScreen> createState() => _PortfolioScreenState();
}

class _PortfolioScreenState extends State<PortfolioScreen> {
  final _client = InvoiceAIApiClient(token: DemoSession.token);
  List<DemoInvoice> _invoices = demoInvoices;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await _client.listInvoices();
      final items = data['invoices'] ?? data['data'] ?? data;
      if (items is List) {
        final parsed = items.map((raw) {
          final m = raw as Map<String, dynamic>;
          return DemoInvoice(
            id: '${m['id']}',
            invoiceNumber: '${m['invoiceNumber'] ?? m['invoice_number'] ?? m['id']}',
            vendorName: '${m['vendorName'] ?? m['vendor_name'] ?? 'Unknown'}',
            amount: (m['amount'] as num?)?.toDouble() ?? 0,
            status: '${m['status'] ?? 'unknown'}',
          );
        }).toList();
        if (!mounted) return;
        setState(() {
          _invoices = parsed;
          _loading = false;
        });
        return;
      }
    } catch (_) {
      // fall through to demo data
    }
    if (!mounted) return;
    setState(() {
      _invoices = demoInvoices;
      _loading = false;
    });
  }

  @override
  void dispose() {
    _client.dispose();
    super.dispose();
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'approved':
      case 'paid':
        return Colors.green;
      case 'flagged':
        return Colors.red;
      case 'pending_approval':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Portfolio'),
        actions: [IconButton(icon: const Icon(Icons.refresh), onPressed: _load)],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: _invoices.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, i) {
                  final inv = _invoices[i];
                  return Card(
                    child: ListTile(
                      title: Text(inv.invoiceNumber),
                      subtitle: Text(inv.vendorName),
                      trailing: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text('€${inv.amount.toStringAsFixed(2)}'),
                          Text(
                            inv.status.replaceAll('_', ' '),
                            style: TextStyle(fontSize: 11, color: _statusColor(inv.status)),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
    );
  }
}
