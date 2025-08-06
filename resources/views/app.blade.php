<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'Intranet Inti') }}</title>
    
    <!-- Compiled Assets -->
    <link rel="stylesheet" href="{{ asset('build/assets/app-usG40wBd.css') }}">
    <link rel="stylesheet" href="{{ asset('build/assets/app-BvvCxTce.css') }}">
    
    <!-- Preload fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Estilos de respaldo para asegurar que se carguen -->
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        html, body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            color: #1f2937;
            line-height: 1.6;
        }
        
        #app {
            min-height: 100vh;
        }
        
        /* Asegurar que Tailwind se cargue */
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .space-x-4 > * + * { margin-left: 1rem; }
        .h-8 { height: 2rem; }
        .w-auto { width: auto; }
        .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
        .font-bold { font-weight: 700; }
    </style>
</head>
<body>
    <div id="app"></div>
    
    <!-- Compiled JavaScript -->
    <script type="module" src="{{ asset('build/assets/app-CQhdfgjE.js') }}"></script>
</body>
</html> 