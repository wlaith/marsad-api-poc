const need = (setting: string) => {
  const variable = process.env[setting];
  if (!variable) throw new Error(`Missing env var ${setting}`);
  return variable;
};
export const config = {
  databaseUrl: need('DATABASE_URL'),
  redisUrl: need('REDIS_URL'),
  rabbitUrl: need('RABBITMQ_URL'),
  port: Number(process.env.PORT ?? 3000),
};