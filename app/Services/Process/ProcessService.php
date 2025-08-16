<?php

namespace App\Services\Process;

use App\Models\ProcesoTipo;
use App\Models\ProcesoGeneral;
use App\Models\ProcesoInterno;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProcessService
{
    /**
     * Obtener todos los tipos de procesos
     */
    public function getProcessTypes()
    {
        return Cache::remember('tipos_procesos', 3600, function () {
            return ProcesoTipo::orderBy('nombre')->get();
        });
    }

    /**
     * Obtener procesos generales por tipo
     */
    public function getGeneralProcessesByType($tipoId)
    {
        $cacheKey = "tipos_procesos_{$tipoId}_procesos_generales";
        
        return Cache::remember($cacheKey, 3600, function () use ($tipoId) {
            return ProcesoGeneral::where('tipo_proceso_id', $tipoId)
                ->orderBy('nombre')
                ->get();
        });
    }

    /**
     * Obtener procesos internos por proceso general
     */
    public function getInternalProcessesByGeneral($generalId)
    {
        $cacheKey = "proceso_general_{$generalId}";
        
        return Cache::remember($cacheKey, 3600, function () use ($generalId) {
            return ProcesoInterno::where('proceso_general_id', $generalId)
                ->orderBy('nombre')
                ->get();
        });
    }

    /**
     * Obtener procesos internos únicos (categorías universales)
     */
    public function getUniqueInternalProcesses()
    {
        return Cache::remember('procesos_internos_unicos', 3600, function () {
            return ProcesoInterno::select('nombre', 'descripcion', 'icono')
                ->groupBy('nombre', 'descripcion', 'icono')
                ->orderBy('nombre')
                ->get()
                ->map(function ($item, $index) {
                    $item->id = $index + 1; // Asignar ID para compatibilidad frontend
                    return $item;
                });
        });
    }

    /**
     * Crear nuevo tipo de proceso
     */
    public function createProcessType(array $data)
    {
        $processType = ProcesoTipo::create($data);
        
        Cache::forget('tipos_procesos');
        
        Log::info('✅ [ProcessService] Tipo de proceso creado:', [
            'id' => $processType->id,
            'nombre' => $processType->nombre
        ]);
        
        return $processType;
    }

    /**
     * Crear nuevo proceso general
     */
    public function createGeneralProcess(array $data)
    {
        $generalProcess = ProcesoGeneral::create($data);
        
        Cache::forget("tipos_procesos_{$data['tipo_proceso_id']}_procesos_generales");
        
        Log::info('✅ [ProcessService] Proceso general creado:', [
            'id' => $generalProcess->id,
            'nombre' => $generalProcess->nombre,
            'tipo_proceso_id' => $generalProcess->tipo_proceso_id
        ]);
        
        return $generalProcess;
    }

    /**
     * Crear nuevo proceso interno
     */
    public function createInternalProcess(array $data)
    {
        $internalProcess = ProcesoInterno::create($data);
        
        Cache::forget("proceso_general_{$data['proceso_general_id']}");
        Cache::forget('procesos_internos_unicos');
        
        Log::info('✅ [ProcessService] Proceso interno creado:', [
            'id' => $internalProcess->id,
            'nombre' => $internalProcess->nombre,
            'proceso_general_id' => $internalProcess->proceso_general_id
        ]);
        
        return $internalProcess;
    }

    /**
     * Validar jerarquía de procesos
     */
    public function validateHierarchy($tipoId, $generalId, $internalId)
    {
        // Verificar que el proceso interno pertenece al proceso general
        $procesoInterno = ProcesoInterno::find($internalId);
        if (!$procesoInterno || $procesoInterno->proceso_general_id != $generalId) {
            throw new \Exception('El proceso interno no pertenece al proceso general seleccionado');
        }

        // Verificar que el proceso general pertenece al tipo de proceso
        $procesoGeneral = ProcesoGeneral::find($generalId);
        if (!$procesoGeneral || $procesoGeneral->tipo_proceso_id != $tipoId) {
            throw new \Exception('El proceso general no pertenece al tipo de proceso seleccionado');
        }

        return true;
    }

    /**
     * Limpiar cache de procesos
     */
    public function clearProcessCache()
    {
        Cache::forget('tipos_procesos');
        Cache::forget('procesos_internos_unicos');
        
        // Limpiar cache de procesos generales por tipo
        $tipos = ProcesoTipo::all();
        foreach ($tipos as $tipo) {
            Cache::forget("tipos_procesos_{$tipo->id}_procesos_generales");
        }
        
        // Limpiar cache de procesos internos por general
        $generales = ProcesoGeneral::all();
        foreach ($generales as $general) {
            Cache::forget("proceso_general_{$general->id}");
        }
        
        Log::info('🧹 [ProcessService] Cache de procesos limpiado');
    }
}
