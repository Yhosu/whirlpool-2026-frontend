# Documentación Técnica de Endpoints (Uso Interno)
La url de la api debe ser http://localhost:8000 es configurable ojo, tenerlo en cuenta para no repetir esto en varios lugares es una variable global, localhost es porque esta en local ahorita pero cuando lo suba cambiaré la url y generaré de nuevo el compilado ya con un dominio en la web

Todas las respuestas del backend siguen el estándar de `ApiResponseService`:
* **`process`**: Indica si la operación fue exitosa (`true`) o fallida (`false`).
* **`message`**: Mensaje descriptivo para el usuario o sistema.
* **`data`**: Objeto o array con los datos solicitados.
* **`errors`**: Lista de mensajes de error cuando `process` es `false`.

---

## 1. Validar Código / Intentos Disponibles

* **Método:** `GET`
* **Endpoint:** `/api/check-code/{code}`
* **Descripción:** Recibe un código en la URL (puede ser el código único del cupón `code` o el código de control de la compra `control_code`). Busca formularios asociados. Si encuentra registros, devuelve en `last_form` el primer formulario que esté en estado `registered` listo para girar la ruleta/lavadora, el contador de formularios en estado `registered` y el listado de formularios que ya fueron utilizados (`used`) para renderizar el historial.

### Parámetro de URL
* `{code}`: Código alfanumérico ingresado por el cliente (ejemplo: `A1B2C3` o `CTRL-98765`).

### Respuesta Exitosa (`200 OK`)

```json
{
  "process": true,
  "message": "El código se validó con éxito.",
  "data": {
    "last_form": {
      "id": "e4b3c2a1-5d6e-4f7a-8b9c-0d1e2f3a4b5c",
      "code": "A1B2C3",
      "control_code": "CTRL-98765",
      "name": "Juan Pérez",
      "ci_number": "12345678",
      "cellphone": "70012345",
      "city": "Santa Cruz",
      "status": "registered",
      "business_unit": "DISMAC",
      "type": "dismac",
      "prize": {
        "id": 5,
        "name": "Microondas Whirlpool 20L",
        "description": "Microondas color plata"
      },
      "branch": {
        "id": 2,
        "name": "Sucursal Banzer",
        "city": "Santa Cruz"
      }
    },
    "registered_count": 2,
    "registered_forms": [
      {
        "id": "e4b3c2a1-5d6e-4f7a-8b9c-0d1e2f3a4b5c",
        "code": "A1B2C3",
        "status": "registered"
      },
      {
        "id": "f5c4d3b2-6e7f-5a8b-9c0d-1e2f3a4b5c6d",
        "code": "A1B2C4",
        "status": "registered"
      }
    ],
    "used_count": 1,
    "used_forms": [
      {
        "id": "c2b1a0f9-4d5e-3f6a-7b8c-9d0e1f2a3b4c",
        "code": "A1B2C2",
        "status": "used",
        "prize": {
          "id": 3,
          "name": "Licuadora Whirlpool"
        }
      }
    ]
  },
  "errors": []
}
```

### Explicación de los campos devueltos en `data`:
* **`last_form`**: Objeto del formulario actual en estado `registered` que se debe usar en este giro. De este objeto debes tomar el campo `id` (UUID) para enviarlo luego a `/api/mark-as-used`.
* **`registered_count`**: Número entero que indica cuántos intentos le quedan disponibles por girar.
* **`registered_forms`**: Arreglo con todos los formularios activos pendientes de giro.
* **`used_count`**: Número entero de cuántos intentos ya ha girado el usuario.
* **`used_forms`**: Arreglo con los formularios que ya fueron girados junto a sus premios obtenidos.

---

### Errores posibles:

#### Código no existe en base de datos (`404 Not Found`):
```json
{
  "process": false,
  "message": "El código ingresado no existe.",
  "errors": [
    "No se encontró ningún formulario asociado al código proporcionado."
  ],
  "data": {}
}
```

#### Código sin intentos en estado registrado / Ya usados (`400 Bad Request`):
```json
{
  "process": false,
  "message": "El código ya no cuenta con intentos disponibles en estado registrado.",
  "errors": [
    "Todos los intentos han sido utilizados o no se encuentran activos."
  ],
  "data": {
    "last_form": null,
    "registered_count": 0,
    "registered_forms": [],
    "used_count": 2,
    "used_forms": [
      {
        "id": "c2b1a0f9-4d5e-3f6a-7b8c-9d0e1f2a3b4c",
        "code": "A1B2C1",
        "status": "used",
        "prize": { "name": "Licuadora Whirlpool" }
      },
      {
        "id": "d3c2b1a0-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
        "code": "A1B2C2",
        "status": "used",
        "prize": { "name": "Edredón Whirlpool" }
      }
    ]
  }
}
```

---

## 2. Marcar Intento como Utilizado

* **Método:** `POST`
* **Endpoint:** `/api/mark-as-used`
* **Descripción:** Se debe invocar una vez concluido el giro en la ruleta/lavadora para pasar el estado del formulario de `registered` a `used`, evitando que se vuelva a jugar el mismo intento. Devuelve el premio asignado, código de cupón y vigencia (en caso de Dismac) o confirmación de cashback / transferencia (en caso de Mercado Informal).

### Payload de Envío (Request Body JSON):
```json
{
  "id": "e4b3c2a1-5d6e-4f7a-8b9c-0d1e2f3a4b5c",
  "control_code": "CTRL-98765"
}
```

* `id` *(Obligatorio, String UUID)*: Identificador obtenido previamente de `last_form.id` en `/api/check-code`.
* `control_code` *(Opcional, String)*: Código de control de la factura (en caso de compras Dismac).

---

### CASO 1: Participante Dismac (`type = "dismac"`)

En compras de Dismac, el usuario gana un **cupón digital / Gift Card de Dismac** cargado desde el inventario de cupones.

```json
{
  "process": true,
  "message": "Formulario marcado como utilizado con éxito.",
  "data": {
    "id": "e4b3c2a1-5d6e-4f7a-8b9c-0d1e2f3a4b5c",
    "name": "Pedro Sánchez",
    "ci_number": "4567890",
    "cellphone": "71122334",
    "city": "Santa Cruz",
    "type": "dismac",
    "business_unit": "ECO",
    "control_code": "CTRL-98765",
    "status": "used",
    "is_scratched": 1,
    "code": "F5714PCDQW",
    "code_id": "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
    "expiration_date": "2027-01-04 14:18:17",
    "assigned_code": {
      "id": "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
      "code": "F5714PCDQW",
      "product_code": "TC1000S",
      "value": 1000,
      "expiration_date": "2027-01-04 14:18:17",
      "days_valid": 90
    },
    "prize_id": "00a4aab0-7f51-402f-8d32-06958f4ed6c9",
    "prize": {
      "id": "00a4aab0-7f51-402f-8d32-06958f4ed6c9",
      "name": "Premio 1000 Bs",
      "description": "Premio en efectivo / voucher de 1000 Bs",
      "amount": "1000.00"
    },
    "branch_id": "377d6e80-2d7c-4706-a97a-b194e9855c6e",
    "branch": {
      "id": "377d6e80-2d7c-4706-a97a-b194e9855c6e",
      "name": "Central Dismac",
      "channel": "ECOMMERCE",
      "city": "Santa Cruz"
    },
    "invoice_url": "https://siat.impuestos.gob.bo/...",
    "sale_id": "d1c2b3a4-..."
  },
  "errors": []
}
```

* **`data.code`**: Código del cupón / Gift Card a canjear en Dismac (ej. `"F5714PCDQW"`).
* **`data.expiration_date`**: Fecha límite de validez del cupón (ej. `"2027-01-04 14:18:17"`).
* **`data.assigned_code.value`**: Monto del cupón en Bs (ej. `1000`).
* **`data.prize.name`**: Nombre del premio (ej. `"Premio 1000 Bs"`).

---

### CASO 2: Participante Mercado Informal (`type = "informal-market"`)

En compras de Mercado Informal, el participante recibe un premio en efectivo / cashback de la sucursal de Mayoristas. **No se asigna cupón de Dismac**.

```json
{
  "process": true,
  "message": "Formulario marcado como utilizado con éxito.",
  "data": {
    "id": "e4b3c2a1-5d6e-4f7a-8b9c-0d1e2f3a4b5c",
    "name": "María Fernández",
    "ci_number": "9876543",
    "cellphone": "72233445",
    "city": "Santa Cruz",
    "type": "informal-market",
    "business_unit": "MERCADO INFORMAL",
    "control_code": null,
    "status": "used",
    "is_scratched": 1,
    "code": "G7K9X2",
    "code_id": null,
    "expiration_date": null,
    "assigned_code": null,
    "prize_id": "85f67a72-8dc7-4d7a-a37d-1ddebb91fcd2",
    "prize": {
      "id": "85f67a72-8dc7-4d7a-a37d-1ddebb91fcd2",
      "name": "Premio 250 Bs",
      "description": "Premio en efectivo / voucher de 250 Bs",
      "amount": "250.00"
    },
    "branch_id": "4dda0906-cc45-40df-a95c-6f95292f5677",
    "branch": {
      "id": "4dda0906-cc45-40df-a95c-6f95292f5677",
      "name": "CashBack Mayoristas",
      "channel": "MAYORISTA",
      "city": "Santa Cruz"
    },
    "invoice_url": "invoices/informal/abc12345.jpg",
    "sale_id": null
  },
  "errors": []
}
```

* **`data.code`**: Código único de 6 caracteres asignado al registrar el formulario (ej. `"G7K9X2"`).
* **`data.prize.name`**: Nombre del premio obtenido (ej. `"Premio 250 Bs"`).
* **`data.prize.amount`**: Monto en Bs (ej. `"250.00"`).
* **`data.assigned_code`**: `null`.
* **`data.code_id`**: `null`.
* **Modalidad**: Se muestra `Transferencia bancaria`.

---

### Errores posibles:

#### No hay stock disponible (`400 Bad Request`):
```json
{
  "process": false,
  "message": "No hay stock disponible.",
  "errors": [
    "No hay stock disponible."
  ],
  "data": {}
}
```

#### El formulario ya fue utilizado previamente (`400 Bad Request`):
```json
{
  "process": false,
  "message": "El formulario ya ha sido utilizado.",
  "errors": [
    "Este intento ya fue utilizado previamente."
  ],
  "data": {
    "id": "e4b3c2a1-5d6e-4f7a-8b9c-0d1e2f3a4b5c",
    "status": "used"
  }
}
```

#### El UUID no existe (`404 Not Found`):
```json
{
  "process": false,
  "message": "Formulario no encontrado.",
  "errors": [
    "No se encontró ningún registro con el identificador UUID proporcionado."
  ],
  "data": {}
}
```

---

## 3. Formulario de Mercado Informal (Subida de Comprobante / Factura)

* **Método:** `POST`
* **Endpoint:** `/api/informal-market-form`
* **Descripción:** Registra las compras de clientes de mercado informal. El backend procesa el archivo Base64, lo optimiza automáticamente (redimensiona a máx 1600px y comprime a JPG 75% si es imagen) y lo almacena en Amazon S3. El registro se crea en estado `pending` con un código único de 6 caracteres alfanuméricos y **sin premio asignado** (el premio se asignará desde el panel admin mediante el botón Validar).

### Payload de Envío (Request Body JSON):
```json
{
  "name": "María González",
  "cellphone": "77123456",
  "document_number": "4892153",
  "city": "Santa Cruz",
  "file": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
}
```

### Explicación de campos:
* **`name`** *(Obligatorio, String)*: Nombre completo del participante.
* **`cellphone`** *(Obligatorio, String)*: Número de celular/teléfono de contacto.
* **`document_number`** *(Obligatorio, String)*: Número de carnet de identidad o documento (también se admite `ci_number`).
* **`city`** *(Obligatorio, String)*: Ciudad seleccionada por el cliente.
* **`file`** *(Obligatorio, String)*: Archivo del comprobante codificado en Base64 (acepta imágenes JPG, PNG, WEBP o documentos PDF; puede llevar o no el prefijo `data:...;base64,`).

---

### Respuesta Exitosa (`201 Created`):
```json
{
  "process": true,
  "message": "Su formulario se ha llenado con éxito.",
  "data": {
    "id": "a9b8c7d6-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
    "code": "9F8A2B",
    "name": "María González",
    "ci_number": "4892153",
    "cellphone": "77123456",
    "city": "Santa Cruz",
    "status": "pending",
    "type": "informal-market",
    "invoice_url": "https://bucket-s3.amazonaws.com/invoices/informal/uuid.jpg"
  },
  "errors": []
}
```

---

### Errores posibles:

#### Campos requeridos faltantes (`400 Bad Request`):
```json
{
  "process": false,
  "message": "Error de validación en los parámetros enviados.",
  "errors": [
    "El nombre completo es obligatorio.",
    "El archivo de la factura/boleta en formato base64 es obligatorio.",
    "El número de documento de identidad es obligatorio."
  ],
  "data": {}
}
```

#### Archivo base64 inválido o corrupto (`422 Unprocessable Entity`):
```json
{
  "process": false,
  "message": "Error en el archivo enviado.",
  "errors": [
    "El archivo enviado no corresponde a una imagen válida (JPG, PNG, WEBP) ni a un documento PDF."
  ],
  "data": {}
}
```

---

## 4. Middleware de Protección por IP (Rate Limiting)

Para evitar ataques de saturación o peticiones masivas automatizadas:
* `/api/check-code/{code}`: Límite de 60 peticiones por minuto por IP.
* `/api/mark-as-used`: Límite de 30 peticiones por minuto por IP.
* `/api/informal-market-form`: Límite de 15 peticiones por minuto por IP (protección contra subida masiva de archivos).

### Respuesta cuando se excede el límite (`429 Too Many Requests`):
```json
{
  "process": false,
  "message": "Demasiadas solicitudes. Por favor, espere antes de intentar nuevamente.",
  "errors": [
    "Has excedido el límite permitido de solicitudes desde tu dirección IP (60 por minuto).",
    "Por favor, reintenta en 25 segundos."
  ],
  "data": {
    "retry_after": 25,
    "max_attempts": 60
  }
}
```
