<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserActivity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Solo verificar para usuarios autenticados
        if (Auth::check()) {
            $user = Auth::user();
            
            // Verificar si el usuario está activo
            if (!$user->is_active) {
                Auth::logout();
                return response()->json([
                    'success' => false,
                    'message' => 'Cuenta desactivada'
                ], 403);
            }
            
            // Actualizar último acceso (máximo una vez por minuto para evitar sobrecarga)
            $lastActivityKey = 'user_activity_' . $user->id;
            $lastActivity = cache()->get($lastActivityKey);
            
            if (!$lastActivity || now()->diffInMinutes($lastActivity) >= 1) {
                $user->update(['last_login_at' => now()]);
                cache()->put($lastActivityKey, now(), 60); // Cache por 1 minuto
            }
        }

        return $next($request);
    }
}
