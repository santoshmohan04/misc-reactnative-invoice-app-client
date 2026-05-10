import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  widenClientFileUpload: true,
  disableLogger: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  sourcemaps: {
    disable: process.env.NODE_ENV !== 'production',
    filesToDeleteAfterUpload: ['.next/**/*.map'],
  },
});
