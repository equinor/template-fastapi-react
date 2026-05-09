FROM dhi.io/busybox:1.37.0-debian13

COPY --from=dhi.io/oauth2-proxy:7.14.2-debian13 /usr/local/bin/oauth2-proxy /usr/local/bin/

COPY oauth2-proxy.toml /etc/
COPY oauth2-proxy.yaml /etc/
COPY entrypoint.sh /usr/local/bin/

# DHI images run as nonroot (uid 65532) by default. Re-declare explicitly so the
# intent is obvious and `docker run` enforces it locally too (Radix SCC enforces
# it in the cluster regardless).
USER 65532:65532

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["--config", "/etc/oauth2-proxy.toml", "--alpha-config", "/etc/oauth2-proxy.yaml"]
