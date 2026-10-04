<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://aipass.space');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'method']);
  exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'json']);
  exit;
}

$name = trim((string)($data['name'] ?? ''));
$email = trim((string)($data['email'] ?? ''));
$org = trim((string)($data['organisation'] ?? ''));
if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $org === '') {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'fields']);
  exit;
}

$record = [
  'id' => bin2hex(random_bytes(8)),
  'name' => $name,
  'email' => $email,
  'organisation' => $org,
  'role' => substr((string)($data['role'] ?? ''), 0, 80),
  'interest' => substr((string)($data['interest'] ?? ''), 0, 160),
  'notes' => substr((string)($data['notes'] ?? ''), 0, 2000),
  'source' => substr((string)($data['source'] ?? 'web'), 0, 40),
  'createdAt' => gmdate('c'),
  'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
];

$dir = dirname(__DIR__) . '/data';
if (!is_dir($dir)) {
  @mkdir($dir, 0750, true);
}
@file_put_contents($dir . '/demo-leads.jsonl', json_encode($record, JSON_UNESCAPED_SLASHES) . PHP_EOL, FILE_APPEND | LOCK_EX);

$subject = 'AI-Pass demo request: ' . $org;
$body = "Name: {$name}\nEmail: {$email}\nOrganisation: {$org}\nRole: {$record['role']}\nInterest: {$record['interest']}\n\n{$record['notes']}\n";
@mail('hello@ai-pass.com', $subject, $body, 'From: noreply@aipass.space');
@mail('contact@ehopn.com', $subject, $body, 'From: noreply@aipass.space');

http_response_code(200);
echo json_encode(['ok' => true, 'id' => $record['id']]);
