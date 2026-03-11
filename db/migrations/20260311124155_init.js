/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    BEGIN;
    CREATE TABLE IF NOT EXISTS public.links
    (
        id              UUID PRIMARY KEY      DEFAULT uuidv7(),
        slug            VARCHAR(30) NOT NULL,
        original_url    TEXT         NOT NULL,
        expired_at      TIMESTAMPTZ,
        deleted_at      TIMESTAMPTZ,
        created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    COMMENT ON COLUMN links.slug IS 'Уникальный slug для ссылки. Должен быть уникальным.';
    COMMENT ON COLUMN links.original_url IS 'Оригинальный URL, на который указывает ссылка.';
    COMMENT ON COLUMN links.expired_at IS 'Время, когда ссылка становится недействительной.';

    CREATE UNIQUE INDEX IF NOT EXISTS links_slug_idx ON public.links (slug);
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
