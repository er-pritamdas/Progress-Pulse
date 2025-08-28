
# **Hosting a React Website in Docker on EC2**

---

## **Step 1: Prepare EC2 Instance**

**Goal:** Ensure your EC2 machine is ready with proper network settings.

**Tasks & Commands:**

1. Launch an EC2 instance with your preferred OS (Amazon Linux 2 / Ubuntu).
2. Security Group:
   * Open  **ports** :
     * `22` → SSH
     * `5173` → React dev server (or your chosen port)
   * Example inbound rule for port 5173:
     <pre class="overflow-visible!" data-start="725" data-end="818"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>Type:</span><span></span><span>Custom</span><span></span><span>TCP</span><span>
     </span><span>Port Range:</span><span></span><span>5173</span><span>
     </span><span>Source:</span><span></span><span>0.0</span><span>.0</span><span>.0</span><span>/0</span><span></span><span>(for</span><span></span><span>testing)</span><span>
     </span></span></code></div></div></pre>
3. Network ACLs: Make sure **inbound & outbound traffic** is allowed for your ports.
4. Test connectivity via SSH:

<pre class="overflow-visible!" data-start="936" data-end="994"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>ssh -i <your-key.pem> ec2-user@<EC2-PUBLIC-IP>
</span></span></code></div></div></pre>

5. Optional commands:

<pre class="overflow-visible!" data-start="1017" data-end="1117"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>ping google.com      </span><span># test internet connectivity</span><span>
curl ifconfig.me     </span><span># check public IP</span><span>
</span></span></code></div></div></pre>

---

## **Step 2: Update the EC2 Package Manager**

**Goal:** Ensure your system packages are up-to-date.

**Commands (Amazon Linux / Ubuntu):**

<pre class="overflow-visible!" data-start="1266" data-end="1365"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span># Amazon Linux 2</span><span>
sudo yum update -y

</span><span># Ubuntu</span><span>
sudo apt update -y && sudo apt upgrade -y
</span></span></code></div></div></pre>

**Extra commands:**

<pre class="overflow-visible!" data-start="1387" data-end="1497"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>sudo yum clean all          </span><span># Clean yum cache</span><span>
sudo apt autoremove -y      </span><span># Remove unused packages</span><span>
</span></span></code></div></div></pre>

---

## **Step 3: Install Git**

**Goal:** Clone your project repo to the EC2 machine.

**Commands:**

<pre class="overflow-visible!" data-start="1603" data-end="1810"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span># Amazon Linux</span><span>
sudo yum install git -y

</span><span># Ubuntu</span><span>
sudo apt install git -y

</span><span># Clone your repo</span><span>
git </span><span>clone</span><span> https://github.com/er-pritamdas/Progress-Pulse.git

</span><span># Navigate into project</span><span>
</span><span>cd</span><span> Progress-Pulse
</span></span></code></div></div></pre>

**Extra commands:**

<pre class="overflow-visible!" data-start="1832" data-end="1935"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>git pull origin main      </span><span># Update repo later</span><span>
git status                </span><span># Check repo status</span><span>
</span></span></code></div></div></pre>

---

## **Step 4: Install Docker**

**Goal:** Install Docker and start its service.

**Commands:**

<pre class="overflow-visible!" data-start="2038" data-end="2394"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span># Amazon Linux 2</span><span>
sudo amazon-linux-extras install docker -y
sudo service docker start
sudo systemctl </span><span>enable</span><span> docker

</span><span># Ubuntu</span><span>
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl </span><span>enable</span><span> docker

</span><span># Verify installation</span><span>
docker --version
docker info

</span><span># Optional: run docker without sudo</span><span>
sudo usermod -aG docker </span><span>$USER</span><span>
newgrp docker
</span></span></code></div></div></pre>

**Extra commands:**

<pre class="overflow-visible!" data-start="2416" data-end="2586"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>docker ps                </span><span># List running containers</span><span>
docker images            </span><span># List images</span><span>
docker system prune -a    </span><span># Clean unused images, containers, volumes</span><span>
</span></span></code></div></div></pre>

---

## **Step 5: Build Docker Image**

**Goal:** Build your React frontend image from Dockerfile.

**Commands:**

<pre class="overflow-visible!" data-start="2704" data-end="2864"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span># Go inside project</span><span>
</span><span>cd</span><span> Progress-Pulse

</span><span># Build Docker image</span><span>
sudo docker build -t frontend -f DevOps/01.Build/Development/frontend.Dockerfile Client/
</span></span></code></div></div></pre>

**Verify image is built:**

<pre class="overflow-visible!" data-start="2893" data-end="2923"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>sudo docker images
</span></span></code></div></div></pre>

**Extra commands:**

<pre class="overflow-visible!" data-start="2945" data-end="3140"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>docker rmi <image_id>          </span><span># Delete specific image</span><span>
docker image prune -a           </span><span># Remove all unused images</span><span>
docker tag frontend user/frontend:latest   </span><span># Tag image for Docker Hub</span><span>
</span></span></code></div></div></pre>

---

## **Step 6: Run Docker Container**

**Goal:** Start the container and expose the React app.

**Commands:**

<pre class="overflow-visible!" data-start="3257" data-end="3558"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span># Run container interactively</span><span>
docker run -it -p 5173:5173 --name FE frontend npm run dev -- --host

</span><span># Or run in detached mode (background)</span><span>
docker run -d -p 5173:5173 --name FE frontend npm run dev -- --host

</span><span># Check running containers</span><span>
docker ps

</span><span># Follow logs if detached</span><span>
docker logs -f FE
</span></span></code></div></div></pre>

**Extra commands:**

<pre class="overflow-visible!" data-start="3580" data-end="3805"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>docker stop FE          </span><span># Stop the container</span><span>
docker start -ai FE     </span><span># Start existing container interactively</span><span>
docker </span><span>exec</span><span> -it FE /bin/bash   </span><span># Go inside running container</span><span>
docker </span><span>rm</span><span> FE            </span><span># Remove container</span><span>
</span></span></code></div></div></pre>

---

## **Step 7: Access the Website**

**Steps:**

1. Open browser on your machine.
2. Go to:

<pre class="overflow-visible!" data-start="3903" data-end="3938"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>http:</span><span>//<EC2-PUBLIC-IP>:5173</span><span>
</span></span></code></div></div></pre>

3. Make sure EC2 security group allows inbound TCP traffic on `5173`.

**Extra commands:**

<pre class="overflow-visible!" data-start="4032" data-end="4141"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>curl http://localhost:5173  </span><span># Test from EC2</span><span>
curl http://<EC2-PUBLIC-IP>:5173  </span><span># Test from outside</span><span>
</span></span></code></div></div></pre>

---

## **Step 8: Push Docker Image to Docker Hub (Optional)**

**Commands:**

<pre class="overflow-visible!" data-start="4221" data-end="4400"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span># Tag image</span><span>
docker tag frontend <dockerhub_username>/frontend:latest

</span><span># Login to Docker Hub</span><span>
docker login

</span><span># Push image</span><span>
docker push <dockerhub_username>/frontend:latest
</span></span></code></div></div></pre>

**Extra commands:**

<pre class="overflow-visible!" data-start="4422" data-end="4509"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>docker pull <dockerhub_username>/frontend:latest  </span><span># Pull on another machine</span><span>
</span></span></code></div></div></pre>

---

# **Troubleshooting Section**

| Step | Issue                         | Fix / Commands                                                                             |
| ---- | ----------------------------- | ------------------------------------------------------------------------------------------ |
| 1    | Can’t SSH to EC2             | Check security group & inbound rules, correct key file permissions (`chmod 400 key.pem`) |
| 2    | yum/apt update fails          | Check internet, use `ping google.com`or check proxy settings                             |
| 3    | Git clone fails               | Ensure repo URL correct, Git installed, check SSH keys if private repo                     |
| 4    | Docker not found              | Check installation, restart service:`sudo systemctl start docker`                        |
| 4    | Permission denied             | Add user to docker group:`sudo usermod -aG docker $USER`                                 |
| 5    | Build fails                   | Check Dockerfile path, dependencies; clean previous images:`docker rmi <image>`          |
| 6    | `npm start`error            | Use correct CMD:`npm run dev`if no `"start"`script                                     |
| 6    | Container exits immediately   | Run with `-it`or check logs:`docker logs <container>`                                  |
| 7    | Cannot access site externally | Run container with `--host`, check EC2 security group                                    |
| 7    | Wrong port mapping            | Ensure `-p host_port:container_port`matches React dev server                             |
| 8    | Push to Docker Hub fails      | `docker login`first, check internet, repo permissions                                    |

---

This guide now includes:
