import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://quickbroker:password@localhost:5432/quickbroker',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
  jwtExpiresIn: '15m',
  jwtRefreshExpiresIn: '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  zeptomailToken: process.env.ZEPTOMAIL_TOKEN || '',
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || '',
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  r2Bucket: process.env.R2_BUCKET || 'quickbroker-photos',
  r2Endpoint: process.env.R2_ENDPOINT || '',
  r2PublicUrl: process.env.R2_PUBLIC_URL || ''
};
