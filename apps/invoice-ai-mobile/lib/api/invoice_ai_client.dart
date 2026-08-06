import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';

class InvoiceAIApiClient {
  InvoiceAIApiClient({
    String? baseUrl,
    this.token,
    String? tenantId,
    http.Client? httpClient,
  })  : baseUrl = baseUrl ?? apiBaseUrl,
        tenantId = tenantId ?? defaultTenantId,
        _http = httpClient ?? http.Client();

  final String baseUrl;
  final String? token;
  final String tenantId;
  final http.Client _http;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'X-Tenant-Id': tenantId,
        if (token != null) 'Authorization': 'Bearer $token',
      };

  Future<Map<String, dynamic>> listInvoices() async {
    final response = await _http.get(
      Uri.parse('$baseUrl/invoices'),
      headers: _headers,
    );
    return _decode(response);
  }

  Future<Map<String, dynamic>> getDashboard() async {
    final response = await _http.get(
      Uri.parse('$baseUrl/dashboard'),
      headers: _headers,
    );
    return _decode(response);
  }

  Future<Map<String, dynamic>> uploadInvoice({
    required String fileName,
    required String mimeType,
    String? useCaseId,
  }) async {
    final response = await _http.post(
      Uri.parse('$baseUrl/invoices/upload'),
      headers: _headers,
      body: jsonEncode({
        'fileName': fileName,
        'mimeType': mimeType,
        if (useCaseId != null) 'useCaseId': useCaseId,
      }),
    );
    return _decode(response);
  }

  Future<Map<String, dynamic>> chat(String query) async {
    final response = await _http.post(
      Uri.parse('$baseUrl/chat'),
      headers: _headers,
      body: jsonEncode({'query': query}),
    );
    return _decode(response);
  }

  Future<Map<String, dynamic>> getAdminMetrics() async {
    final response = await _http.get(
      Uri.parse('$baseUrl/admin/metrics'),
      headers: _headers,
    );
    return _decode(response);
  }

  Future<Map<String, dynamic>> listApprovals() async {
    final response = await _http.get(
      Uri.parse('$baseUrl/approvals'),
      headers: _headers,
    );
    return _decode(response);
  }

  Map<String, dynamic> _decode(http.Response response) {
    if (response.statusCode >= 400) {
      throw InvoiceAIApiException(
        statusCode: response.statusCode,
        body: response.body,
      );
    }
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  void dispose() => _http.close();
}

class InvoiceAIApiException implements Exception {
  InvoiceAIApiException({required this.statusCode, required this.body});
  final int statusCode;
  final String body;

  @override
  String toString() => 'InvoiceAIApiException($statusCode): $body';
}
