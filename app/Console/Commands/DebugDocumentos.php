<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Documento;
use App\Models\Direccion;
use App\Models\ProcesoApoyo;

class DebugDocumentos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'debug:documentos {--direccion_id=} {--proceso_id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Debug documentos y sus relaciones';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 DEBUGGING DOCUMENTOS Y RELACIONES');
        $this->newLine();

        // Mostrar todas las direcciones
        $this->info('📋 DIRECCIONES:');
        $direcciones = Direccion::where('activo', true)->get();
        foreach ($direcciones as $direccion) {
            $this->line("  ID: {$direccion->id} | Nombre: {$direccion->nombre} | Código: {$direccion->codigo}");
        }
        $this->newLine();

        // Mostrar todos los procesos
        $this->info('📋 PROCESOS DE APOYO:');
        $procesos = ProcesoApoyo::where('activo', true)->with('direccion')->get();
        foreach ($procesos as $proceso) {
            $direccionNombre = $proceso->direccion ? $proceso->direccion->nombre : 'SIN DIRECCIÓN';
            $this->line("  ID: {$proceso->id} | Nombre: {$proceso->nombre} | Dirección: {$direccionNombre} (ID: {$proceso->direccion_id})");
        }
        $this->newLine();

        // Mostrar documentos por dirección
        $this->info('📄 DOCUMENTOS POR DIRECCIÓN:');
        foreach ($direcciones as $direccion) {
            $count = Documento::where('direccion_id', $direccion->id)->count();
            $this->line("  {$direccion->nombre}: {$count} documentos");
        }
        $this->newLine();

        // Mostrar documentos por proceso
        $this->info('📄 DOCUMENTOS POR PROCESO:');
        foreach ($procesos as $proceso) {
            $count = Documento::where('proceso_apoyo_id', $proceso->id)->count();
            $direccionNombre = $proceso->direccion ? $proceso->direccion->nombre : 'SIN DIRECCIÓN';
            $this->line("  {$proceso->nombre} (Dir: {$direccionNombre}): {$count} documentos");
        }
        $this->newLine();

        // Si se especifica dirección_id, mostrar documentos de esa dirección
        if ($direccionId = $this->option('direccion_id')) {
            $this->info("📄 DOCUMENTOS DE DIRECCIÓN ID: {$direccionId}");
            $documentos = Documento::where('direccion_id', $direccionId)
                ->with(['direccion', 'procesoApoyo'])
                ->get();
            
            if ($documentos->isEmpty()) {
                $this->warn("  No hay documentos para la dirección ID: {$direccionId}");
            } else {
                foreach ($documentos as $doc) {
                    $this->line("  ID: {$doc->id} | Título: {$doc->titulo} | Proceso: {$doc->procesoApoyo->nombre}");
                }
            }
            $this->newLine();
        }

        // Si se especifica proceso_id, mostrar documentos de ese proceso
        if ($procesoId = $this->option('proceso_id')) {
            $this->info("📄 DOCUMENTOS DE PROCESO ID: {$procesoId}");
            $documentos = Documento::where('proceso_apoyo_id', $procesoId)
                ->with(['direccion', 'procesoApoyo'])
                ->get();
            
            if ($documentos->isEmpty()) {
                $this->warn("  No hay documentos para el proceso ID: {$procesoId}");
            } else {
                foreach ($documentos as $doc) {
                    $this->line("  ID: {$doc->id} | Título: {$doc->titulo} | Dirección: {$doc->direccion->nombre}");
                }
            }
            $this->newLine();
        }

        // Mostrar total de documentos
        $totalDocumentos = Documento::count();
        $this->info("📊 TOTAL DE DOCUMENTOS: {$totalDocumentos}");

        // Mostrar documentos sin dirección o proceso
        $sinDireccion = Documento::whereNull('direccion_id')->count();
        $sinProceso = Documento::whereNull('proceso_apoyo_id')->count();
        
        if ($sinDireccion > 0) {
            $this->warn("⚠️  Documentos sin dirección: {$sinDireccion}");
        }
        if ($sinProceso > 0) {
            $this->warn("⚠️  Documentos sin proceso: {$sinProceso}");
        }

        $this->newLine();
        $this->info('✅ Debug completado');
    }
}
