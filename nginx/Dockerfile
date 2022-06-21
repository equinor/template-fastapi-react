FROM nginx:1.22.0-alpine

RUN apk upgrade --update-cache

# Copy configs
COPY nginx.conf /etc/nginx/nginx.conf
COPY config/ /etc/nginx/config

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy sites-available into sites-enabled
COPY sites-available/default.conf /etc/nginx/sites-enabled/default.conf

# Create log directory if not present, set permissions
RUN mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/log/nginx

# Create tmp directory if not present, set permissions
RUN mkdir -p /tmp/nginx && \
    chown -R nginx:nginx /tmp/nginx

# Create pidfile, set permissions
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Run master process as user nginx
USER nginx