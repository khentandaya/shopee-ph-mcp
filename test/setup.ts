// Pre-set Indonesian defaults BEFORE test/unit.ts imports session.ts.
// dotenv/config (imported by session.ts) does not override existing env vars,
// so these win over a local .env (e.g. a Philippines .env) and keep unit tests
// deterministic. Loaded via: tsx --import ./test/setup.ts test/unit.ts
process.env.SHOPEE_DOMAIN = 'shopee.co.id';
process.env.SHOPEE_LOCALE = 'id-ID';
process.env.SHOPEE_TIMEZONE = 'Asia/Jakarta';
export {};
