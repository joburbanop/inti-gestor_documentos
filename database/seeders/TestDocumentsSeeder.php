<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Documento;
use App\Models\Direccion;
use App\Models\ProcesoApoyo;
use App\Models\User;
use Illuminate\Support\Str;

class TestDocumentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener datos existentes
        $direcciones = Direccion::where('activo', true)->get();
        $procesos = ProcesoApoyo::where('activo', true)->get();
        $users = User::all();

        if ($direcciones->isEmpty() || $procesos->isEmpty() || $users->isEmpty()) {
            $this->command->error('No hay direcciones, procesos o usuarios disponibles para crear documentos de prueba.');
            return;
        }

        $documentos = [
            // PDFs
            ['titulo' => 'Manual de Procedimientos 2024', 'nombre_archivo' => 'manual_procedimientos_2024.pdf', 'extension' => 'pdf'],
            ['titulo' => 'Reglamento Interno', 'nombre_archivo' => 'reglamento_interno.pdf', 'extension' => 'pdf'],
            ['titulo' => 'Política de Seguridad', 'nombre_archivo' => 'politica_seguridad.pdf', 'extension' => 'pdf'],
            ['titulo' => 'Guía de Usuario', 'nombre_archivo' => 'guia_usuario.pdf', 'extension' => 'pdf'],
            ['titulo' => 'Reporte Anual 2023', 'nombre_archivo' => 'reporte_anual_2023.pdf', 'extension' => 'pdf'],
            
            // Documentos Word
            ['titulo' => 'Acta de Reunión Comité', 'nombre_archivo' => 'acta_reunion_comite.docx', 'extension' => 'docx'],
            ['titulo' => 'Propuesta de Mejora', 'nombre_archivo' => 'propuesta_mejora.doc', 'extension' => 'doc'],
            ['titulo' => 'Plan de Trabajo Q1', 'nombre_archivo' => 'plan_trabajo_q1.docx', 'extension' => 'docx'],
            ['titulo' => 'Memorando Interno', 'nombre_archivo' => 'memorando_interno.doc', 'extension' => 'doc'],
            
            // Hojas de Cálculo
            ['titulo' => 'Presupuesto 2024', 'nombre_archivo' => 'presupuesto_2024.xlsx', 'extension' => 'xlsx'],
            ['titulo' => 'Control de Gastos', 'nombre_archivo' => 'control_gastos.xls', 'extension' => 'xls'],
            ['titulo' => 'Estadísticas Mensuales', 'nombre_archivo' => 'estadisticas_mensuales.csv', 'extension' => 'csv'],
            ['titulo' => 'Inventario de Activos', 'nombre_archivo' => 'inventario_activos.xlsx', 'extension' => 'xlsx'],
            
            // Presentaciones
            ['titulo' => 'Presentación Ejecutiva', 'nombre_archivo' => 'presentacion_ejecutiva.pptx', 'extension' => 'pptx'],
            ['titulo' => 'Capacitación Personal', 'nombre_archivo' => 'capacitacion_personal.ppt', 'extension' => 'ppt'],
            ['titulo' => 'Resultados Trimestrales', 'nombre_archivo' => 'resultados_trimestrales.pptx', 'extension' => 'pptx'],
            
            // Imágenes
            ['titulo' => 'Logo Corporativo', 'nombre_archivo' => 'logo_corporativo.png', 'extension' => 'png'],
            ['titulo' => 'Foto Equipo', 'nombre_archivo' => 'foto_equipo.jpg', 'extension' => 'jpg'],
            ['titulo' => 'Diagrama Organizacional', 'nombre_archivo' => 'diagrama_organizacional.svg', 'extension' => 'svg'],
            ['titulo' => 'Banner Evento', 'nombre_archivo' => 'banner_evento.gif', 'extension' => 'gif'],
            
            // Videos
            ['titulo' => 'Video Institucional', 'nombre_archivo' => 'video_institucional.mp4', 'extension' => 'mp4'],
            ['titulo' => 'Tutorial Sistema', 'nombre_archivo' => 'tutorial_sistema.avi', 'extension' => 'avi'],
            ['titulo' => 'Entrevista CEO', 'nombre_archivo' => 'entrevista_ceo.mov', 'extension' => 'mov'],
            
            // Audio
            ['titulo' => 'Podcast Mensual', 'nombre_archivo' => 'podcast_mensual.mp3', 'extension' => 'mp3'],
            ['titulo' => 'Entrevista Radio', 'nombre_archivo' => 'entrevista_radio.wav', 'extension' => 'wav'],
            
            // Archivos Comprimidos
            ['titulo' => 'Backup Datos', 'nombre_archivo' => 'backup_datos.zip', 'extension' => 'zip'],
            ['titulo' => 'Documentos Legales', 'nombre_archivo' => 'documentos_legales.rar', 'extension' => 'rar'],
            ['titulo' => 'Software Instalador', 'nombre_archivo' => 'software_instalador.7z', 'extension' => '7z'],
            
            // Texto
            ['titulo' => 'Notas de Reunión', 'nombre_archivo' => 'notas_reunion.txt', 'extension' => 'txt'],
            ['titulo' => 'Configuración Sistema', 'nombre_archivo' => 'configuracion_sistema.rtf', 'extension' => 'rtf'],
        ];

        $this->command->info('Creando documentos de prueba...');

        foreach ($documentos as $index => $doc) {
            $direccion = $direcciones->random();
            $proceso = $procesos->random();
            $user = $users->random();

            Documento::create([
                'titulo' => $doc['titulo'],
                'descripcion' => 'Documento de prueba para el filtro por extensión - ' . $doc['titulo'],
                'nombre_archivo' => $doc['nombre_archivo'],
                'nombre_original' => $doc['nombre_archivo'],
                'ruta_archivo' => 'documentos/test/' . $doc['nombre_archivo'],
                'tipo_archivo' => $this->getMimeType($doc['extension']),
                'extension' => $doc['extension'],
                'tamaño_archivo' => rand(1024, 10485760), // 1KB a 10MB
                'direccion_id' => $direccion->id,
                'proceso_apoyo_id' => $proceso->id,
                'subido_por' => $user->id,
                'slug' => Str::slug($doc['titulo']),
                'tipo' => 'interno',
                'etiquetas' => ['prueba', 'filtro', $doc['extension']],
                'fecha_documento' => now()->subDays(rand(1, 365)),
                'vigente_hasta' => now()->addDays(rand(30, 365)),
                'confidencialidad' => 'interno',
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now()->subDays(rand(1, 30)),
            ]);

            if (($index + 1) % 10 === 0) {
                $this->command->info("Creados " . ($index + 1) . " documentos...");
            }
        }

        $this->command->info('✅ Se crearon ' . count($documentos) . ' documentos de prueba exitosamente.');
        
        // Mostrar estadísticas
        $stats = Documento::selectRaw('extension, COUNT(*) as total')
                         ->groupBy('extension')
                         ->orderBy('total', 'desc')
                         ->get();
        
        $this->command->info('📊 Estadísticas por extensión:');
        foreach ($stats as $stat) {
            $this->command->info("   .{$stat->extension}: {$stat->total} documentos");
        }
    }

    private function getMimeType($extension): string
    {
        $mimeTypes = [
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'csv' => 'text/csv',
            'ppt' => 'application/vnd.ms-powerpoint',
            'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            'mp4' => 'video/mp4',
            'avi' => 'video/x-msvideo',
            'mov' => 'video/quicktime',
            'mp3' => 'audio/mpeg',
            'wav' => 'audio/wav',
            'zip' => 'application/zip',
            'rar' => 'application/x-rar-compressed',
            '7z' => 'application/x-7z-compressed',
            'txt' => 'text/plain',
            'rtf' => 'application/rtf',
        ];

        return $mimeTypes[$extension] ?? 'application/octet-stream';
    }
}
