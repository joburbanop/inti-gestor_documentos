<?php

return [
    'driver' => env('SCOUT_DRIVER', 'meilisearch'),

    'prefix' => env('SCOUT_PREFIX', ''),

    'queue' => env('SCOUT_QUEUE', false),

    'after_commit' => env('SCOUT_AFTER_COMMIT', true),

    'chunk' => [
        'searchable' => 500,
        'unsearchable' => 500,
    ],

    'soft_delete' => false,

    'identify' => env('SCOUT_IDENTIFY', false),

    'meilisearch' => [
        'host' => env('MEILISEARCH_HOST', 'http://127.0.0.1:7700'),
        'key' => env('MEILISEARCH_KEY', null),
        'index-settings' => [
            'documentos' => [
                'filterableAttributes' => [
                    'tipo', 'confidencialidad', 'direccion.id', 'direccion.nombre', 'proceso.id', 'proceso.nombre', 'etiquetas', 'created_at', 'tamaño_archivo', 'contador_descargas'
                ],
                'sortableAttributes' => [
                    'created_at', 'updated_at', 'titulo', 'contador_descargas', 'tamaño_archivo'
                ],
                'searchableAttributes' => [
                    'titulo', 'descripcion', 'nombre_original', 'etiquetas', 'tipo', 'confidencialidad', 'direccion.nombre', 'direccion.codigo', 'proceso.nombre', 'proceso.codigo'
                ],
            ],
        ],
    ],
];
