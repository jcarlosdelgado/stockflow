-- ==============================================================================
-- StockFlow - Seed Data (V2)
-- Initial enterprise seed data: Users, Warehouses, Categories, Products, Stocks
-- ==============================================================================

-- 1. Initial Users (passwords: admin123, vendedor123, almacenero123)
INSERT INTO users (id, username, email, password, first_name, last_name, role, is_active)
VALUES 
    (1, 'admin', 'admin@stockflow.com', '$2a$10$6WmuU6iqTU97aqjPbWjuZ.lVHodkb4rKIzr7UMPFechqCFgrw9gLm', 'Carlos', 'Administrador', 'ROLE_ADMIN', TRUE),
    (2, 'vendedor', 'vendedor@stockflow.com', '$2a$10$CpkK5fSWglSEYf7QMy.F8e8Z/5fTvLQ4kArQcgO4CJl5q0lbTCe3C', 'Lucía', 'Vargas', 'ROLE_SELLER', TRUE),
    (3, 'almacenero', 'almacenero@stockflow.com', '$2a$10$RHbuf5fWKDJCFyjWlQMenu//U5nW0pSw5HojUfiSpfCd6tYjIrQNW', 'Mateo', 'Gómez', 'ROLE_WAREHOUSEMAN', TRUE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. Initial Warehouses
INSERT INTO warehouses (id, code, name, address, is_active)
VALUES
    (1, 'WH-CENTRAL', 'Almacén Central Metropolitano', 'Av. Principal de Logística 1024, Edificio Hub', TRUE),
    (2, 'WH-NORTE', 'Centro de Distribución Norte', 'Parque Industrial Norte, Nave 5B', TRUE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('warehouses_id_seq', (SELECT MAX(id) FROM warehouses));

-- 3. Initial Categories
INSERT INTO categories (id, name, description, is_active)
VALUES
    (1, 'Computación y Laptops', 'Equipos portátiles, desktops y estaciones de trabajo corporativas', TRUE),
    (2, 'Periféricos y Accesorios', 'Teclados, mouse, monitores y docks para estaciones de trabajo', TRUE),
    (3, 'Redes y Servidores', 'Routers empresariales, switches, cableado y gabinetes rack', TRUE),
    (4, 'Almacenamiento y Memorias', 'Discos duros sólidos NVMe, memorias RAM DDR5 y unidades externas', TRUE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- 4. Initial Products
INSERT INTO products (id, sku, name, description, category_id, unit_of_measure, cost_price, sale_price, min_stock, is_active)
VALUES
    (1, 'PROD-LAP-001', 'Laptop Dell Latitude 5540 15.6"', 'Intel Core i7-1365U, 16GB RAM, 512GB SSD NVMe, Windows 11 Pro', 1, 'UNIDAD', 780.00, 1150.00, 5, TRUE),
    (2, 'PROD-LAP-002', 'MacBook Air 13" Chip M3', 'Apple M3 8-core CPU, 16GB memoria unificada, 512GB SSD, Gris Espacial', 1, 'UNIDAD', 1050.00, 1499.00, 3, TRUE),
    (3, 'PROD-MON-001', 'Monitor Dell UltraSharp 27" 4K', 'Panel IPS UHD 3840x2160, USB-C 90W Hub, Altura ajustable, 99% sRGB', 2, 'UNIDAD', 320.00, 480.00, 8, TRUE),
    (4, 'PROD-TEC-001', 'Teclado Mecánico Logitech MX Mechanical', 'Switches táctiles silenciosos, iluminación inteligente, multi-dispositivo', 2, 'UNIDAD', 95.00, 150.00, 10, TRUE),
    (5, 'PROD-MOU-001', 'Mouse Logitech MX Master 3S', 'Sensor 8K DPI silencioso, rueda MagSpeed, Bluetooth y receptor Bolt', 2, 'UNIDAD', 60.00, 99.00, 12, TRUE),
    (6, 'PROD-NET-001', 'Switch Cisco Business CBS250-24T', 'Switch Gestionado Gigabit de 24 puertos + 4x 1G SFP', 3, 'UNIDAD', 290.00, 430.00, 4, TRUE),
    (7, 'PROD-NET-002', 'Router WiFi 6 AX3000 Dual-Band', 'Router profesional de alta densidad de usuarios con puertos Gigabit WAN/LAN', 3, 'UNIDAD', 65.00, 110.00, 6, TRUE),
    (8, 'PROD-SSD-001', 'Disco SSD Kingston KC3000 1TB PCIe 4.0', 'Lectura hasta 7000MB/s, escritura hasta 6000MB/s formato M.2 2280', 4, 'UNIDAD', 62.00, 95.00, 15, TRUE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- 5. Initial Warehouse Stocks (Prevents negative stock, sets realistic initial inventory)
INSERT INTO warehouse_stocks (product_id, warehouse_id, quantity)
VALUES
    -- Almacén Central
    (1, 1, 18),
    (2, 1, 10),
    (3, 1, 25),
    (4, 1, 40),
    (5, 1, 55),
    (6, 1, 8),
    (7, 1, 14),
    (8, 1, 60),
    -- Almacén Norte
    (1, 2, 7),
    (2, 2, 4),
    (3, 2, 12),
    (4, 2, 18),
    (5, 2, 22),
    (6, 2, 3),
    (7, 2, 5),
    (8, 2, 25)
ON CONFLICT (product_id, warehouse_id) DO NOTHING;

-- 6. Initial Suppliers
INSERT INTO suppliers (id, document_number, company_name, contact_name, email, phone, address, is_active)
VALUES
    (1, 'J-30491820-1', 'TechSupply Global Logistics', 'Fernando Peña', 'ventas@techsupplyglobal.com', '+58 212 901-2233', 'Zona Libre de Comercio, Galpón 14', TRUE),
    (2, 'J-40112948-2', 'Cisco Mayorista Latam', 'Patricia Rivas', 'corporativo@ciscolatam.com', '+58 212 770-4455', 'Torre Empresarial Este, Piso 11', TRUE),
    (3, 'J-50293811-3', 'Compumundo Distribuciones', 'Andrés Velásquez', 'pedidos@compumundo.com', '+58 212 555-8899', 'Av. Intercomunal San Martín 45', TRUE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('suppliers_id_seq', (SELECT MAX(id) FROM suppliers));

-- 7. Initial Customers
INSERT INTO customers (id, document_number, name, email, phone, address, is_active)
VALUES
    (1, 'J-10293847-0', 'Soluciones Digitales Horizonte C.A.', 'contacto@shorizonte.com', '+58 212 344-9900', 'Centro Financiero Madrid, Torre B', TRUE),
    (2, 'J-20394857-1', 'Corporación Logística del Valle', 'compras@logivalle.com', '+58 212 888-1122', 'Parque Tecnológico, Manzana 3', TRUE),
    (3, 'V-18492019', 'Ing. Carlos Mendoza', 'carlos.mendoza@gmail.com', '+58 414 123-4567', 'Urb. Los Rosales, Calle 4, Casa 12', TRUE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers));

-- 8. Initial Inventory Audit Movements (Documenting initial balance)
INSERT INTO inventory_movements (type, product_id, warehouse_id, quantity, previous_stock, new_stock, reference_type, reference_id, notes, created_by)
VALUES
    ('ENTRY', 1, 1, 18, 0, 18, 'MANUAL_ADJUSTMENT', 'INIT-2026-001', 'Carga de inventario inicial - Inventario físico de apertura', 1),
    ('ENTRY', 2, 1, 10, 0, 10, 'MANUAL_ADJUSTMENT', 'INIT-2026-002', 'Carga de inventario inicial - Apertura Almacén Central', 1),
    ('ENTRY', 3, 1, 25, 0, 25, 'MANUAL_ADJUSTMENT', 'INIT-2026-003', 'Carga de inventario inicial - Apertura Almacén Central', 1),
    ('ENTRY', 4, 1, 40, 0, 40, 'MANUAL_ADJUSTMENT', 'INIT-2026-004', 'Carga de inventario inicial - Apertura Almacén Central', 1),
    ('ENTRY', 5, 1, 55, 0, 55, 'MANUAL_ADJUSTMENT', 'INIT-2026-005', 'Carga de inventario inicial - Apertura Almacén Central', 1),
    ('ENTRY', 6, 1, 8, 0, 8, 'MANUAL_ADJUSTMENT', 'INIT-2026-006', 'Carga de inventario inicial - Apertura Almacén Central', 1),
    ('ENTRY', 7, 1, 14, 0, 14, 'MANUAL_ADJUSTMENT', 'INIT-2026-007', 'Carga de inventario inicial - Apertura Almacén Central', 1),
    ('ENTRY', 8, 1, 60, 0, 60, 'MANUAL_ADJUSTMENT', 'INIT-2026-008', 'Carga de inventario inicial - Apertura Almacén Central', 1),
    ('TRANSFER', 1, 1, 7, 18, 11, 'TRANSFER', 'TRF-INIT-001', 'Transferencia inicial de stock de Almacén Central a Sucursal Norte', 1),
    ('ENTRY', 1, 2, 7, 0, 7, 'TRANSFER', 'TRF-INIT-001', 'Recepción de transferencia inicial en Sucursal Norte', 1);
