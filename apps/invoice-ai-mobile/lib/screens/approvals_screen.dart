import 'package:flutter/material.dart';
import '../api/invoice_ai_client.dart';
import '../auth/session.dart';
import '../models/demo_data.dart';

class ApprovalsScreen extends StatefulWidget {
  const ApprovalsScreen({super.key});

  @override
  State<ApprovalsScreen> createState() => _ApprovalsScreenState();
}

class _ApprovalsScreenState extends State<ApprovalsScreen> {
  final _client = InvoiceAIApiClient(token: DemoSession.token);
  List<Map<String, dynamic>> _items = List<Map<String, dynamic>>.from(demoApprovals);
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await _client.listApprovals();
      final items = data['approvals'] ?? data['data'] ?? data;
      if (items is List && items.isNotEmpty) {
        if (!mounted) return;
        setState(() {
          _items = items.cast<Map<String, dynamic>>();
          _loading = false;
        });
        return;
      }
    } catch (_) {
      // demo fallback
    }
    if (!mounted) return;
    setState(() {
      _items = List<Map<String, dynamic>>.from(demoApprovals);
      _loading = false;
    });
  }

  void _approve(int index) {
    setState(() {
      _items[index] = {..._items[index], 'status': 'approved'};
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Approved (demo — no API call)')),
    );
  }

  void _reject(int index) {
    setState(() {
      _items.removeAt(index);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Rejected (demo — no API call)')),
    );
  }

  @override
  void dispose() {
    _client.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Approvals'),
        actions: [IconButton(icon: const Icon(Icons.refresh), onPressed: _load)],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _items.isEmpty
              ? const Center(child: Text('No pending approvals'))
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _items.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, i) {
                    final item = _items[i];
                    final status = '${item['status']}';
                    if (status == 'approved') {
                      return Card(
                        color: Colors.green.shade50,
                        child: ListTile(
                          title: Text('${item['invoiceNumber']} — approved'),
                          subtitle: Text('${item['vendorName']}'),
                        ),
                      );
                    }
                    return Card(
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${item['invoiceNumber']}',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            Text('${item['vendorName']}'),
                            Text('€${item['amount']}'),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                FilledButton(
                                  onPressed: () => _approve(i),
                                  child: const Text('Approve'),
                                ),
                                const SizedBox(width: 8),
                                OutlinedButton(
                                  onPressed: () => _reject(i),
                                  child: const Text('Reject'),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
