# Evidencia de validación — Clase 05

Pega aquí la salida del validador al cerrar cada estación (SIN secretos: el
validador ya evita imprimirlos, no agregues capturas de tu `.env`).

## stage setup

## stage access-design

```text
CLASS 05 VALIDATION — stage: access-design

[01/03] access-matrix.md completed ....... PASS
[02/03] auth-contract.md completed ....... PASS
[03/03] threat-cases.md completed ........ PASS

RESULT: 3/3

Checkpoint class-05-access-design reached.
Your access design is on record — AI assistance is now allowed.
```

## stage register
CLASS 05 VALIDATION — stage: register

[01/02] Public registration .............. PASS
[02/02] Role escalation protection ....... PASS

RESULT: 2/2
## stage password
CLASS 05 VALIDATION — stage: password

[01/01] Password storage ................. PASS

RESULT: 1/1
## stage loginCLASS 05 VALIDATION — stage: login

[01/02] Login contract ................... PASS
[internal] Error: TODO: authenticate is not implemented yet...
    ...(C:\Users\user\Desktop\Desarrollo-de-Back-end\activities\class-05\request-api-v5-starter\node_modules\router\index.js:186:3)
[02/02] JWT claims and lifetime .......... FAIL
Expected:
GET /auth/me with a token whose payload was edited answers 401.
Observed:
It answered 500 (code: INTERNAL_ERROR).
Review:
- Verify the signature; never trust a merely decoded payload.


RESULT: 1/2
## stage authentication

```text
CLASS 05 VALIDATION — stage: authentication

[01/02] Protected endpoints .............. PASS
[02/02] Token verification ............... PASS

RESULT: 2/2
```

## stage ownership

## stage authorization

## Boss battle (integral)
