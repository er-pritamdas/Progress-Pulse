# Use the official MongoDB image
FROM mongo:7

# Expose the default MongoDB port
EXPOSE 27017

# Use default MongoDB data directory for persistence
VOLUME ["/data/db"]

# Default command
CMD ["mongod"]
