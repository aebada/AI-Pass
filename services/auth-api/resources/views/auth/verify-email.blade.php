@extends('auth.layout')

@section('title', 'Verify email — AI-Pass')
@section('heading', 'Verify your email')
@section('subtitle', 'Check your inbox for a verification link before continuing.')

@section('content')
  <form class="form" method="post" action="{{ route('verification.send') }}">
    @csrf
    <button class="submit-btn" type="submit">Resend verification email</button>
  </form>

  <p class="hint">
    <a href="{{ $callback }}">Continue to workspace</a>
    ·
    <form method="post" action="{{ route('auth.logout') }}" style="display:inline;">
      @csrf
      <button type="submit" style="background:none;border:none;color:#58a6ff;cursor:pointer;padding:0;font:inherit;">Sign out</button>
    </form>
  </p>
@endsection
