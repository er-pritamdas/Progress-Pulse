# Base image: official Jenkins LTS
FROM jenkins/jenkins:lts

LABEL maintainer="er.pritamdas22@gmail.com"
LABEL description="Custom Jenkins image without external volumes"

# Switch to root to install tools
USER root

# Install useful packages
RUN apt-get update && apt-get install -y \
    git \
    curl \
    python3 \
    python3-pip \
    docker.io \
    && apt-get clean

# Add jenkins user to docker group (so it can run docker commands)
RUN usermod -aG docker jenkins

# (Optional) Pre-install Jenkins plugins
RUN jenkins-plugin-cli --plugins \
    "git:latest docker-workflow:latest pipeline-utility-steps:latest"

# Switch back to Jenkins user
USER jenkins

# Expose web and agent ports
EXPOSE 8080 50000

# Jenkins will store data inside container’s filesystem (no external volume)
ENV JENKINS_HOME=/var/jenkins_home

# Default CMD is already defined in base image
