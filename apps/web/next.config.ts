import type { NextConfig } from 'next';
import { join } from 'node:path';

const nextConfig: NextConfig = {
  transpilePackages: ['@hindu-calendar/calendar-data'],
  outputFileTracingRoot: join(__dirname, '..', '..'),
  outputFileTracingIncludes: { '/**': ['../../data/**/*'] },
};

export default nextConfig;
