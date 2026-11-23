-- Apply once to an existing MariaDB database before deploying this version.
-- Fresh H2 development databases create these columns from the Store entity.
ALTER TABLE stores
    ADD COLUMN region VARCHAR(255) NULL,
    ADD COLUMN theme VARCHAR(255) NULL,
    ADD COLUMN average_price INT NULL,
    ADD COLUMN capacity_per_slot INT NOT NULL DEFAULT 12;
