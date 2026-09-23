# Class 07 incident report

Completa cada sección MIENTRAS investigas. Separa hechos de
interpretaciones: un "creo que" pertenece a Hypotheses, no a Evidence.

## Baseline

Which command confirmed the starting state?
npm run class-07:doctor  # 7/7 PASS
npm test                 # 20 pass, 17 todo

## Incident 701

### Report

(what support said, in one or two lines)

### Reproduction

(the exact request: method, path, user/role, body if any)

### Expected result

### Actual result

(status and body actually received — copy them)

### Hypotheses

(at least two, ordered by probability, each with HOW you would check it)

### Evidence

(what you observed: terminal output, the line where the value travels…
never paste a connection string or a token here)

### Confirmed cause
En Bruno, creá el request así:

Method: GET
URL: http://localhost:3000/requests/not-a-number
Andá a la pestaña Headers
En Key escribí exactamente: Authorization
En Value pegá esto exactamente (sin comillas al inicio ni final):

## Evidencia manual

![confirmando el error manualmente con bruno](701-error-request-not-a-number.png)
### Correction

(the minimal change: file and what it does — not the whole diff)

### Regression test

(which test now fails without the fix and passes with it)

## Incident 702

### Report

### Reproduction

### Expected result

### Actual result

### Hypotheses

### Evidence

### Confirmed cause

### Correction

### Regression test

## Error flow

Where is the error created?
How does it reach the error middleware?
What is returned to the client?
What remains only in the server log?

## Request ID

How did I prove that the response and log belong to the same request?

## AI assistance

What did AI help me understand?
Which hypothesis did it propose?
How did I verify it?
What suggestion was incomplete or incorrect?

## Remaining doubt

What part do I still not understand?
