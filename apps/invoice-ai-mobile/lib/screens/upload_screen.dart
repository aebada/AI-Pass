import 'package:flutter/material.dart';
import '../api/invoice_ai_client.dart';
import '../auth/session.dart';

class UploadScreen extends StatefulWidget {
  const UploadScreen({super.key});

  @override
  State<UploadScreen> createState() => _UploadScreenState();
}

class _UploadScreenState extends State<UploadScreen> {
  final _client = InvoiceAIApiClient(token: DemoSession.token);
  String? _selectedFile;
  String? _result;
  bool _uploading = false;

  Future<void> _pickFile() async {
    // File picker stub — simulates selection until file_picker is wired
    setState(() {
      _selectedFile = 'sample-invoice-${DateTime.now().millisecondsSinceEpoch}.pdf';
      _result = null;
    });
  }

  Future<void> _upload() async {
    if (_selectedFile == null) return;
    setState(() {
      _uploading = true;
      _result = null;
    });
    try {
      final res = await _client.uploadInvoice(
        fileName: _selectedFile!,
        mimeType: 'application/pdf',
      );
      if (!mounted) return;
      setState(() {
        _result = 'Uploaded: ${res['invoiceId'] ?? res['id'] ?? 'success'}';
        _uploading = false;
      });
    } on InvoiceAIApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _result = 'Demo mode — upload simulated (${e.statusCode})';
        _uploading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _result = 'Demo mode — upload simulated offline';
        _uploading = false;
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
      appBar: AppBar(title: const Text('Upload invoice')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            InkWell(
              onTap: _pickFile,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 48),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade400, width: 2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Icon(Icons.cloud_upload, size: 48, color: Colors.grey.shade600),
                    const SizedBox(height: 12),
                    const Text('Tap to pick a file (stub)'),
                    if (_selectedFile != null) ...[
                      const SizedBox(height: 8),
                      Text(_selectedFile!, style: const TextStyle(fontWeight: FontWeight.w500)),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _selectedFile == null || _uploading ? null : _upload,
              child: _uploading
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('Upload to Invoice AI'),
            ),
            if (_result != null) ...[
              const SizedBox(height: 16),
              Text(_result!, textAlign: TextAlign.center),
            ],
            const Spacer(),
            Text(
              'Supported: PDF, PNG, JPG. Real file picker ships in Phase 3.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
