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


# 📋 Work-log · Recorrido de una petición

> **Consigna:** completa cada fila indicando el archivo (y la función, si aplica)
> donde ocurre cada responsabilidad. Rastrea una petición desde que entra hasta
> que se prueba — sin suponer: ve al código y cita la línea.

---

## 🗺️ Mapa de responsabilidades

| # | Pregunta | 📂 Archivo · función | 📍 Línea |
| --- | --- | --- | --- |
| 1 | 🚪 ¿Dónde entra la petición? |entra app.js y el import indica al middleware  tambien a auth rutas y a los modulos de requst  |  |
| 2 | 🔑 ¿Dónde se verifica el token? |middleware\authenticate.js en donde esta el bearer token y auth |  |
| 3 | 🧑‍💻 ¿Dónde aparece el usuario autenticado? | si todo es correcto a las rutas de auth sale todo ok 200 en suth service manda a app error |  |
| 4 | 🛡️ ¿Dónde se decide si puede modificar? | en request status en los estados y cambios |  |
| 5 | 🔄 ¿Dónde se valida el cambio de estado? | en request status en los estados y cambios |  |
| 6 | 🗄️ ¿Dónde se ejecuta SQL? | en supabase en la conexion |  |
| 7 | 📜 ¿Dónde se registra el historial? |el historial se guarda en supabase en en database con la conexion  |  |
| 8 | 🧪 ¿Dónde se prueba este comportamiento? | por losmomentos estamos aplicando la carpeta de test |  |

---

## 🧵 Recorrido narrado · caso `POST /requests`

1. 📥 **La petición entra** → ...
2. 🔑 **Se verifica el token** → ...
3. 🧑‍💻 **El actor queda autenticado** → ...
4. 🛡️ **Se decide el permiso** → ...
5. ✅ **Se valida el cuerpo** → ...
6. 💾 **Se persiste** → ...
7. 📜 **Se registra el historial** → ...
8. 📤 **Se responde** → ...

---

## 🔎 Claves de lectura

- Una responsabilidad → un lugar. Si algo existe en dos archivos, es deuda: anótalo.
- El **archivo de pruebas** es la especificación ejecutable: si el código y la prueba
  no coinciden, uno de los dos está mal.

---

## 🤖 AI usage

- ¿Usé IA para completar esta tabla? → ...
- ¿Qué sugerencia acepté? → ...
- ¿Qué sugerencia rechacé o modifiqué? → ...
- ¿Cómo lo comprobé contra el código? → ...