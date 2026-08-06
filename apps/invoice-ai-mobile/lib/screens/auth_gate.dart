import 'package:flutter/material.dart';
import '../auth/session.dart';
import 'login_screen.dart';
import 'dashboard_screen.dart';

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  void _onSignedIn() => setState(() {});

  @override
  Widget build(BuildContext context) {
    if (DemoSession.isLoggedIn) {
      return const DashboardScreen();
    }
    return LoginScreen(onSignedIn: _onSignedIn);
  }
}
