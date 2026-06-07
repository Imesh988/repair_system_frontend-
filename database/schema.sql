-- database/schema.sql
CREATE DATABASE IF NOT EXISTS phone_repair_db;
USE phone_repair_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS bills, payments, warranties, repair_items, inventory, repairs, devices, employees, suppliers, customers, expenses;

CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alt_phone VARCHAR(20),
    address TEXT,
    email VARCHAR(100),
    registered_date DATE DEFAULT (CURRENT_DATE)
);

CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    payment_terms VARCHAR(100)
);

CREATE TABLE employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('technician','receptionist','manager','admin') NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    hire_date DATE,
    salary DECIMAL(10,2),
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    status ENUM('active','inactive') DEFAULT 'active'
);

CREATE TABLE devices (
    device_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    brand VARCHAR(50),
    model VARCHAR(100),
    imei VARCHAR(20),
    problem_description TEXT,
    received_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

CREATE TABLE repairs (
    repair_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_no VARCHAR(20) UNIQUE NOT NULL,
    device_id INT NOT NULL,
    technician_id INT,
    status ENUM('pending','diagnosing','waiting_parts','in_progress','completed','collected') DEFAULT 'pending',
    estimated_cost DECIMAL(10,2),
    final_cost DECIMAL(10,2),
    labor_cost DECIMAL(10,2) DEFAULT 0,
    started_date DATE,
    completed_date DATE,
    collected_date DATE,
    notes TEXT,
    FOREIGN KEY (device_id) REFERENCES devices(device_id),
    FOREIGN KEY (technician_id) REFERENCES employees(employee_id)
);

CREATE TABLE inventory (
    part_id INT AUTO_INCREMENT PRIMARY KEY,
    part_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    quantity INT NOT NULL DEFAULT 0,
    unit_cost DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2),
    reorder_level INT DEFAULT 5,
    supplier_id INT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

CREATE TABLE repair_items (
    repair_item_id INT AUTO_INCREMENT PRIMARY KEY,
    repair_id INT NOT NULL,
    part_id INT NOT NULL,
    quantity_used INT NOT NULL DEFAULT 1,
    price_at_time DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (repair_id) REFERENCES repairs(repair_id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES inventory(part_id)
);

CREATE TABLE warranties (
    warranty_id INT AUTO_INCREMENT PRIMARY KEY,
    repair_id INT NOT NULL,
    warranty_period_months INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    terms TEXT,
    status ENUM('active','expired','claimed') DEFAULT 'active',
    FOREIGN KEY (repair_id) REFERENCES repairs(repair_id)
);

CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    repair_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash','card','bank_transfer','mobile_money') DEFAULT 'cash',
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    receipt_no VARCHAR(50),
    FOREIGN KEY (repair_id) REFERENCES repairs(repair_id)
);

CREATE TABLE bills (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    repair_id INT NOT NULL,
    bill_no VARCHAR(20) UNIQUE NOT NULL,
    bill_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0.00,
    tax DECIMAL(10,2) DEFAULT 0.00,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    balance DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - discount + tax - paid_amount) STORED,
    pdf_path VARCHAR(255),
    FOREIGN KEY (repair_id) REFERENCES repairs(repair_id)
);

CREATE TABLE expenses (
    expense_id INT AUTO_INCREMENT PRIMARY KEY,
    expense_date DATE NOT NULL,
    category VARCHAR(50),
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    paid_to VARCHAR(100),
    receipt_image VARCHAR(255)
);

-- Insert default admin employee (password: admin123)
INSERT INTO employees (full_name, role, email, password_hash, hire_date, salary, status) 
VALUES ('Admin User', 'admin', 'admin@phonerepair.com', '$2b$10$8Yq4Yq4Yq4Yq4Yq4Yq4Yq4Yq4Yq4Yq4Yq4Yq4Yq4Yq4Yq4Yq4', CURDATE(), 50000, 'active');

SET FOREIGN_KEY_CHECKS = 1;
SHOW TABLES;