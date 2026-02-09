const fs = require('fs');
const { execSync } = require('child_process');

// Generar clave privada
try {
    console.log('Generando clave privada...');
    execSync('openssl genrsa -out key.pem 2048');

    console.log('Generando certificado autofirmado...');
    execSync('openssl req -new -x509 -key key.pem -out cert.pem -days 365 -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=localhost"');

    console.log('¡Certificados SSL generados correctamente!');
} catch (error) {
    console.error('Error generando certificados. Asegúrate de tener OpenSSL instalado o intenta usar mkcert.', error);
}
