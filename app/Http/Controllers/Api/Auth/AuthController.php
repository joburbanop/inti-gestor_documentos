<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Cache;

class AuthController extends Controller
{
    /**
     * Login optimizado para máxima velocidad
     */
    public function login(Request $request): JsonResponse
    {
        try {
            // Validación ultra rápida
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string|min:6'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Credenciales inválidas',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Autenticación con rate limiting y cache básico
            $credentials = $request->only('email', 'password');
            
            // Rate limit por email + IP (5/min) definido en AppServiceProvider
            if (\Illuminate\Support\Facades\RateLimiter::tooManyAttempts(
                'login:' . md5($credentials['email'] . '|' . $request->ip()), 5
            )) {
                $seconds = \Illuminate\Support\Facades\RateLimiter::availableIn(
                    'login:' . md5($credentials['email'] . '|' . $request->ip())
                );
                return response()->json([
                    'success' => false,
                    'message' => 'Demasiados intentos. Intenta de nuevo en '.$seconds.' segundos.'
                ], 429);
            }

            if (Auth::attempt($credentials)) {
                // Login exitoso - limpiar rate limiter
                \Illuminate\Support\Facades\RateLimiter::clear('login:'.md5($credentials['email'].'|'.$request->ip()));
                
                $user = Auth::user();
                
                // Verificar si el usuario está activo
                if (!$user->is_active) {
                    Auth::logout();
                    return response()->json([
                        'success' => false,
                        'message' => 'Cuenta desactivada'
                    ], 403);
                }

                // Rotación/expiración de tokens Sanctum: revocar tokens antiguos y emitir uno nuevo con expiración
                try { 
                    $user->tokens()->where('name', 'auth-token')->delete(); 
                } catch (\Throwable $e) {}
                
                $token = $user->createToken('auth-token', ['*'], now()->addHours(4))->plainTextToken; // Reducido de 7 días a 4 horas

                // Respuesta mínima para máxima velocidad
                return response()->json([
                    'success' => true,
                    'message' => 'Inicio de sesión exitoso',
                    'data' => [
                        'user' => [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'is_admin' => $user->isAdmin(),
                            'is_active' => $user->is_active,
                            'role' => [
                                'id' => $user->role->id,
                                'name' => $user->role->name,
                                'display_name' => $user->role->display_name,
                                                                'permissions' => is_array($user->role->permissions) ? 
                                    array_column($user->role->permissions, 'name') : 
                                    $user->role->permissions->pluck('name')->toArray()
                                
                            ]
                        ],
                        'token' => $token,
                        'token_type' => 'Bearer'
                    ]
                ], 200);

            } else {
                // Registrar intento fallido en rate limiter
                \Illuminate\Support\Facades\RateLimiter::hit(
                    'login:' . md5($credentials['email'] . '|' . $request->ip()), 60
                );
                
                return response()->json([
                    'success' => false,
                    'message' => 'Las credenciales proporcionadas no son correctas.'
                ], 401);
            }

        } catch (\Exception $e) {
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Obtener información del usuario autenticado
     */
    public function user(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // Cargar relaciones necesarias
            $user->load('role');

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role ? [
                            'id' => $user->role->id,
                            'name' => $user->role->name,
                            'display_name' => $user->role->display_name,
                            'permissions' => $user->role->permissions
                        ] : null,
                        'is_admin' => $user->isAdmin(),
                        'is_active' => $user->is_active,
                        'created_at' => $user->created_at,
                        'updated_at' => $user->updated_at
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Cerrar sesión del usuario
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if ($user) {
                // Revocar todos los tokens del usuario
                $user->tokens()->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Sesión cerrada exitosamente'
            ], 200);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Error al cerrar sesión'
            ], 500);
        }
    }

    /**
     * Verificar si el token es válido
     */
    public function verify(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token inválido'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'message' => 'Token válido'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token inválido'
            ], 401);
        }
    }
}
