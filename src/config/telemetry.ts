import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    'service.name': 'url-shortener-api',
    'service.version': '1.0.0',
    'deployment.environment': process.env.NODE_ENV || 'development',
  }),

  traceExporter: new OTLPTraceExporter({
    url: 'http://otel_collector:4318/v1/traces',
  }),

  instrumentations: [
    getNodeAutoInstrumentations({
      // reduce noise
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-dns': { enabled: false },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', async () => await sdk.shutdown());
