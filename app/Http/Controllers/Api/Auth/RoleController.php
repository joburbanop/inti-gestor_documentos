<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RoleController extends Controller
{
    /**
     * Obtener lista de roles con estadísticas
     */
    public function index()
    {
        try {
            $roles = Role::withCount(['users'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $roles,
                'message' => 'Roles obtenidos exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener roles: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un rol específico
     */
    public function show($id)
    {
        try {
            $role = Role::with(['users'])->find($id);
            
            if (!$role) {
                return response()->json([
                    'success' => false,
                    'message' => 'Rol no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $role,
                'message' => 'Rol obtenido exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener rol: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear un nuevo rol
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:roles,name',
                'description' => 'nullable|string|max:500',
                'permissions' => 'nullable|array'
            ], [
                'name.required' => 'El nombre del rol es obligatorio',
                'name.max' => 'El nombre del rol no puede exceder 255 caracteres',
                'name.unique' => 'Ya existe un rol con este nombre',
                'description.max' => 'La descripción no puede exceder 500 caracteres',
                'permissions.array' => 'Los permisos deben ser un array'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $role = Role::create([
                'name' => $request->name,
                'description' => $request->description,
                'permissions' => $request->permissions ?? []
            ]);

            return response()->json([
                'success' => true,
                'data' => $role,
                'message' => 'Rol creado exitosamente'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear rol: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un rol existente
     */
    public function update(Request $request, $id)
    {
        try {
            $role = Role::find($id);
            
            if (!$role) {
                return response()->json([
                    'success' => false,
                    'message' => 'Rol no encontrado'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:roles,name,' . $id,
                'description' => 'nullable|string|max:500',
                'permissions' => 'nullable|array'
            ], [
                'name.required' => 'El nombre del rol es obligatorio',
                'name.max' => 'El nombre del rol no puede exceder 255 caracteres',
                'name.unique' => 'Ya existe un rol con este nombre',
                'description.max' => 'La descripción no puede exceder 500 caracteres',
                'permissions.array' => 'Los permisos deben ser un array'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // No permitir cambiar el nombre del rol admin
            if ($role->name === 'admin' && $request->name !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede cambiar el nombre del rol administrador'
                ], 422);
            }

            $role->update([
                'name' => $request->name,
                'description' => $request->description,
                'permissions' => $request->permissions ?? $role->permissions
            ]);

            return response()->json([
                'success' => true,
                'data' => $role,
                'message' => 'Rol actualizado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar rol: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un rol
     */
    public function destroy($id)
    {
        try {
            $role = Role::find($id);
            
            if (!$role) {
                return response()->json([
                    'success' => false,
                    'message' => 'Rol no encontrado'
                ], 404);
            }

            // No permitir eliminar el rol admin
            if ($role->name === 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el rol administrador'
                ], 422);
            }

            // Verificar si hay usuarios con este rol
            $userCount = User::where('role_id', $id)->count();
            if ($userCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "No se puede eliminar el rol porque tiene {$userCount} usuario(s) asignado(s)"
                ], 422);
            }

            $role->delete();

            return response()->json([
                'success' => true,
                'message' => 'Rol eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar rol: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener usuarios por rol
     */
    public function users($id)
    {
        try {
            $role = Role::find($id);
            
            if (!$role) {
                return response()->json([
                    'success' => false,
                    'message' => 'Rol no encontrado'
                ], 404);
            }

            $users = User::where('role_id', $id)
                ->select('id', 'name', 'email', 'is_active', 'last_login_at', 'created_at')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'role' => $role,
                    'users' => $users,
                    'total_users' => $users->count()
                ],
                'message' => 'Usuarios del rol obtenidos exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener usuarios del rol: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de roles
     */
    public function stats()
    {
        try {
            $stats = [
                'total_roles' => Role::count(),
                'roles_with_users' => Role::has('users')->count(),
                'roles_without_users' => Role::doesntHave('users')->count(),
                'users_by_role' => Role::withCount('users')
                    ->orderBy('users_count', 'desc')
                    ->get()
                    ->map(function($role) {
                        return [
                            'role_name' => $role->name,
                            'user_count' => $role->users_count,
                            'percentage' => Role::count() > 0 ? 
                                round(($role->users_count / User::count()) * 100, 1) : 0
                        ];
                    }),
                'most_used_role' => Role::withCount('users')
                    ->orderBy('users_count', 'desc')
                    ->first()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Estadísticas de roles obtenidas exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas de roles: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener permisos disponibles
     */
    public function permissions()
    {
        try {
            $permissions = [
                'users' => [
                    'view' => 'Ver usuarios',
                    'create' => 'Crear usuarios',
                    'edit' => 'Editar usuarios',
                    'delete' => 'Eliminar usuarios'
                ],
                'roles' => [
                    'view' => 'Ver roles',
                    'create' => 'Crear roles',
                    'edit' => 'Editar roles',
                    'delete' => 'Eliminar roles'
                ],
                'direcciones' => [
                    'view' => 'Ver direcciones',
                    'create' => 'Crear direcciones',
                    'edit' => 'Editar direcciones',
                    'delete' => 'Eliminar direcciones'
                ],
                'procesos' => [
                    'view' => 'Ver procesos de apoyo',
                    'create' => 'Crear procesos de apoyo',
                    'edit' => 'Editar procesos de apoyo',
                    'delete' => 'Eliminar procesos de apoyo'
                ],
                'documentos' => [
                    'view' => 'Ver documentos',
                    'create' => 'Crear documentos',
                    'edit' => 'Editar documentos',
                    'delete' => 'Eliminar documentos',
                    'download' => 'Descargar documentos'
                ],
                'system' => [
                    'admin' => 'Acceso completo al sistema',
                    'reports' => 'Ver reportes y estadísticas',
                    'settings' => 'Configurar sistema'
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $permissions,
                'message' => 'Permisos disponibles obtenidos exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener permisos: ' . $e->getMessage()
            ], 500);
        }
    }
} 