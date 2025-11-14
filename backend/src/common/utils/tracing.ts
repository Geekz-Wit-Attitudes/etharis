import { NodeSDK } from "@opentelemetry/sdk-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PrismaInstrumentation } from "@prisma/instrumentation";
import { trace } from "@opentelemetry/api";
import { env } from "process";

let sdk: NodeSDK | null = null;

export const initTracing = () => {
  if (sdk) return sdk; // prevent double init

  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: "etharis-service",
    }),
    traceExporter: new OTLPTraceExporter({
      url: env.jaegerEndpoint, // OTLP HTTP endpoint
    }),
    instrumentations: [
      new HttpInstrumentation(),
      new PrismaInstrumentation(),

      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": {
          enabled: false,
        },
      }),
    ],
  });

  sdk.start();
  console.log("Tracing initialized (OTLP)");

  // Handle graceful shutdown
  process.on("SIGTERM", async () => {
    try {
      await sdk?.shutdown();
      console.log("Tracing shut down successfully");
    } catch (err) {
      console.error("Error shutting down tracing", err);
    } finally {
      process.exit(0);
    }
  });
};

export function withTracing<T>(
  spanName: string,
  handler: () => Promise<T>,
  attributes: Record<string, any> = {}
) {
  const tracer = trace.getTracer("app-service");
  const span = tracer.startSpan(spanName);

  // Add custom attributes
  Object.entries(attributes).forEach(([key, val]) => {
    span.setAttribute(key, typeof val === "string" ? val : JSON.stringify(val));
  });

  return handler()
    .then((res) => {
      span.setAttribute("success", true);
      return res;
    })
    .catch((err) => {
      span.setAttribute("success", false);
      span.recordException(err);
      throw err;
    })
    .finally(() => {
      span.end();
    });
}
