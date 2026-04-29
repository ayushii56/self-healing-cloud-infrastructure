# 🔄 Self-Healing Cloud Infrastructure

> A production-grade, fully automated cloud infrastructure on AWS that detects failures and recovers from them **in under 60 seconds** — with zero human intervention.

[![AWS](https://img.shields.io/badge/AWS-EKS-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/eks/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-1.32-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Terraform](https://img.shields.io/badge/Terraform-1.14-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)](https://terraform.io/)
[![Prometheus](https://img.shields.io/badge/Prometheus-v3.11-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Grafana-Latest-F46800?style=for-the-badge&logo=grafana&logoColor=white)](https://grafana.com/)
[![ArgoCD](https://img.shields.io/badge/ArgoCD-Stable-EF7B4D?style=for-the-badge&logo=argo&logoColor=white)](https://argoproj.github.io/cd/)

---

## 📖 What Is This?

Most cloud systems fail silently and wait for a human to notice and fix them — that can take **30 minutes to hours**. This project eliminates that entirely.

This infrastructure acts like a **self-aware system**: it constantly monitors itself, detects problems the moment they occur, and automatically takes corrective action. Think of it as a hospital life-support machine — if the patient's heartbeat drops, the machine acts immediately. No nurse needs to be called.

**Deploy any application on top of this infrastructure and it will:**
- Restart crashed pods automatically
- Scale up under heavy traffic, scale down when idle
- Roll back bad deployments before they cause damage
- Alert and remediate through automated Lambda functions
- Give you a live visual dashboard of everything happening

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔁 **Auto Pod Recovery** | Liveness probes detect failure → pod restarted in under 60 seconds |
| 📈 **Auto Scaling** | HPA scales replicas based on CPU (50%) and Memory (70%) thresholds |
| 📊 **Real-Time Monitoring** | Prometheus + Grafana dashboard with live cluster metrics |
| 🔔 **Smart Alerting** | Alertmanager fires on pod restarts, high memory, pod not ready |
| 🚀 **GitOps Deployment** | ArgoCD syncs from Git → auto-rollback on bad deployments |
| ⚡ **Automated Remediation** | AWS Lambda triggered by alerts → executes fixes automatically |
| 🏗️ **Infrastructure as Code** | Entire AWS stack provisioned via Terraform — reproducible in one command |
| 🔒 **Security Built-In** | Private subnets, IAM least privilege, non-root containers, encrypted state |

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          INTERNET / USERS                                │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  AWS ALB (Load   │
                    │   Balancer)      │
                    └────────┬─────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────────┐
│                        AWS VPC  (10.0.0.0/16)                            │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    PUBLIC SUBNETS                                 │   │
│  │     us-east-1a          us-east-1b          us-east-1c           │   │
│  │   10.0.101.0/24       10.0.102.0/24       10.0.103.0/24         │   │
│  │         │                   │                   │                │   │
│  │         └───────────┬───────┘                   │                │   │
│  │               NAT Gateway                        │                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                   PRIVATE SUBNETS (EKS Nodes)                    │   │
│  │     us-east-1a          us-east-1b          us-east-1c           │   │
│  │   10.0.1.0/24         10.0.2.0/24         10.0.3.0/24           │   │
│  │                                                                  │   │
│  │   ┌─────────────────────────────────────────────────────────┐   │   │
│  │   │                  EKS CLUSTER (v1.32)                    │   │   │
│  │   │                                                         │   │   │
│  │   │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │   │   │
│  │   │  │  Node 1      │  │  Node 2      │  │  Node 3/4   │  │   │   │
│  │   │  │  t3.micro    │  │  t3.micro    │  │  t3.micro   │  │   │   │
│  │   │  │              │  │              │  │             │  │   │   │
│  │   │  │ ┌──────────┐ │  │ ┌──────────┐│  │┌──────────┐ │  │   │   │
│  │   │  │ │ App Pod  │ │  │ │Prometheus││  ││ Grafana  │ │  │   │   │
│  │   │  │ │(Node.js) │ │  │ │ Server   ││  ││          │ │  │   │   │
│  │   │  │ └──────────┘ │  │ └──────────┘│  │└──────────┘ │  │   │   │
│  │   │  │ ┌──────────┐ │  │ ┌──────────┐│  │┌──────────┐ │  │   │   │
│  │   │  │ │  HPA     │ │  │ │Alertmgr  ││  ││  ArgoCD  │ │  │   │   │
│  │   │  │ └──────────┘ │  │ └──────────┘│  │└──────────┘ │  │   │   │
│  │   │  └──────────────┘  └──────────────┘  └─────────────┘  │   │   │
│  │   └─────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────┐   ┌───────────────┐   ┌────────────────────────┐  │
│  │   S3 Bucket     │   │  AWS Lambda   │   │       AWS IAM          │  │
│  │ (Terraform      │   │ (Auto-       │   │  (Roles & Policies)    │  │
│  │   State)        │   │  Remediation) │   │                        │  │
│  └─────────────────┘   └───────────────┘   └────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Self-Healing Loop

```
         ┌─────────────────────────────────────────────┐
         │                                             │
    ┌────▼─────┐    ┌──────────┐    ┌──────────┐    ┌─▼────────┐
    │ OBSERVE  │───▶│  DETECT  │───▶│  DECIDE  │───▶│REMEDIATE │
    │          │    │          │    │          │    │          │
    │Metrics   │    │Threshold │    │Runbook   │    │Restart   │
    │Logs      │    │Anomaly   │    │Selection │    │Rollback  │
    │Probes    │    │Detection │    │Blast     │    │Scale     │
    │Traces    │    │          │    │Radius    │    │Reroute   │
    └──────────┘    └──────────┘    └──────────┘    └────┬─────┘
         ▲                                               │
         │              ┌──────────┐                     │
         └──────────────│  LEARN   │◀────────────────────┘
                        │          │
                        │Postmortem│
                        │Retrain   │
                        │Recalibrate│
                        └──────────┘
```

---

## 🛠️ Tech Stack

### Infrastructure
| Tool | Version | Purpose |
|------|---------|---------|
| **AWS EKS** | v1.32 | Managed Kubernetes cluster |
| **Terraform** | v1.14.9 | Infrastructure as Code |
| **AWS VPC** | — | Network isolation |
| **AWS ALB** | — | Load balancing |
| **AWS S3** | — | Terraform remote state |
| **AWS Lambda** | — | Serverless auto-remediation |
| **AWS IAM** | — | Access control |

### Kubernetes & Application
| Tool | Version | Purpose |
|------|---------|---------|
| **Kubernetes** | v1.32 | Container orchestration |
| **Node.js + Express** | v20 | Application backend |
| **Docker** | v29.4.0 | Containerization |
| **HPA** | autoscaling/v2 | Horizontal pod autoscaling |
| **Metrics Server** | Latest | Resource metrics provider |

### Monitoring & GitOps
| Tool | Version | Purpose |
|------|---------|---------|
| **Prometheus** | v3.11.2 | Metrics collection |
| **Grafana** | Latest | Visualization dashboards |
| **Alertmanager** | Latest | Alert routing |
| **ArgoCD** | Stable | GitOps + auto-rollback |

### CLI Tools
| Tool | Version |
|------|---------|
| kubectl | v1.36.0 |
| helm | v4.1.3 |
| aws cli | v2.34.37 |
| git | v2.54.0 |

---

## 📁 Project Structure

```
selfhealing-infra/
│
├── terraform/                    # Infrastructure as Code
│   ├── main.tf                   # Root module + provider config
│   ├── variables.tf              # Input variables
│   └── modules/
│       ├── vpc/                  # VPC, subnets, gateways, route tables
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   └── outputs.tf
│       ├── eks/                  # EKS cluster, node group, IAM, OIDC
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   └── outputs.tf
│       ├── rds/                  # (Future) RDS database module
│       ├── monitoring/           # (Future) Monitoring module
│       └── lambda/               # (Future) Lambda module
│
├── k8s/                          # Kubernetes manifests
│   ├── base/
│   │   └── deployment.yaml       # App deployment + LoadBalancer service
│   ├── monitoring/
│   │   ├── prometheus-values.yaml  # Prometheus Helm values
│   │   └── grafana-values.yaml     # Grafana Helm values
│   ├── autoscaling/
│   │   └── hpa.yaml              # Horizontal Pod Autoscaler
│   └── argocd/                   # ArgoCD application manifests
│
├── app/                          # Application source code
│   ├── src/
│   │   ├── server.js             # Node.js Express app with health probes
│   │   └── package.json
│   └── docker/
│       └── Dockerfile            # Multi-stage production Dockerfile
│
├── scripts/                      # Utility scripts
└── docs/                         # Documentation
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

```bash
git --version       # 2.x+
aws --version       # 2.x+
terraform --version # 1.5+
kubectl version     # 1.28+
helm version        # 3.x+
docker --version    # 24.x+
```

### Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/selfhealing-infra.git
cd selfhealing-infra
```

### Step 2 — Configure AWS Credentials

```bash
aws configure
# AWS Access Key ID: YOUR_KEY
# AWS Secret Access Key: YOUR_SECRET
# Default region: us-east-1
# Default output format: json
```

Verify connection:
```bash
aws sts get-caller-identity
```

### Step 3 — Create S3 Backend for Terraform State

```bash
aws s3api create-bucket \
  --bucket selfhealing-tfstate-YOUR_ACCOUNT_ID \
  --region us-east-1

aws s3api put-bucket-versioning \
  --bucket selfhealing-tfstate-YOUR_ACCOUNT_ID \
  --versioning-configuration Status=Enabled
```

> Update the bucket name in `terraform/main.tf` to match.

### Step 4 — Deploy Infrastructure

```bash
cd terraform
terraform init
terraform plan
terraform apply   # Type 'yes' when prompted
```

⏳ EKS cluster creation takes **12–18 minutes**.

### Step 5 — Connect kubectl to the Cluster

```bash
aws eks update-kubeconfig --region us-east-1 --name selfhealing-cluster
kubectl get nodes   # Should show nodes in Ready state
```

### Step 6 — Deploy the Application

```bash
cd ..
kubectl apply -f k8s/base/deployment.yaml
kubectl get pods -w   # Wait for Running status
kubectl get svc selfhealing-app-svc   # Get EXTERNAL-IP
```

### Step 7 — Install Monitoring Stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

kubectl create namespace monitoring

helm install prometheus prometheus-community/prometheus \
  --namespace monitoring \
  --values k8s/monitoring/prometheus-values.yaml \
  --set server.persistentVolume.enabled=false

helm install grafana grafana/grafana \
  --namespace monitoring \
  --values k8s/monitoring/grafana-values.yaml
```

### Step 8 — Install Auto-Scaling

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl apply -f k8s/autoscaling/hpa.yaml
```

### Step 9 — Install ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

---

## 🧪 Testing Self-Healing

### Test 1 — Pod Auto-Recovery

```bash
# Terminal 1 — Watch pods
kubectl get pods -w

# Terminal 2 — Break the app
curl -X POST http://YOUR_EXTERNAL_IP/break
# OR (Windows PowerShell)
Invoke-WebRequest -Method POST -Uri "http://YOUR_EXTERNAL_IP/break" -UseBasicParsing
```

**Expected:** RESTARTS counter goes from `0` → `1` within ~40 seconds. App recovers automatically.

```
NAME                             READY   STATUS    RESTARTS   AGE
selfhealing-app-xxxx             1/1     Running   0          10m   ← Healthy
selfhealing-app-xxxx             0/1     Running   1 (0s ago) 10m   ← Restarting
selfhealing-app-xxxx             1/1     Running   1 (6s ago) 11m   ← Healed ✅
```

### Test 2 — Auto Scaling

```bash
# Watch HPA
kubectl get hpa -w

# Generate load (Linux/Mac)
while true; do curl -s http://YOUR_EXTERNAL_IP > /dev/null; done

# Generate load (Windows PowerShell)
while ($true) { Invoke-WebRequest -Uri "http://YOUR_EXTERNAL_IP" -UseBasicParsing | Out-Null }
```

**Expected:** REPLICAS increases automatically when CPU > 50%.

### Test 3 — Access Grafana Dashboard

```bash
kubectl port-forward svc/grafana -n monitoring 3000:80
# Open: http://localhost:3000
# Username: admin | Password: SelfHealing@123
```

---

## 📊 Application Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main endpoint — returns request count and pod name |
| `/health/live` | GET | **Liveness probe** — returns 500 if app is broken |
| `/health/ready` | GET | **Readiness probe** — indicates if pod should receive traffic |
| `/break` | POST | **Simulate failure** — triggers self-healing demo |
| `/metrics/basic` | GET | Basic app metrics — uptime, memory, request count |

---

## 🔒 Security

- **Network:** Application pods run in private subnets — no direct internet exposure
- **IAM:** Principle of least privilege — all roles have only required permissions
- **Containers:** App runs as non-root user (`appuser`)
- **State:** Terraform state in S3 with public access fully blocked
- **Secrets:** All credentials stored as Kubernetes Secrets, never hardcoded
- **Cluster:** RBAC enabled, full audit logging on EKS control plane
- **OIDC:** Pod-level IAM permissions via OIDC provider

---

## 📈 Monitoring & Alerts

### Pre-configured Alert Rules

| Alert | Condition | Severity |
|-------|-----------|----------|
| `PodRestarting` | Pod restarted in last 5 minutes | Warning |
| `PodNotReady` | Pod not ready for > 1 minute | Critical |
| `HighMemoryUsage` | Container memory > 50MB for 2 minutes | Warning |

### Grafana Dashboards

- **Kubernetes Cluster** (gnetId: 6417) — Nodes, CPU, Memory overview
- **Pod Monitoring** (gnetId: 747) — Per-pod resource usage and restarts

---

## 🧹 Cleanup

To avoid AWS charges, destroy all resources when done:

```bash
# Delete Kubernetes resources first
kubectl delete -f k8s/base/deployment.yaml
helm uninstall prometheus -n monitoring
helm uninstall grafana -n monitoring
kubectl delete namespace monitoring argocd

# Destroy all AWS infrastructure
cd terraform
terraform destroy   # Type 'yes' when prompted
```

> ⚠️ This permanently deletes the EKS cluster, VPC, and all associated resources.

---

## 🗺️ Roadmap

- [x] AWS VPC + EKS cluster with Terraform
- [x] Self-healing Node.js application with health probes
- [x] Prometheus + Grafana monitoring stack
- [x] Horizontal Pod Autoscaler (HPA)
- [x] ArgoCD GitOps with auto-rollback
- [ ] AWS Lambda automated remediation (in progress)
- [ ] Multi-region failover setup
- [ ] Karpenter for intelligent node autoscaling
- [ ] ML-based anomaly detection
- [ ] Spot instance cost optimization

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Ayush Pandey**
B.Tech CSE — Minor Project

> *"Infrastructure that heals itself, so you don't have to."*

-⭐ Star this repo if you found it useful!
