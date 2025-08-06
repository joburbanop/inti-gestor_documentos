<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'Intranet Inti') }}</title>
    
    <!-- Compiled Assets -->
    <link rel="stylesheet" href="{{ asset('build/assets/app-DcRgMfIo.css') }}">
    
    <!-- Preload fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div id="app"></div>
    
    <!-- Compiled JavaScript -->
    <script type="module" src="{{ asset('build/assets/app-FhAWNmQy.js') }}"></script>
</body>
</html> 