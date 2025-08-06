<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Iniciar sesión del usuario
     */
    public function login(Request $request): JsonResponse
    {
        try {
            // Validar datos de entrada
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|exists:users,email',
                'password' => 'required|string|min:6',
            ], [
                'email.required' => 'El correo electrónico es obligatorio.',
                'email.email' => 'El formato del correo electrónico no es válido.',
                'email.exists' => 'Las credenciales proporcionadas no son correctas.',
                'password.required' => 'La contraseña es obligatoria.',
                'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Intentar autenticación
            $credentials = $request->only('email', 'password');
            
            if (!Auth::attempt($credentials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Las credenciales proporcionadas no son correctas.'
                ], 401);
            }

            $user = Auth::user();

            // Verificar si el usuario está activo
            if (!$user->is_active) {
                Auth::logout();
                return response()->json([
                    'success' => false,
                    'message' => 'Tu cuenta ha sido desactivada. Contacta al administrador.'
                ], 403);
            }

            // Crear token de acceso
            $token = $user->createToken('auth-token')->plainTextToken;

            // Cargar relaciones necesarias
            $user->load('role');

            return response()->json([
                'success' => true,
                'message' => 'Inicio de sesión exitoso',
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
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer'
                ]
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Error en login: ' . $e->getMessage(), [
                'email' => $request->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor. Inténtalo de nuevo.'
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
            \Log::error('Error obteniendo usuario: ' . $e->getMessage());

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
            \Log::error('Error en logout: ' . $e->getMessage());

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
