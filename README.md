# StockFlow - Sistema Empresarial de Gestion de Inventario y Almacenes

StockFlow es una plataforma web integral disenada para el control operativo y estrategico de existencias, administracion multialmacen, facturacion en punto de venta (POS), gestion de ordenes de compra con recepcion formal de mercancia y auditoria inmutable de trazabilidad (Kardex).

El sistema implementa una arquitectura desacoplada basada en microservicios contenerizados: backend robusto en Spring Boot 3 con Java 21, frontend modular en React 19 con TypeScript y Vite bajo un diseno minimalista inspirado en los estandares de interfaz de Apple, y persistencia en PostgreSQL 16 con migraciones automaticas mediante Flyway.

---

## Arquitectura y Tecnologias

### Backend
- **Lenguaje y Framework:** Java 21 LTS y Spring Boot 3.4.2.
- **Seguridad:** Spring Security 6 con autenticacion sin estado basada en JSON Web Tokens (JJWT 0.12.x) y autorizacion granular por roles (`ROLE_ADMIN`, `ROLE_SELLER`, `ROLE_WAREHOUSEMAN`).
- **Capa de Persistencia:** Spring Data JPA y Hibernate 6 con control de transacciones ACID y prevencion estricta de stock negativo.
- **Migraciones de Base de Datos:** Flyway Migrations con versionamiento estructurado de esquema DDL (`V1__init_schema.sql`) y datos iniciales de prueba (`V2__seed_data.sql`).
- **Documentacion de API:** OpenAPI 3 y Swagger UI con autenticacion Bearer JWT interactiva integrada.
- **Validacion:** Jakarta Bean Validation para sanitizacion de entradas y control riguroso de DTOs.

### Frontend
- **Framework y Herramientas:** React 19 con TypeScript y Vite 8.
- **Diseno e Interfaz:** Sistema de diseno minimalista inspirado en Apple (Human Interface Guidelines), con paleta neutra en blanco puro (`#ffffff`), lienzo en gris sutil (`#fbfbfd`), botones solidos en negro (`#000000`), paneles con sombras ambientales suaves y tipografia SF Pro / Inter.
- **Iconografia:** Lucide React (iconos vectoriales SVG limpios, sin emoticones).
- **Graficos:** Recharts para curvas de facturacion mensual y distribucion de stock por almacen.
- **Gestion de Estado:** Context API estructurada para autenticacion, control de sesion con renovacion de tokens y notificaciones toast.

### Infraestructura y Contenedores
- **PostgreSQL 16:** Motor relacional alojado en contenedor Docker con verificacion de salud activa.
- **Nginx 1.27 Alpine:** Servidor web para distribucion de estaticos en el frontend y proxy inverso para peticiones de API y Swagger.
- **Docker & Docker Compose:** Orquestacion multicontenedor reproducible con redes aisladas y healthchecks encadenados.

---

## Estructura del Proyecto

```
stockflow/
|-- docker-compose.yml          # Orquestacion de PostgreSQL 16, Backend y Frontend
|-- .dockerignore
|-- .gitignore
|-- .env.example                # Variables de entorno de referencia
|-- README.md                   # Documentacion del sistema
|-- backend/                    # Proyecto Spring Boot
|   |-- Dockerfile              # Construccion multi-etapa (Maven + Temurin JRE 21)
|   |-- pom.xml                 # Dependencias Maven
|   `-- src/main/
|       |-- java/com/stockflow/
|       |   |-- config/         # Configuracion de Seguridad, CORS y OpenAPI
|       |   |-- security/       # Filtros JWT y UserDetailsService
|       |   |-- modules/
|       |   |   |-- auth/       # Autenticacion, login y tokens
|       |   |   |-- user/       # Administracion de usuarios y asignacion de roles
|       |   |   |-- category/   # Categorias maestras de productos
|       |   |   |-- product/    # Catalogo, gestion de SKU y calculo de stock total
|       |   |   |-- warehouse/  # Sedes y stock fisico localizado
|       |   |   |-- inventory/  # Kardex inmutable, ajustes y transferencias
|       |   |   |-- sale/       # Facturacion POS y deduccion de existencias
|       |   |   |-- purchase/   # Proveedores y ordenes de compra
|       |   |   `-- dashboard/  # Metricas ejecutivas y valoracion de inventario
|       |   `-- shared/         # Respuestas estandar y manejo global de excepciones
|       `-- resources/
|           |-- application.yml # Configuracion del servidor y conexion a BD
|           `-- db/migration/   # Scripts de migracion Flyway (V1 y V2)
`-- frontend/                   # Aplicacion React + TypeScript
    |-- Dockerfile              # Construccion multi-etapa (Node 22 + Nginx Alpine)
    |-- nginx.conf              # Configuracion de Nginx (SPA fallback y proxy /api/)
    |-- package.json
    |-- vite.config.ts
    `-- src/
        |-- api/                # Cliente Axios tipado con inyeccion automatica de JWT
        |-- components/Layout/  # Barra lateral de navegacion y cabecera ejecutiva
        |-- context/            # AuthContext y ToastContext
        |-- pages/              # Modulos de interfaz de usuario
        |-- types/              # Definiciones e interfaces TypeScript
        `-- index.css           # Tokens de diseno minimalista estilo Apple
```

---

## Credenciales de Demostracion

Para facilitar la evaluacion inmediata del sistema, la base de datos incluye tres perfiles de usuario predeterminados:

| Rol | Usuario | Contrasena | Alcance y Permisos |
| :--- | :--- | :--- | :--- |
| Administrador | `admin` | `admin123` | Control total del sistema, administracion de usuarios, configuracion y metricas financieras. |
| Vendedor | `vendedor` | `vendedor123` | Acceso al Punto de Venta (POS), emision de facturas y consulta de existencias. |
| Almacenero | `almacenero` | `almacenero123` | Recepcion de mercancia, ajustes de existencias y transferencias entre almacenes. |

---

## Despliegue con Docker (Metodo Recomendado)

El sistema se encuentra completamente contenerizado. Para desplegar la base de datos, el backend y el frontend en un solo paso:

### 1. Iniciar los servicios
Ejecute en la raiz del proyecto:
```bash
docker compose up -d --build
```

### 2. Verificar el estado de ejecucion
```bash
docker compose ps
```

### 3. Puntos de acceso disponibles
- **Aplicacion Web:** [http://localhost:3000](http://localhost:3000)
- **API REST:** [http://localhost:8080/api/v1](http://localhost:8080/api/v1)
- **Documentacion Interactiva Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Especificacion OpenAPI JSON:** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)
- **Base de Datos PostgreSQL:** Puerto host `5433` (Base de datos: `stockflow_db`, Usuario: `stockflow_user`, Contrasena: `stockflow_secret`)

### 4. Administrador de base de datos pgAdmin (Opcional)
Si requiere inspeccionar visualmente las tablas mediante pgAdmin:
```bash
docker compose --profile tools up -d pgadmin
```
Acceso en [http://localhost:5050](http://localhost:5050) (Usuario: `admin@stockflow.com`, Contrasena: `admin123`).

---

## Reglas de Negocio e Integridad de Datos

1. **Garantia de Stock No Negativo:**
   La tabla `warehouse_stocks` cuenta con una restriccion de comprobacion a nivel de motor relacional `CHECK (quantity >= 0)`. Toda solicitud que intente descontar existencias por encima de las disponibles es abortada con la excepcion controlada `InsufficientStockException`.

2. **Deduccion Transaccional en Ventas:**
   Cada venta se procesa dentro de una transaccion `@Transactional`. Si cualquiera de los productos incluidos en la comanda no cuenta con existencias suficientes, la operacion completa aplica rollback inmediato, impidiendo estados inconsistentes.

3. **Ciclo de Compras y Recepcion Diferida:**
   La creacion de una orden de compra genera un registro en estado pendiente (`PENDING`) sin incrementar existencias en inventario. El ingreso fisico de articulos se registra unicamente cuando el personal de bodega valida formalmente la recepcion de la mercancia.

4. **Kardex y Auditoria Inmutable:**
   Cualquier movimiento que altere el balance fisico (Venta, Compra, Ajuste Manual o Transferencia entre sedes) genera un asiento inmutable en la tabla `inventory_movements`, documentando usuario responsable, sede de origen, sede de destino, cantidad, saldo anterior y saldo resultante.

5. **Borrado Logico:**
   Para preservar la integridad historica y fiscal, los productos y almacenes con actividad registrada no se eliminan fisicamente, sino que se inhabilitan mediante borrado logico (`isActive = false`).

---

## Ejecucion en Desarrollo Local (Sin Docker para codigo)

Si prefiere compilar y ejecutar los servicios directamente en su entorno local manteniendo solo PostgreSQL en Docker:

### 1. Iniciar la base de datos
```bash
docker compose up -d postgres
```

### 2. Ejecutar el Backend (Spring Boot)
En la carpeta `backend/`:
```bash
# En Windows PowerShell
.\mvnw.cmd spring-boot:run

# En Linux / macOS
./mvnw spring-boot:run
```

### 3. Ejecutar el Frontend (React + Vite)
En la carpeta `frontend/`:
```bash
npm install
npm run dev
```
La aplicacion de desarrollo quedara accesible en [http://localhost:5173](http://localhost:5173) con proxy automatico hacia el backend en el puerto `8080`.

---

## Licencia

Este proyecto esta licenciado bajo los terminos de la licencia MIT.
