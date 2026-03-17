/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    BEGIN;
    CREATE TABLE IF NOT EXISTS public.links
    (
        id           UUID PRIMARY KEY      DEFAULT uuidv7(),
        code         VARCHAR(10)  NOT NULL,
        original_url TEXT         NOT NULL,
        expires_at   TIMESTAMPTZ,
        deleted_at   TIMESTAMPTZ,
        created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    COMMENT ON COLUMN links.code IS 'Уникальный короткий код для ссылки. Должен быть уникальным.';
    COMMENT ON COLUMN links.original_url IS 'Оригинальный URL, на который указывает ссылка.';
    COMMENT ON COLUMN links.expires_at IS 'Время, когда ссылка становится недействительной.';

    -- covering index, lookup без чтения таблицы
    CREATE UNIQUE INDEX links_code_idx
      ON links(code)
      INCLUDE (original_url, expires_at)
      WHERE deleted_at IS NULL;
    COMMIT;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    BEGIN;
    DROP TABLE IF EXISTS public.links;
    COMMIT;
  `);
};
