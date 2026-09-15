# Class 06 work log

## Environment

What did I configure?
Which command confirmed that it worked?

## Request flow

Where does the request enter?
Where is authentication checked?
Where is authorization checked?
Where is PostgreSQL accessed?

## Bug fixed

What was happening?
What should happen?
Which file did I modify?
Which test protects the behavior?

## Feature implemented

What does GET /requests/:id/history do?
Who can use it?
How is the result ordered?

## Test explained

Choose one test.
What data does it prepare?
What action does it perform?
What does it check?
Which rule does it protect?

## AI assistance

What did AI help me understand?
What code did it help produce?
What did I verify myself?
What suggestion was incorrect or incomplete?

## Remaining doubt

What part do I still not understand?


### siguiendo la ruta de src/app.js y siguiendo  los imports para verificar las rutas del script. 

<a href="https://html-css-js-course-wheat.vercel.app/lab-viewer.html?lab=materias%2Fdesarrollo-backend%2Fclases%2Fclass-06%2Fsesiones%2F07-explorar-proyecto%2Fresources%2Flabs%2Fmapa-recorrido%2Flab.json&back=https%3A%2F%2Fhtml-css-js-course-wheat.vercel.app%2Fviewer.html%3Fsection%3Dmaterias%252Fdesarrollo-backend%252Fclases%252Fclass-06%252Fsesiones%252F07-explorar-proyecto%26start%3D2" target="_blank">
  <button style="background-color: #0070f3; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">
    🚀 Abrir Lab - Clase 06
  </button>
</a>


----
app.js
entra la petición
recibi la info http y dirige 
→
authenticate
token → req.auth
quien es quien usa el bearer token 
→
routes → service
política + transición

en esta parte entra en los modules de las rutas y requets
entra req.params.id req body y auth
llama a pacht requests

valida los campos permitidos y cuales no entra el body crudo y sale changes limpio o error 400
→
store + history
sql transaccion