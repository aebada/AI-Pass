@extends('auth.layout')

@section('title', 'Forgot password — AI-Pass')
@section('heading', 'Reset your password')
@section('subtitle', 'We will email you a password reset link.')

@section('content')
  <form class="form" method="post" action="{{ route('password.email') }}">
    @csrf
    <label class="label">
      Email
      <input class="input" type="email" name="email" required autocomplete="email" value="{{ old('email') }}" />
    </label>
    <button class="submit-btn" type="submit">Send reset link</button>
  </form>

  <p class="hint">
    <a href="{{ route('auth.login') }}">Back to sign in</a>
  </p>
@endsection
