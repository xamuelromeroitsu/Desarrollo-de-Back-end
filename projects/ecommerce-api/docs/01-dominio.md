# 01 — Dominio ・ Domain (Tienda de Yogures ・ Yoghurt Shop)

> Define el idioma que TODOS usamos (código, tests, docs).
> Defines the shared language used everywhere.

---

## Glosario ・ Glossary (EN / ES)

| Término ・ Term | Definición |
| --- | --- |
| **Yoghurt / Yogur** | Un producto del catálogo. Ejemplo: *Yogur Griego Natural 500g*. |
| **SKU** | Código único de producto (`YOG-500-GR`). |
| **Stock** | Unidades disponibles de un yogur. Nunca negativo. |
| **Product / Producto** | Entidad del catálogo (titulo, sku, sabor, tamaño, precio, stock). |
| **Order / Pedido** | Compra creada por un customer: N líneas de yogures + total. Tiene estado. |
| **Order item / Ítem** | Línea del pedido: yogur + cantidad + **precio al momento de comprar** (snapshot). |
| **Payment / Pago** | Intento de pago de un pedido. Idempotente por `payment_ref`. |
| **Order event / Evento** | Registro de cada cambio del pedido (quién, de → a, cuándo). |
| **Role / Rol** | `customer` (cliente) o `admin` (administrador de la tienda). |
| **Status / Estado** | Fase del pedido en la máquina de estados (ver 03). |

---

## Ejemplo real ・ Concrete example

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "sku": "YOG-500-GR",
  "title": "Yogur Griego Natural 500g",
  "flavor": "natural",
  "sizeMl": 500,
  "priceCents": 350,
  "stock": 120,
  "active": true
}
```

> 5 yogures × 350 céntimos = pedido de **1750 céntimos** (€17.50).

---

## Reglas de oro ・ Golden rules

1. **Stock nunca negativo** — enforce en base (`CHECK stock >= 0`).
2. **Dinero entero** — `price_cents` (int), nunca float.
3. **Todo cambio queda en el historial** — `order_events` es inmutable de hechos.
4. **Pagos idempotentes** — mismo `payment_ref` → mismo resultado, sin doble cargo.
5. **El ítem guarda su precio** — aunque el producto suba, el pedido no cambia.
6. **No revelar existencia** — pedido ajeno = 404 idéntico a inexistente.
7. **Listas vacías = 200 `[]`** — filtrar con criterio válido y 0 resultados no es 404.

---

## Casos de uso ・ Use cases

| # | Caso ・ Case | Actores |
| --- | --- | --- |
| 1 | El customer recorre el catálogo activo | customer/anon |
| 2 | El customer crea un pedido con 1+ yogures | customer |
| 3 | El customer paga su pedido (idempotente) | customer |
| 4 | El customer ve su historial | customer (solo suyo) |
| 5 | El customer cancela su pedido en `pending`/`paid` | customer (solo suyo) |
| 6 | El admin crea/edita productos y stock | admin |
| 7 | El admin ve TODOS los pedidos | admin |
| 8 | El admin avanza `paid → shipped → delivered` | admin |
| 9 | El admin cancela cualquier pedido en `pending`/`paid` | admin |
| 10 | El sistema registra cada evento de 2-9 en `order_events` | sistema |