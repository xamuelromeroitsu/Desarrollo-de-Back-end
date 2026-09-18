# Notas — History endpoint ・ Notes

`GET /requests/:id/history`.
Simple notes so we can understand this endpoint later.

---

## 1. Qué es ・ What it is

Devuelve el historial de eventos de una solicitud (creación, cambios de estado, ediciones...).
Returns a request's event history (creation, status changes, edits...).

```
GET /requests/:id/history   Header: Authorization: Bearer <token>
```

---

## 2. Flujo ・ Flow

```
routes.js   GET /:id/history ──► service.getRequestHistory(actor, id)
                                  ├─ findById(id)            → null → 404
                                  ├─ canViewHistory(actor)   → false → 404
                                  └─ findHistory(id)  → mapHistoryEventRow() → 200 []
respond-error.js  traduce AppError → HTTP status
```

El `service` **no hace SQL** y **no define status HTTP**: solo conecta piezas.
The service does **no SQL** and **no HTTP status codes**: it only connects pieces.

---

## 3. Piezas reutilizadas ・ Reused pieces

Nada se inventó: todas las piezas ya existían pero nadie las llamaba.
Nothing was invented: every piece already existed, but nobody used them.

| Pieza ・ Piece | Archivo ・ File | Hace ・ Does |
| --- | --- | --- |
| `findById` | `requests.store.js:49` | Fila o null ・ row or null |
| `canViewHistory` | `request.policy.js:24` | agent sí, requester solo suya ・ agent yes, requester only own |
| `findHistory` | `requests.store.js:105` | Eventos con `ORDER BY created_at, id` |
| `mapHistoryEventRow` | `request.mapper.js:18` | Forma JSON, oculta `changed_by` |
| `notFound` | `requests.service.js:35` | 404 `REQUEST_NOT_FOUND` |
| `respondError` | `respond-error.js:21` | Categoría → status (resource → 404) |

---

## 4. Comportamientos ・ Behaviors

| Caso ・ Case | Resultado |
| --- | --- |
| Owner (su solicitud) ・ own request | `200` + array de eventos |
| Agent (cualquiera) ・ any request | `200` + array de eventos |
| Extraño ・ stranger | `404` (idéntico al inexistente) |
| Id inexistente ・ missing id | `404` |
| Sin token ・ no token | `401` |

**Por qué el mismo 404** ・ **Why the same 404**: si el extraño recibiera otro error,
sabría que la solicitud existe → fuga de datos. Extraño e inexistente responden igual.
If a stranger got a different error, they would know the request exists → data leak.

---

## 5. Verificar ・ Verify

```powershell
# EN: full test suite (17 tests) ・ ES: suite completa (17 tests)
node --test --test-concurrency=1 test/*.test.js

# EN: the class 06 validator, expected 12/12 PASS
# ES: el validador de la clase 06, esperado 12/12 PASS
npm run validate:class-06
```

---

## 6. Probar en Bruno ・ Test in Bruno

1. Run `Auth/login-maria.bru` (agent) → the script saves `{{token}}`.
   Corre `Auth/login-maria.bru` (agent) → el script guarda `{{token}}`.
2. Run `Requests/create.bru` to fill `{{requestId}}`, or copy an id from `Listar`.
   Corre `Requests/create.bru` para llenar `{{requestId}}`, o copiá un id de `Listar`.
3. Open `Requests/history.bru` → Send → `200` with events.
   Abrí `Requests/history.bru` → Send → `200` con los eventos.

> ⚠️ Never commit a token. ・ Nunca commitees un token.
> The `token` / `requestId` vars live in `test-api/environments/Local.bru` and
> are session data, not repo content. ・ Las variables `token`/`requestId` viven en
> `test-api/environments/Local.bru` y son datos de sesión, no contenido del repo.