import { validateEnv } from './env.js';

const base = {
  DATABASE_URL: 'postgresql://u:p@localhost:15432/db?schema=public',
  JWT_SECRET: 'x'.repeat(32),
};

describe('validateEnv', () => {
  it('aplica os padrões e separa CORS_ORIGIN', () => {
    const env = validateEnv({ ...base, CORS_ORIGIN: 'http://a.com, http://b.com' });
    expect(env.PORT).toBe(3333);
    expect(env.NODE_ENV).toBe('development');
    expect(env.CORS_ORIGIN).toEqual(['http://a.com', 'http://b.com']);
  });

  it('recusa JWT_SECRET curto e DATABASE_URL que não é postgres', () => {
    expect(() => validateEnv({ ...base, JWT_SECRET: 'curto' })).toThrow(/JWT_SECRET/);
    expect(() => validateEnv({ ...base, DATABASE_URL: 'mysql://x' })).toThrow(/DATABASE_URL/);
  });
});
