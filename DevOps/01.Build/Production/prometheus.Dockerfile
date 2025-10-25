# Use official Prometheus image as base
FROM prom/prometheus:latest

# Copy your custom Prometheus config file
COPY prometheus.yml /etc/prometheus/prometheus.yml

# Expose Prometheus port
EXPOSE 9090

# Start Prometheus
ENTRYPOINT ["/bin/prometheus", "--config.file=/etc/prometheus/prometheus.yml"]
