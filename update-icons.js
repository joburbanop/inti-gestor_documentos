const fs = require('fs');

// Leer el archivo
let content = fs.readFileSync('resources/js/components/UserDashboard.jsx', 'utf8');

// Reemplazar emojis por iconos SVG
const replacements = [
    {
        from: '📁 Todos',
        to: `<svg style={{ width: '16px', height: '16px', marginRight: '6px' }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
                        </svg>
                        Todos`
    },
    {
        from: '📄 PDF',
        to: `<svg style={{ width: '16px', height: '16px', marginRight: '6px' }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                        PDF`
    },
    {
        from: '📝 Word',
        to: `<svg style={{ width: '16px', height: '16px', marginRight: '6px' }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10.5,14.5L12,13L13.5,14.5L15,13V17H13.5V15.5L12,17L10.5,15.5V17H9V13L10.5,14.5Z"/>
                        </svg>
                        Word`
    },
    {
        from: '📊 Excel',
        to: `<svg style={{ width: '16px', height: '16px', marginRight: '6px' }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,12V14H12V12H10M10,14V16H12V14H10M12,12V14H14V12H12M12,14V16H14V14H12Z"/>
                        </svg>
                        Excel`
    },
    {
        from: '🖼️ Imágenes',
        to: `<svg style={{ width: '16px', height: '16px', marginRight: '6px' }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
                        </svg>
                        Imágenes`
    }
];

// Aplicar todos los reemplazos
replacements.forEach(replacement => {
    content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
});

// Escribir el archivo actualizado
fs.writeFileSync('resources/js/components/UserDashboard.jsx', content);
console.log('✅ Iconos actualizados a SVG');
