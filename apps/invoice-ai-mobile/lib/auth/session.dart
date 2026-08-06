/// Demo session for Invoice AI mobile (Phase 2–3).
class DemoSession {
  DemoSession._();

  static String? _email;
  static String? _token;

  static bool get isLoggedIn => _email != null;

  static String get email => _email ?? 'demo@example.com';

  static String? get token => _token;

  static void signIn({required String email, String? token}) {
    _email = email;
    _token = token;
  }

  static void signOut() {
    _email = null;
    _token = null;
  }
}
