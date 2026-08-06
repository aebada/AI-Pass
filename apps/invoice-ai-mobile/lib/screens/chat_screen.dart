import 'package:flutter/material.dart';
import '../api/invoice_ai_client.dart';
import '../auth/session.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _client = InvoiceAIApiClient(token: DemoSession.token);
  final _controller = TextEditingController();
  final _messages = <({String role, String text})>[];
  bool _sending = false;

  static const _suggestions = [
    'How many invoices need approval?',
    'Show flagged invoices',
    'What is our monthly spend?',
  ];

  Future<void> _send([String? text]) async {
    final query = (text ?? _controller.text).trim();
    if (query.isEmpty || _sending) return;
    _controller.clear();
    setState(() {
      _messages.add((role: 'user', text: query));
      _sending = true;
    });
    try {
      final res = await _client.chat(query);
      final answer = '${res['answer'] ?? res['message'] ?? res}';
      if (!mounted) return;
      setState(() {
        _messages.add((role: 'assistant', text: answer));
        _sending = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _messages.add((
          role: 'assistant',
          text: _demoAnswer(query),
        ));
        _sending = false;
      });
    }
  }

  String _demoAnswer(String query) {
    final q = query.toLowerCase();
    if (q.contains('approval')) {
      return '3 invoices are awaiting approval in tenant_acme.';
    }
    if (q.contains('flag')) {
      return '1 invoice is flagged for fraud review (Rapid Logistics Ltd).';
    }
    if (q.contains('spend')) {
      return 'Approved spend this month is €48,200 across 12 invoices.';
    }
    return 'Demo assistant: I can help with approvals, spend, and compliance queries.';
  }

  @override
  void dispose() {
    _controller.dispose();
    _client.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Invoice AI Chat')),
      body: Column(
        children: [
          if (_messages.isEmpty)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _suggestions
                    .map((s) => ActionChip(label: Text(s), onPressed: () => _send(s)))
                    .toList(),
              ),
            ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, i) {
                final m = _messages[i];
                final isUser = m.role == 'user';
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
                    decoration: BoxDecoration(
                      color: isUser ? const Color(0xFF388BFD).withValues(alpha: 0.15) : Colors.grey.shade200,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(m.text),
                  ),
                );
              },
            ),
          ),
          if (_sending) const LinearProgressIndicator(minHeight: 2),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      decoration: const InputDecoration(
                        hintText: 'Ask about invoices…',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                      onSubmitted: (_) => _send(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(onPressed: _sending ? null : () => _send(), icon: const Icon(Icons.send)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
