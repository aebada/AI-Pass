<?php

namespace App\Http\Middleware;

use App\Models\ScimToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateScimToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->header('Authorization', '');
        if (! preg_match('/^Bearer\s+(\S+)$/i', $header, $m)) {
            return response()->json([
                'schemas' => ['urn:ietf:params:scim:api:messages:2.0:Error'],
                'detail' => 'Authorization Bearer token required',
                'status' => '401',
            ], 401);
        }

        $plain = $m[1];
        $hash = ScimToken::hashToken($plain);

        $token = ScimToken::query()
            ->where('token_hash', $hash)
            ->where('enabled', true)
            ->first();

        if ($token === null) {
            return response()->json([
                'schemas' => ['urn:ietf:params:scim:api:messages:2.0:Error'],
                'detail' => 'Invalid SCIM token',
                'status' => '401',
            ], 401);
        }

        $request->attributes->set('scimToken', $token);

        return $next($request);
    }
}
