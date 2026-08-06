import 'package:flutter/material.dart';
import '../api/invoice_ai_client.dart';
import '../auth/session.dart';
import '../models/demo_data.dart';
import 'auth_gate.dart';
import 'portfolio_screen.dart';
import 'upload_screen.dart';
import 'chat_screen.dart';
import 'approvals_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _client = InvoiceAIApiClient(token: DemoSession.token);
  Map<String, dynamic> _stats = demoDashboard;
  String _status = 'Loading…';
  bool _offline = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await _client.getDashboard();
      if (!mounted) return;
      setState(() {
        _stats = data;
        _status = 'API connected';
        _offline = false;
      });
    } on InvoiceAIApiException {
      if (!mounted) return;
      setState(() {
        _stats = demoDashboard;
        _status = 'Offline — demo data';
        _offline = true;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _stats = demoDashboard;
        _status = 'Offline — $e';
        _offline = true;
      });
    }
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
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _load,
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              DemoSession.signOut();
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute<void>(builder: (_) => const AuthGate()),
                (_) => false,
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Card(
              child: ListTile(
                leading: Icon(
                  _offline ? Icons.cloud_off : Icons.cloud_done,
                  color: _offline ? Colors.orange : Colors.green,
                ),
                title: Text(_status),
                subtitle: Text('Tenant: tenant_acme · ${DemoSession.email}'),
              ),
            ),
            const SizedBox(height: 16),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.4,
              children: [
                _StatCard(
                  label: 'Awaiting approval',
                  value: '${_stats['awaitingApproval'] ?? _stats['awaiting_approval'] ?? '—'}',
                ),
                _StatCard(
                  label: 'Fraud alerts',
                  value: '${_stats['fraudAlerts'] ?? _stats['fraud_alerts'] ?? '—'}',
                ),
                _StatCard(
                  label: 'Monthly spend',
                  value: '€${_stats['monthlySpend'] ?? _stats['monthly_spend'] ?? '—'}',
                ),
                _StatCard(
                  label: 'Processed today',
                  value: '${_stats['todayProcessed'] ?? _stats['today_processed'] ?? '—'}',
                ),
              ],
            ),
            const SizedBox(height: 24),
            Text('Quick actions', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ActionChip(
                  avatar: const Icon(Icons.upload_file, size: 18),
                  label: const Text('Upload'),
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute<void>(builder: (_) => const UploadScreen()),
                  ),
                ),
                ActionChip(
                  avatar: const Icon(Icons.folder_open, size: 18),
                  label: const Text('Portfolio'),
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute<void>(builder: (_) => const PortfolioScreen()),
                  ),
                ),
                ActionChip(
                  avatar: const Icon(Icons.chat, size: 18),
                  label: const Text('Chat'),
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute<void>(builder: (_) => const ChatScreen()),
                  ),
                ),
                ActionChip(
                  avatar: const Icon(Icons.check_circle_outline, size: 18),
                  label: const Text('Approvals'),
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute<void>(builder: (_) => const ApprovalsScreen()),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        onDestinationSelected: (i) {
          final routes = [
            null,
            const PortfolioScreen(),
            const UploadScreen(),
            const ChatScreen(),
            const ApprovalsScreen(),
          ];
          if (i == 0) return;
          Navigator.push(context, MaterialPageRoute<void>(builder: (_) => routes[i]!));
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.folder), label: 'Portfolio'),
          NavigationDestination(icon: Icon(Icons.upload), label: 'Upload'),
          NavigationDestination(icon: Icon(Icons.chat), label: 'Chat'),
          NavigationDestination(icon: Icon(Icons.approval), label: 'Approvals'),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(label, style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 8),
            Text(value, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}
