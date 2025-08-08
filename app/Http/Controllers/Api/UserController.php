<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Obtener lista de usuarios con sus roles
     */
    public function index()
    {
        try {
            $users = User::with(['role'])
                ->select('id', 'name', 'email', 'role_id', 'is_active', 'last_login_at', 'created_at')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $users,
                'message' => 'Usuarios obtenidos exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener usuarios: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un usuario específico
     */
    public function show($id)
    {
        try {
            $user = User::with(['role'])->find($id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'Usuario obtenido exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear un nuevo usuario
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8|confirmed',
                'role_id' => 'required|exists:roles,id',
                'is_active' => 'boolean'
            ], [
                'name.required' => 'El nombre es obligatorio',
                'email.required' => 'El correo electrónico es obligatorio',
                'email.email' => 'El correo electrónico debe tener un formato válido',
                'email.unique' => 'Este correo electrónico ya está registrado',
                'password.required' => 'La contraseña es obligatoria',
                'password.min' => 'La contraseña debe tener al menos 8 caracteres',
                'password.confirmed' => 'Las contraseñas no coinciden',
                'role_id.required' => 'El rol es obligatorio',
                'role_id.exists' => 'El rol seleccionado no existe',
                'is_active.boolean' => 'El estado debe ser verdadero o falso'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role_id' => $request->role_id,
                'is_active' => $request->is_active ?? true
            ]);

            $user->load('role');

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'Usuario creado exitosamente'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un usuario existente
     */
    public function update(Request $request, $id)
    {
        try {
            $user = User::find($id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => [
                    'required',
                    'email',
                    Rule::unique('users')->ignore($id)
                ],
                'password' => 'nullable|string|min:8|confirmed',
                'role_id' => 'required|exists:roles,id',
                'is_active' => 'boolean'
            ], [
                'name.required' => 'El nombre es obligatorio',
                'email.required' => 'El correo electrónico es obligatorio',
                'email.email' => 'El correo electrónico debe tener un formato válido',
                'email.unique' => 'Este correo electrónico ya está registrado',
                'password.min' => 'La contraseña debe tener al menos 8 caracteres',
                'password.confirmed' => 'Las contraseñas no coinciden',
                'role_id.required' => 'El rol es obligatorio',
                'role_id.exists' => 'El rol seleccionado no existe',
                'is_active.boolean' => 'El estado debe ser verdadero o falso'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $userData = [
                'name' => $request->name,
                'email' => $request->email,
                'role_id' => $request->role_id,
                'is_active' => $request->is_active ?? $user->is_active
            ];

            // Solo actualizar contraseña si se proporciona
            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }

            $user->update($userData);
            $user->load('role');

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'Usuario actualizado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un usuario
     */
    public function destroy($id)
    {
        try {
            $user = User::find($id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            // No permitir eliminar el último administrador
            if ($user->role && $user->role->name === 'admin') {
                $adminCount = User::whereHas('role', function($query) {
                    $query->where('name', 'admin');
                })->count();

                if ($adminCount <= 1) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No se puede eliminar el último administrador del sistema'
                    ], 422);
                }
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Usuario eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar el estado activo/inactivo de un usuario
     */
    public function toggleStatus(Request $request, $id)
    {
        try {
            $user = User::find($id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            $newStatus = $request->input('is_active', !$user->is_active);
            
            // No permitir desactivar el último administrador
            if (!$newStatus && $user->role && $user->role->name === 'admin') {
                $activeAdminCount = User::whereHas('role', function($query) {
                    $query->where('name', 'admin');
                })->where('is_active', true)->count();

                if ($activeAdminCount <= 1) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No se puede desactivar el último administrador activo'
                    ], 422);
                }
            }

            $user->update(['is_active' => $newStatus]);

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'Estado del usuario actualizado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado del usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de usuarios
     */
    public function stats()
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'active_users' => User::where('is_active', true)->count(),
                'inactive_users' => User::where('is_active', false)->count(),
                'users_by_role' => User::with('role')
                    ->selectRaw('role_id, COUNT(*) as count')
                    ->groupBy('role_id')
                    ->get()
                    ->mapWithKeys(function($item) {
                        return [$item->role->name ?? 'Sin rol' => $item->count];
                    }),
                'recent_registrations' => User::with('role')
                    ->select('id', 'name', 'email', 'role_id', 'created_at')
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Estadísticas obtenidas exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }
} 