#!/bin/bash

# Configurar variables de entorno para PHP
export PHP_INI_SCAN_DIR="$(pwd)"
export PHP_INI_DIR="$(pwd)"

# Crear archivo php.ini temporal con configuraciones correctas
cat > php.ini << EOF
; Configuración para subida de archivos grandes
upload_max_filesize = 50M
post_max_size = 50M
max_execution_time = 300
max_input_time = 300
memory_limit = 256M
max_file_uploads = 20
EOF

# Iniciar servidor con configuración personalizada
php -c php.ini artisan serve --host=127.0.0.1 --port=8000

# Limpiar archivo temporal
rm php.ini
