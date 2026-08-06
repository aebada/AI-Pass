import 'package:flutter/material.dart';
import 'screens/auth_gate.dart';

void main() {
  runApp(const InvoiceAIApp());
}

class InvoiceAIApp extends StatelessWidget {
  const InvoiceAIApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Invoice AI',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF388BFD)),
        useMaterial3: true,
      ),
      home: const AuthGate(),
    );
  }
}
