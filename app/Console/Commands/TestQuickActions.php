<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ProcesoTipo;
use App\Models\ProcesoGeneral;
use App\Models\ProcesoInterno;
use App\Models\Categoria;
use App\Models\Documento;

class TestQuickActions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:quick-actions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Probar las acciones rápidas del dashboard';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧪 Probando Acciones Rápidas del Dashboard...');
        $this->newLine();

        // 1. Verificar Tipos de Procesos
        $this->info('📊 Verificando Tipos de Procesos:');
        $tiposProcesos = ProcesoTipo::activos()->ordenados()->get();
        
        $this->table(
            ['ID', 'Nombre', 'Título', 'Icono', 'Procesos Generales'],
            $tiposProcesos->map(function ($tipo) {
                $procesosCount = $tipo->procesosGenerales()->where('activo', true)->count();
                return [
                    $tipo->id,
                    $tipo->nombre,
                    $tipo->titulo,
                    $tipo->icono,
                    $procesosCount
                ];
            })->toArray()
        );

        // 2. Verificar Procesos Generales
        $this->info('🏢 Verificando Procesos Generales:');
        $procesosGenerales = ProcesoGeneral::activos()->with('tipoProceso')->get();
        
        $this->table(
            ['ID', 'Nombre', 'Tipo', 'Procesos Internos', 'Documentos'],
            $procesosGenerales->map(function ($proceso) {
                $procesosInternosCount = $proceso->procesosInternos()->where('activo', true)->count();
                $documentosCount = $proceso->documentos()->count();
                return [
                    $proceso->id,
                    $proceso->nombre,
                    $proceso->tipoProceso->nombre,
                    $procesosInternosCount,
                    $documentosCount
                ];
            })->toArray()
        );

        // 3. Verificar Procesos Internos
        $this->info('📁 Verificando Procesos Internos:');
        $procesosInternos = ProcesoInterno::activos()->with(['procesoGeneral.tipoProceso'])->get();
        
        $this->table(
            ['ID', 'Nombre', 'Proceso General', 'Tipo', 'Categorías', 'Documentos'],
            $procesosInternos->map(function ($proceso) {
                $categoriasCount = $proceso->categorias()->where('activo', true)->count();
                $documentosCount = $proceso->documentos()->count();
                return [
                    $proceso->id,
                    $proceso->nombre,
                    $proceso->procesoGeneral->nombre,
                    $proceso->procesoGeneral->tipoProceso->nombre,
                    $categoriasCount,
                    $documentosCount
                ];
            })->toArray()
        );

        // 4. Verificar Categorías
        $this->info('📂 Verificando Categorías:');
        $categorias = Categoria::activas()->with(['procesoInterno.procesoGeneral.tipoProceso'])->get();
        
        $this->table(
            ['ID', 'Nombre', 'Proceso Interno', 'Proceso General', 'Tipo', 'Documentos'],
            $categorias->map(function ($categoria) {
                $documentosCount = $categoria->documentos()->count();
                return [
                    $categoria->id,
                    $categoria->nombre,
                    $categoria->procesoInterno->nombre,
                    $categoria->procesoInterno->procesoGeneral->nombre,
                    $categoria->procesoInterno->procesoGeneral->tipoProceso->nombre,
                    $documentosCount
                ];
            })->toArray()
        );

        // 5. Simular respuesta de acciones rápidas
        $this->info('⚡ Simulando respuesta de Acciones Rápidas:');
        $accionesRapidas = $tiposProcesos->map(function ($tipo) {
            $procesosCount = $tipo->procesosGenerales()->where('activo', true)->count();
            $color = $this->getColorForTipo($tipo->nombre);
            
            return [
                'id' => $tipo->id,
                'titulo' => $tipo->titulo,
                'descripcion' => $tipo->descripcion,
                'icono' => $tipo->icono,
                'key' => $tipo->nombre,
                'total_procesos' => $procesosCount,
                'color' => $color,
                'url' => "/procesos?tipo={$tipo->nombre}"
            ];
        });

        $this->table(
            ['ID', 'Título', 'Key', 'Procesos', 'Color', 'URL'],
            $accionesRapidas->map(function ($accion) {
                return [
                    $accion['id'],
                    $accion['titulo'],
                    $accion['key'],
                    $accion['total_procesos'],
                    $accion['color'],
                    $accion['url']
                ];
            })->toArray()
        );

        // 6. Estadísticas generales
        $this->info('📈 Estadísticas Generales:');
        $stats = [
            ['Métrica', 'Valor'],
            ['Total Documentos', Documento::count()],
            ['Total Procesos Generales', ProcesoGeneral::activos()->count()],
            ['Total Procesos Internos', ProcesoInterno::activos()->count()],
            ['Total Categorías', Categoria::activas()->count()],
            ['Total Tipos de Procesos', ProcesoTipo::activos()->count()]
        ];
        
        $this->table($stats[0], array_slice($stats, 1));

        $this->newLine();
        $this->info('✅ Prueba de Acciones Rápidas completada exitosamente!');
        $this->info('🎯 Los datos están listos para ser consumidos por el frontend.');
    }

    /**
     * Obtener color para cada tipo de proceso
     */
    private function getColorForTipo(string $tipo): string
    {
        $colores = [
            'estrategico' => '#1E40AF', // Azul
            'misional' => '#059669',    // Verde
            'apoyo' => '#7C3AED',       // Púrpura
            'evaluacion' => '#DC2626'   // Rojo
        ];

        return $colores[$tipo] ?? '#6B7280';
    }
}
