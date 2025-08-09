<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class SecureFileAccess
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
        // Verificar si el usuario está autenticado
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado'
            ], 401);
        }

        // Obtener la ruta del archivo desde la URL
        $filePath = $request->path();
        
        // Remover 'storage' del inicio si está presente
        if (str_starts_with($filePath, 'storage/')) {
            $filePath = substr($filePath, 8); // Remover 'storage/'
        }

        // Verificar que el archivo existe
        if (!Storage::disk('public')->exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => 'Archivo no encontrado'
            ], 404);
        }

        // Obtener información del archivo
        $mimeType = Storage::disk('public')->mimeType($filePath);
        $size = Storage::disk('public')->size($filePath);

        // Verificar que es un archivo de documento (en la carpeta documentos)
        if (!str_starts_with($filePath, 'documentos/')) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado'
            ], 403);
        }

        // Devolver el archivo con headers apropiados
        $path = Storage::disk('public')->path($filePath);
        
        return response()->file($path, [
            'Content-Type' => $mimeType,
            'Content-Length' => $size,
            'Cache-Control' => 'private, max-age=300',
            'X-Frame-Options' => 'SAMEORIGIN'
        ]);
    }
}
