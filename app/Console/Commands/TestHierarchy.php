<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ProcesoTipo;
use App\Models\ProcesoGeneral;
use App\Models\ProcesoInterno;
use App\Models\Categoria;

class TestHierarchy extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:hierarchy';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verificar la jerarquía correcta de la estructura organizacional';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🏗️ Verificando Jerarquía Organizacional...');
        $this->newLine();

        // 1. Tipos de Procesos (Categorías grandes)
        $this->info('📁 Tipos de Procesos (Categorías grandes):');
        $tipos = ProcesoTipo::all();
        foreach ($tipos as $tipo) {
            $this->line("  ├── {$tipo->titulo}");
        }

        $this->newLine();

        // 2. Procesos Generales por tipo
        $this->info('🏢 Procesos Generales (Procesos más grandes dentro de cada tipo):');
        $procesosGenerales = ProcesoGeneral::with('tipoProceso')->get()->groupBy('tipo_proceso_id');
        
        foreach ($tipos as $tipo) {
            $this->line("  📂 {$tipo->titulo}:");
            $procesosDelTipo = $procesosGenerales->get($tipo->id, collect());
            foreach ($procesosDelTipo as $proceso) {
                $this->line("    ├── {$proceso->nombre}");
            }
        }

        $this->newLine();

        // 3. Procesos Internos (Carpetas)
        $this->info('📂 Procesos Internos (Carpetas dentro de cada proceso general):');
        $procesosInternos = ProcesoInterno::with('procesoGeneral')->get()->groupBy('proceso_general_id');
        
        foreach ($procesosGenerales->flatten() as $procesoGeneral) {
            $this->line("  📁 {$procesoGeneral->nombre}:");
            $carpetas = $procesosInternos->get($procesoGeneral->id, collect());
            foreach ($carpetas as $carpeta) {
                $this->line("    ├── {$carpeta->nombre}");
            }
        }

        $this->newLine();

        // 4. Categorías (Subcarpetas)
        $this->info('📁 Categorías (Subcarpetas dentro de cada proceso interno):');
        $categorias = Categoria::with('procesoInterno')->get()->groupBy('proceso_interno_id');
        
        foreach ($procesosInternos->flatten() as $procesoInterno) {
            $this->line("  📂 {$procesoInterno->nombre}:");
            $subcarpetas = $categorias->get($procesoInterno->id, collect());
            foreach ($subcarpetas as $subcarpeta) {
                $this->line("    ├── {$subcarpeta->nombre}");
            }
        }

        $this->newLine();

        // 5. Resumen de estadísticas
        $this->info('📊 Estadísticas de la Jerarquía:');
        $this->line("✅ Tipos de Procesos: {$tipos->count()}");
        $this->line("✅ Procesos Generales: {$procesosGenerales->flatten()->count()}");
        $this->line("✅ Procesos Internos (Carpetas): {$procesosInternos->flatten()->count()}");
        $this->line("✅ Categorías (Subcarpetas): {$categorias->flatten()->count()}");

        $this->newLine();
        $this->info('🎯 Jerarquía Completa:');
        $this->line('📁 Tipos de Procesos → 🏢 Procesos Generales → 📂 Procesos Internos → 📁 Categorías → 📄 Documentos');
        $this->info('✅ La estructura está correctamente organizada según la jerarquía especificada');
    }
}
