const http = require('http');

const server = http.createServer((request, response) => {
  // Registra la petición entrante en la consola
  console.log(`${request.method} ----- ${request.url}`);

  const url = request.url;

  // 1. Ruta Raíz: /
  if (url === '/') {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return response.end('Bienvenido al servidor Node.js. - otras rutas disponibles: /health, /api/info');
  }

  // 2. Ruta de Salud: /health
  if (url === '/health') {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    const healthData = {
      status: 'ok',
      uptime: process.uptime()
    };
    
    return response.end(JSON.stringify(healthData));
  }

  // 3. Ruta de Información de la API: /api/info
  if (url === '/api/info') {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    const apiInfo = {
      name: 'Mi API Node.js',
      version: '1.0.0',
      author: 'sitiouno'
    };
    
    return response.end(JSON.stringify(apiInfo));
  }

  // 4. Cualquier otra ruta (Manejo de Error 404)
  // Si no coincidió con ningún 'if' anterior, cae aquí
  response.statusCode = 404;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const errorData = {
    error: '404 Not Found',
    message: 'La ruta solicitada no existe en el servidor'
  };
  
  response.end(JSON.stringify(errorData));
});

// Inicia el servidor en el puerto 3000
server.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});