import 'package:flutter/material.dart';
import '../auth/session.dart';
import 'dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, required this.onSignedIn});

  final VoidCallback onSignedIn;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController(text: 'demo@example.com');
  final _passwordController = TextEditingController(text: 'demo-user');
  bool _loading = false;

  Future<void> _signIn() async {
    setState(() => _loading = true);
    await Future<void>.delayed(const Duration(milliseconds: 400));
    DemoSession.signIn(
      email: _emailController.text.trim(),
      token: 'demo-token',
    );
    if (!mounted) return;
    setState(() => _loading = false);
    widget.onSignedIn();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              const Icon(Icons.receipt_long, size: 56, color: Color(0xFF388BFD)),
              const SizedBox(height: 16),
              Text(
                'Invoice AI',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'AI-PASS Financial Automation',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              TextField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                decoration: const InputDecoration(
                  labelText: 'Password (demo)',
                  border: OutlineInputBorder(),
                ),
                obscureText: true,
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: _loading ? null : _signIn,
                child: _loading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Sign in (demo)'),
              ),
              const SizedBox(height: 12),
              Text(
                'Use demo@example.com / demo-user',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey),
                textAlign: TextAlign.center,
              ),
              const Spacer(flex: 2),
            ],
          ),
        ),
      ),
    );
  }
}
