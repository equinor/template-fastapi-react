# syntax=docker/dockerfile:1
FROM dhi.io/redis:8.6.2-debian13-compat
# DHI ships redis-cli, tini, and a nonroot user; no extra package install needed.
# Newer redis majors aren't always on DHI yet — pin to the latest available
# compat tag and bump as new images land.

ENV USER="nonroot"

COPY --chown="$USER:$USER" rootfs /

HEALTHCHECK --start-period=5s --start-interval=2s --interval=30s --timeout=3s --retries=3 \
    CMD ["/usr/local/sbin/healthcheck.sh"]

ENTRYPOINT ["tini", "--", "/usr/local/sbin/entrypoint.sh"]
