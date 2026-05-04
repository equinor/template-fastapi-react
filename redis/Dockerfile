# syntax=docker/dockerfile:1
FROM redis:7-alpine

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
# /data in the base image is owned by redis:redis (uid 999); chown it
# to the nonroot user we run as so RDB snapshots can be written.
RUN chmod +x /usr/local/bin/entrypoint.sh && \
    chown -R 65532:65532 /data

USER 65532:65532

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
