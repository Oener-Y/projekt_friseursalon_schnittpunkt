CREATE DATABASE IF NOT EXISTS projekt_friseursalon_schnittpunkt;
USE projekt_friseursalon_schnittpunkt;

CREATE TABLE kunde (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    telefonnummer VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE mitarbeiter (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE leistung (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dauer_minuten INT NOT NULL,
    preis DECIMAL(6,2) NOT NULL
);

CREATE TABLE mitarbeiter_leistung (
    mitarbeiter_id INT NOT NULL,
    leistung_id INT NOT NULL,
    PRIMARY KEY (mitarbeiter_id, leistung_id),
    FOREIGN KEY (mitarbeiter_id) REFERENCES mitarbeiter(id) ON DELETE CASCADE,
    FOREIGN KEY (leistung_id) REFERENCES leistung(id) ON DELETE CASCADE
);

CREATE TABLE termin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kunde_id INT NOT NULL,
    mitarbeiter_id INT NOT NULL,
    leistung_id INT NOT NULL,
    beginn DATETIME NOT NULL,
    ende DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'gebucht', -- Werte: 'gebucht', 'erledigt', 'storniert'
    preis_zum_zeitpunkt DECIMAL(6,2) NOT NULL,
    FOREIGN KEY (kunde_id) REFERENCES kunde(id),
    FOREIGN KEY (mitarbeiter_id) REFERENCES mitarbeiter(id),
    FOREIGN KEY (leistung_id) REFERENCES leistung(id)
);

INSERT INTO mitarbeiter (id, name) VALUES 
(1, 'Sara'),
(2, 'Mike'),
(3, 'Sinem');

INSERT INTO leistung (id, name, dauer_minuten, preis) VALUES 
(1, 'Herrenschnitt', 30, 28.00),
(2, 'Damenschnitt', 45, 42.00),
(3, 'Waschen und Föhnen', 30, 22.00),
(4, 'Kinderschnitt', 20, 16.00),
(5, 'Bartpflege', 15, 12.00),
(6, 'Färben', 90, 75.00);

INSERT INTO mitarbeiter_leistung (mitarbeiter_id, leistung_id) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6),
(2, 1), (2, 3), (2, 4), (2, 5),
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6);

INSERT INTO kunde (id, name, telefonnummer, email) VALUES 
(1, 'Anna Roth', '0151 11122233', 'anna.roth@hotmail.com'),
(2, 'Berk Yilmaz', '0172 12345678', 'berk.yilmaz@hotmail.com'),
(3, 'Gül Yildiz', '0160 98765432', 'guel.yildiz@hotmail.com');

INSERT INTO termin (kunde_id, mitarbeiter_id, leistung_id, beginn, ende, status, preis_zum_zeitpunkt) VALUES 
(1, 3, 6, '2026-11-17 10:30:00', '2026-11-17 12:00:00', 'gebucht', 75.00),
(2, 2, 1, '2026-11-17 09:00:00', '2026-11-17 09:30:00', 'gebucht', 28.00),
(3, 1, 2, '2026-11-17 09:30:00', '2026-11-17 10:15:00', 'gebucht', 42.00);


-- UPDATE Stornocode
USE projekt_friseursalon_schnittpunkt;

ALTER TABLE termin
ADD COLUMN stornocode VARCHAR(64) NULL UNIQUE;

USE projekt_friseursalon_schnittpunkt;

DELETE FROM termin
WHERE stornocode LIKE 'code-seed-%';

ALTER TABLE termin
MODIFY COLUMN stornocode VARCHAR(64) NOT NULL UNIQUE;