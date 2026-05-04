# syntax=docker/dockerfile:1

# Build a CA bundle that includes Equinor's roots so oauth2-proxy can
# verify TLS through the corporate inspecting proxy when running locally.
# Done in a Debian stage because the script needs openssl + curl/wget;
# the result is a single static PEM that drops into the busybox final
# image at the path Go's crypto/x509 reads on Linux.
FROM debian:trixie-slim AS certs
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl openssl \
 && rm -rf /var/lib/apt/lists/*
COPY install-equinor-certificates.sh /tmp/install-equinor-certificates.sh
RUN /tmp/install-equinor-certificates.sh debian \
 && cp /etc/ssl/certs/ca-certificates.crt /ca-bundle.pem

FROM busybox:1.37.0

COPY --from=quay.io/oauth2-proxy/oauth2-proxy:v7.14.2 /bin/oauth2-proxy /usr/local/bin/

# Replace the (empty/missing) busybox CA store with one that contains
# both the public Mozilla roots and Equinor's internal roots. Go honors
# SSL_CERT_FILE on Linux, so the env var is enough — no need for
# update-ca-certificates (which busybox doesn't ship anyway).
COPY --from=certs /ca-bundle.pem /etc/ssl/certs/ca-certificates.crt
ENV SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt

COPY oauth2-proxy.toml /etc/
COPY oauth2-proxy.yaml /etc/
COPY entrypoint.sh /usr/local/bin/

USER 65532:65532

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["--config", "/etc/oauth2-proxy.toml", "--alpha-config", "/etc/oauth2-proxy.yaml"]
