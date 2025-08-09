<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleLargeUploads
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
        // Configurar límites de PHP dinámicamente
        if (function_exists('ini_set')) {
            ini_set('upload_max_filesize', '50M');
            ini_set('post_max_size', '50M');
            ini_set('max_execution_time', '300');
            ini_set('max_input_time', '300');
            ini_set('memory_limit', '256M');
        }

        // Verificar si la petición es para subir archivos
        if ($request->is('api/documentos') && $request->isMethod('POST')) {
            // Configurar headers para archivos grandes
            $response = $next($request);
            
            if ($response instanceof Response) {
                $response->headers->set('X-Upload-Limit', '50MB');
                $response->headers->set('X-Execution-Time', '300s');
            }
            
            return $response;
        }

        return $next($request);
    }
}
