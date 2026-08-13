const http = require('http');


// crea un servidor HTTP que responde con "Hello from the server" a cualquier solicitud entrante
// el primer argumento es la función que se ejecuta cada vez que llega una solicitud al servidor
const server = http.createServer((request, response) => {
  console.log(`${request.method} ----- ${request.url}`);
  response.end('Hello from the server');
})

response.statusCode = 200;
response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.end('Hello from the server');
});

// inicia el puerto 3000 y muestra un mensaje en la consola indicando que el servidor está escuchando en http://localhost:3000
// el otro es el callback function que se ejecuta cuando el servidor está listo para recibir solicitudes
server.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});


//VITE COMANDO USABA `vite` levantaba un servidor de desarrollo para aplicaciones web modernas, mientras que `node server.js` ejecuta un servidor HTTP básico en Node.js.
// dependiendo de sus necesidades te da npm init y prende el vite un servidor para trabajar con aplicaciones web modernas, mientras que node server.js es más adecuado para crear un servidor HTTP básico en Node.js.

//sitiouno@WKS4111MMG:~/Documentos/Desarrollo de Back-end/actividad-1$ node server.js
//Server listening on http://localhost:3000
