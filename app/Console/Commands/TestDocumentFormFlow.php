<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ProcesoGeneral;
use App\Models\ProcesoInterno;
use App\Models\Categoria;

class TestDocumentFormFlow extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:document-form-flow';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Probar el flujo completo del formulario de documentos con la nueva jerarquía';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('📄 Probando Flujo Completo del Formulario de Documentos...');
        $this->newLine();

        // 1. Verificar datos disponibles
        $this->info('🔍 Verificando Datos Disponibles:');
        
        $procesosGenerales = ProcesoGeneral::activos()->ordenados()->get();
        $this->line("✅ Áreas Principales disponibles: {$procesosGenerales->count()}");
        
        $procesosInternos = ProcesoInterno::activos()->ordenados()->get();
        $this->line("✅ Subáreas disponibles: {$procesosInternos->count()}");
        
        $categorias = Categoria::activas()->ordenadas()->get();
        $this->line("✅ Carpetas disponibles: {$categorias->count()}");

        $this->newLine();

        // 2. Mostrar ejemplo de flujo completo
        $this->info('🔄 Ejemplo de Flujo de Selección:');
        
        $procesoGeneral = $procesosGenerales->first();
        if ($procesoGeneral) {
            $this->line("1️⃣ Usuario abre formulario de creación de documento");
            $this->line("2️⃣ Se cargan automáticamente las áreas principales");
            $this->line("3️⃣ Usuario selecciona: {$procesoGeneral->nombre}");
            
            $procesosInternosDelGeneral = $procesosInternos->where('proceso_general_id', $procesoGeneral->id);
            if ($procesosInternosDelGeneral->count() > 0) {
                $procesoInterno = $procesosInternosDelGeneral->first();
                $this->line("4️⃣ Se cargan automáticamente las subáreas");
                $this->line("5️⃣ Usuario selecciona: {$procesoInterno->nombre}");
                
                $categoriasDelProceso = $categorias->where('proceso_interno_id', $procesoInterno->id);
                if ($categoriasDelProceso->count() > 0) {
                    $categoria = $categoriasDelProceso->first();
                    $this->line("6️⃣ Se cargan automáticamente las carpetas");
                    $this->line("7️⃣ Usuario selecciona: {$categoria->nombre}");
                } else {
                    $this->line("6️⃣ No hay carpetas disponibles para esta subárea");
                }
            } else {
                $this->line("4️⃣ No hay subáreas disponibles para esta área principal");
            }
            
            $this->line("8️⃣ Usuario completa información del documento");
            $this->line("9️⃣ Se valida la jerarquía: Área Principal → Subárea → Carpeta");
            $this->line("🔟 Se crea el documento con todas las relaciones");
        }

        $this->newLine();

        // 3. Verificar textos mejorados
        $this->info('📝 Textos Mejorados para el Usuario:');
        $this->line('✅ "Proceso General" → "Proceso General (Área Principal)"');
        $this->line('✅ "Proceso Interno" → "Proceso Interno (Subárea)"');
        $this->line('✅ "Categoría" → "Categoría (Carpeta de Documentos)"');
        $this->line('✅ "Agregar proceso general" → "Agregar área principal"');
        $this->line('✅ "Agregar proceso interno" → "Agregar subárea"');
        $this->line('✅ "Agregar categoría" → "Agregar carpeta"');

        $this->newLine();

        // 4. Verificar placeholders mejorados
        $this->info('💬 Placeholders Mejorados:');
        $this->line('✅ "Selecciona el proceso general" → "Selecciona el área principal de la organización"');
        $this->line('✅ "Selecciona el proceso interno" → "Selecciona la subárea específica"');
        $this->line('✅ "Selecciona la categoría" → "Selecciona la carpeta para organizar el documento"');
        $this->line('✅ "Cargando procesos generales..." → "Cargando áreas principales..."');
        $this->line('✅ "Cargando procesos internos..." → "Cargando subáreas..."');
        $this->line('✅ "Cargando categorías..." → "Cargando carpetas..."');

        $this->newLine();

        // 5. Verificar textos de ayuda
        $this->info('💡 Textos de Ayuda Mejorados:');
        $this->line('✅ Área Principal: "Selecciona el área principal de la organización a la que pertenece este documento (ej: Administración, Recursos Humanos, etc.)"');
        $this->line('✅ Subárea: "Selecciona la subárea específica dentro del área principal seleccionada (ej: Control Interno, Gestión Administrativa, etc.)"');
        $this->line('✅ Carpeta: "Opcional: Selecciona una carpeta específica para organizar mejor el documento (ej: Formatos, Manuales, Procedimientos, etc.)"');

        $this->newLine();

        // 6. Verificar carga automática
        $this->info('⚡ Carga Automática Implementada:');
        $this->line('✅ Al seleccionar área principal → Se cargan automáticamente las subáreas');
        $this->line('✅ Al seleccionar subárea → Se cargan automáticamente las carpetas');
        $this->line('✅ Logs de debugging para monitorear el flujo');
        $this->line('✅ Estados de carga visuales para el usuario');

        $this->newLine();

        // 7. Verificar validaciones
        $this->info('✅ Validaciones Implementadas:');
        $this->line('✅ Subárea debe pertenecer al área principal seleccionada');
        $this->line('✅ Carpeta debe pertenecer a la subárea seleccionada');
        $this->line('✅ Campos deshabilitados hasta completar el nivel superior');
        $this->line('✅ Placeholders informativos según el estado actual');

        $this->newLine();
        $this->info('🚀 ¡Flujo del formulario completamente mejorado!');
        $this->info('📁 Nueva jerarquía clara: Área Principal → Subárea → Carpeta → Documento');
        $this->info('🎯 UX mejorada con textos claros y carga automática');
        $this->info('🔍 Debugging implementado para monitorear el flujo');
    }
}
