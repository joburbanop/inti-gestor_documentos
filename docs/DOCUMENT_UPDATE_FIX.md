# Solución al Error 405 en Actualización de Documentos

## Problema Identificado

**Error**: `405 Method Not Allowed` al intentar editar un documento y cambiar el archivo.

**Causa Raíz**: El frontend estaba enviando FormData con método PUT, pero había múltiples problemas en la cadena de manejo de datos.

## Análisis del Problema

### 1. **Inconsistencia en el Manejo de FormData**
- **POST**: La función `apiRequest` manejaba FormData correctamente usando `api.upload()`
- **PUT/PATCH**: Usaba `api.put()` y `api.patch()` que esperan datos JSON, no FormData

### 2. **Controlador Legacy Incompleto**
- El controlador `DocumentoController` (legacy) no manejaba archivos en el método `update`
- Solo actualizaba campos de texto, ignorando archivos subidos

### 3. **ID Faltante en FormData**
- El componente `CreateForm` no incluía el ID del documento en el FormData durante la edición
- Esto causaba que el backend no pudiera identificar qué documento actualizar

## Soluciones Implementadas

### 1. **Corrección del Frontend** (`AuthContext.jsx`)

**Problema**: FormData no se manejaba correctamente en métodos PUT/PATCH.

**Solución**: Agregar manejo específico para FormData en métodos PUT/PATCH:

```javascript
} else if (upper === 'PUT') {
    if (body instanceof FormData) {
        // Para PUT con FormData, usar axios directamente con método PUT
        const token = localStorage.getItem('auth_token');
        const config = {
            method: 'PUT',
            url: `/api/v1${url}`,
            data: body,
            headers: {
                ...headers,
                'Authorization': token ? `Bearer ${token}` : '',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            signal
        };
        response = await axios(config);
    } else {
        response = await api.put(url, body ?? {}, { signal, headers });
    }
}
```

### 2. **Mejora del Controlador Legacy** (`DocumentoController.php`)

**Problema**: No manejaba archivos en actualizaciones.

**Solución**: Implementar manejo completo de archivos:

```php
// Si hay un nuevo archivo, manejarlo
if ($file) {
    // Eliminar archivo anterior
    if ($documento->ruta_archivo && Storage::disk('public')->exists($documento->ruta_archivo)) {
        Storage::disk('public')->delete($documento->ruta_archivo);
    }

    // Subir nuevo archivo
    $fileName = time() . '_' . $file->getClientOriginalName();
    $filePath = 'documentos/' . $fileName;
    
    Storage::disk('public')->put($filePath, file_get_contents($file));
    
    // Actualizar datos del archivo
    $data['nombre_archivo'] = $fileName;
    $data['nombre_original'] = $file->getClientOriginalName();
    $data['ruta_archivo'] = $filePath;
    $data['tipo_archivo'] = $file->getMimeType();
    $data['tamaño_archivo'] = $file->getSize();
    $data['extension'] = strtolower($file->getClientOriginalExtension());
}
```

### 3. **Corrección del Método HTTP** (`Documentos.jsx`)

**Problema**: Usaba `method: 'POST'` para actualizaciones con archivo.

**Solución**: Cambiar a `method: 'PUT'`:

```javascript
// Para edición con archivo, usar FormData con método PUT
res = await apiRequest(`/documents/${data.get('id')}`, {
    method: 'PUT',
    body: data
});
```

### 4. **Inclusión del ID en FormData** (`CreateForm.jsx`)

**Problema**: El ID del documento no se incluía en el FormData durante la edición.

**Solución**: Agregar el ID al FormData cuando esté disponible:

```javascript
// Agregar ID si está disponible en initialData (modo edición)
if (initialData && initialData.id) {
    formDataToSend.append('id', initialData.id);
    console.log(`✅ [CreateForm] ID agregado para edición: ${initialData.id}`);
}
```

### 5. **Sincronización de Estado** (`CreateForm.jsx`)

**Problema**: El formData no se sincronizaba correctamente con initialData.

**Solución**: Agregar useEffect para sincronización:

```javascript
// Sincronizar formData con initialData cuando cambie
useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
        setFormData(initialData);
        console.log('📁 [CreateForm] initialData actualizado:', initialData);
    }
}, [initialData]);
```

## Mejoras Adicionales

### 1. **Logging Mejorado**
- Agregado logging detallado en el controlador para debugging
- Información sobre método HTTP, URL, datos y archivos
- Logging en CreateForm para rastrear el flujo de datos

### 2. **Validación Mejorada**
- Validación de archivos (tamaño máximo 50MB)
- Validación de campos de proceso (tipo_proceso_id, proceso_general_id, proceso_interno_id)

### 3. **Manejo de Errores**
- Logging de errores con stack trace
- Respuestas de error más informativas

## Rutas de Prueba Agregadas

Se agregaron rutas de prueba para verificar que todos los métodos HTTP funcionan:

```php
Route::prefix('test')->group(function () {
    Route::get('/methods', function () { /* ... */ });
    Route::post('/methods', function () { /* ... */ });
    Route::put('/methods', function () { /* ... */ });
    Route::patch('/methods', function () { /* ... */ });
    Route::delete('/methods', function () { /* ... */ });
});
```

## Verificación de la Solución

### 1. **Pruebas de Métodos HTTP**
```bash
# Probar métodos HTTP básicos
curl -X GET http://localhost/api/test/methods
curl -X POST http://localhost/api/test/methods -d '{"test": "data"}'
curl -X PUT http://localhost/api/test/methods -d '{"test": "data"}'
curl -X PATCH http://localhost/api/test/methods -d '{"test": "data"}'
curl -X DELETE http://localhost/api/test/methods
```

### 2. **Pruebas de Actualización de Documentos**
- ✅ Actualizar documento sin cambiar archivo (JSON)
- ✅ Actualizar documento cambiando archivo (FormData)
- ✅ Actualizar documento cambiando solo metadatos (JSON)
- ✅ Verificar que el ID se incluye correctamente en FormData

## Flujo de Datos Corregido

### **Edición con Archivo Nuevo:**
1. `CreateForm` crea FormData con todos los campos + ID
2. `Documentos.jsx` recibe FormData y envía con método PUT
3. `AuthContext.jsx` detecta FormData y usa axios directamente
4. `DocumentController.php` recibe FormData con ID y archivo
5. Backend procesa archivo y actualiza documento

### **Edición sin Archivo:**
1. `CreateForm` envía objeto JSON con todos los campos + ID
2. `Documentos.jsx` recibe objeto y envía con método PUT
3. `AuthContext.jsx` usa api.put() para datos JSON
4. `DocumentController.php` recibe JSON y actualiza solo metadatos

## Beneficios de la Solución

### 1. **Consistencia**
- Manejo uniforme de FormData en todos los métodos HTTP
- Comportamiento predecible en el frontend
- Flujo de datos consistente entre creación y edición

### 2. **Robustez**
- Manejo completo de archivos en actualizaciones
- Validación mejorada de datos
- Sincronización correcta de estado

### 3. **Debugging**
- Logging detallado para identificar problemas
- Rutas de prueba para verificar funcionalidad
- Trazabilidad completa del flujo de datos

### 4. **Mantenibilidad**
- Código más claro y organizado
- Separación de responsabilidades
- Reutilización de componentes

## Conclusión

El problema del error 405 se solucionó identificando y corrigiendo múltiples puntos de falla en la cadena de manejo de datos:

1. **FormData se maneja correctamente** en todos los métodos HTTP
2. **Los archivos se procesan adecuadamente** en actualizaciones
3. **El ID se incluye correctamente** en el FormData durante la edición
4. **La validación es robusta** para todos los tipos de datos
5. **El logging es detallado** para facilitar el debugging futuro

La aplicación ahora maneja correctamente la actualización de documentos tanto con como sin cambio de archivo, proporcionando una experiencia de usuario fluida y confiable.
