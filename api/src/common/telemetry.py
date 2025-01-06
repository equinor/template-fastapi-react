from opentelemetry import trace

# Creates a tracer from the global tracer provider
tracer = trace.get_tracer("tracer.global")
