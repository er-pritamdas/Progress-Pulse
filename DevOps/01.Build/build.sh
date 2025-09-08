# #!/bin/bash
# set -e

# # Update package list
# sudo apt-get update -y

# # Install prerequisites
# sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common gnupg lsb-release git

# # Add Docker’s official GPG key
# curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
#   sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# # Set up Docker stable repository
# echo \
#   "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
#   https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
#   sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# # Update package index again
# sudo apt-get update -y

# # Install Docker Engine and CLI
# sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# # Enable and start Docker
# sudo systemctl enable docker
# sudo systemctl start docker

# # Install Docker Compose (latest standalone binary)
# DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep tag_name | cut -d '"' -f 4)
# sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
# sudo chmod +x /usr/local/bin/docker-compose
# docker-compose --version

# # Add mcp_server user to docker group (so no sudo needed)
# sudo usermod -aG docker mcp_server

# # Clone repository
# cd /home/mcp_server
# git clone https://github.com/er-pritamdas/Progress-Pulse.git
# cd Progress-Pulse

# # Create .env file in Server directory
# cat <<EOF > Server/.env
# Your environment variables here
# EOF

# # Move into Production build directory and start containers
# cd DevOps/01.Build/Production
# sudo docker-compose up -d


#!/bin/bash
set -e

# Update package list
apt-get update -y

# Install prerequisites
apt-get install -y apt-transport-https ca-certificates curl software-properties-common gnupg lsb-release git

# Add Docker’s official GPG key (non-interactive)
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | tee /usr/share/keyrings/docker-archive-keyring.gpg > /dev/null

# Set up Docker stable repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index again
apt-get update -y

# Install Docker Engine and CLI
apt-get install -y docker-ce docker-ce-cli containerd.io

# Enable and start Docker
systemctl enable docker
systemctl start docker

# Install Docker Compose (latest standalone binary)
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep tag_name | cut -d '"' -f 4)
curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
docker-compose --version

# Clone repository (run as jenkins user’s home)
cd /var/lib/jenkins || cd ~
git clone https://github.com/er-pritamdas/Progress-Pulse.git || true
cd Progress-Pulse

# Create .env file in Server directory
cat <<EOF > Server/.env
Your environment variables here
EOF

# Move into Production build directory and start containers
cd DevOps/01.Build/Production
docker-compose up -d
