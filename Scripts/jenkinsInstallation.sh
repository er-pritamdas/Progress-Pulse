#!/bin/bash

# Automated Jenkins installation script for Ubuntu

set -e  # Exit immediately if a command fails

echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

echo "Installing OpenJDK 17..."
sudo apt install -y openjdk-17-jdk

echo "Verifying Java version..."
java -version

echo "Adding Jenkins repository and key..."
curl -fsSL https://pkg.jenkins.io/debian/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

echo "Updating package list..."
sudo apt update

echo "Installing Jenkins..."
sudo apt install -y jenkins

echo "Starting and enabling Jenkins service..."
sudo systemctl enable jenkins
sudo systemctl start jenkins

echo "Allowing Jenkins port 8080 through the firewall..."
sudo ufw allow 8080
sudo ufw reload

echo "Jenkins installation completed!"
echo "Access Jenkins at: http://<your-server-ip>:8080"
echo "Initial admin password:"
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
