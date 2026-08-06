@extends('auth.layout')

@section('title', 'Reset password — AI-Pass')
@section('heading', 'Choose a new password')

@section('content')
  <form class="form" method="post" action="{{ route('password.update') }}">
    @csrf
    <input type="hidden" name="token" value="{{ $token }}" />
    <label class="label">
      Email
      <input class="input" type="email" name="email" required autocomplete="email" value="{{ old('email', $email) }}" />
    </label>
    <label class="label">
      New password
      <input class="input" type="password" name="password" required autocomplete="new-password" minlength="8" />
    </label>
    <label class="label">
      Confirm password
      <input class="input" type="password" name="password_confirmation" required autocomplete="new-password" minlength="8" />
    </label>
    <button class="submit-btn" type="submit">Reset password</button>
  </form>
@endsection
