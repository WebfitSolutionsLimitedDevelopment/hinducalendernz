import type { NextConfig } from 'next';
import { join } from 'node:path';

const nextConfig: NextConfig = {
  transpilePackages: ['@hindu-calendar/calendar-data'],
  outputFileTracingRoot: join(__dirname, '..', '..'),
  outputFileTracingIncludes: {
    '/**': ['../../data/**/*'],
    '/api/ecalendar/download': ['./private/ecalendar/**/*', './public/ecalendar/**/manifest.json'],
    '/api/agreement/sign': ['./private/brand/**/*'],
  },
};

export default nextConfig;
