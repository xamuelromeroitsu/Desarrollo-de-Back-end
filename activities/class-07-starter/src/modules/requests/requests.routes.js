// HTTP layer of the requests module: it extracts path, query, body and
// the authenticated actor, invokes the operation, and translates results
// and typed errors into HTTP responses. It contains no SQL and no domain
// rules. The router assumes app.js mounted it behind `authenticate`, so
// req.auth is always present here.

import express from 'express';
import {
  listRequests,
  getRequest,
  createRequest,
  patchRequest,
  getHistory
} from './requests.service.js';
import { respondError } from '../../http/respond-error.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status, priority } = req.query;
    res.status(200).json(await listRequests(req.auth, { status, priority }));
  } catch (error) {
    respondError(res, error);
  }
});
//encontramos la primera ruta que es la de obtener una solicitud por su id, y luego la ruta para obtener el historial de esa solicitud, luego la ruta para crear una nueva solicitud y finalmente la ruta para actualizar una solicitud existente.  
//esta es Number(req.params.id)  // "not-a-number" → NaN que esta causando que el servicio devuelva un error de tipo 400, ya que no se puede convertir a número. por que devuelve 500 error
//esto es porque el servicio espera un número como id, y si se le pasa un valor que no se puede convertir a número, lanza un error de tipo 400. para evitar esto, se puede validar el id antes de llamar al servicio, y si no es un número válido, devolver un error de tipo 400 con un mensaje adecuado.
//pero como el servidor esta devolviendo un error 500, es porque el error no esta siendo manejado correctamente en el servicio, y se esta propagando hasta el router, que lo traduce a un error 500. para solucionarlo, se puede capturar el error en el servicio y lanzar un error de tipo 400 con un mensaje adecuado, o bien validar el id en el router antes de llamar al servicio.
router.get('/:id', async (req, res) => {
  try {
    res.status(200).json(await getRequest(req.auth, Number(req.params.id)));
  } catch (error) {
    respondError(res, error);
  }
});
//esta es la ruta para obtener el historial de una solicitud por su id, y luego la ruta para crear una nueva solicitud y finalmente la ruta para actualizar una solicitud existente.
router.get('/:id/history', async (req, res) => {
  try {
    res.status(200).json(await getHistory(req.auth, Number(req.params.id)));
  } catch (error) {
    respondError(res, error);
  }
});

router.post('/', async (req, res) => {
  try {
    res.status(201).json(await createRequest(req.auth, req.body));
  } catch (error) {
    respondError(res, error);
  }
});

router.patch('/:id', async (req, res) => {
  try {
    res.status(200).json(await patchRequest(req.auth, Number(req.params.id), req.body));
  } catch (error) {
    respondError(res, error);
  }
});

export default router;
