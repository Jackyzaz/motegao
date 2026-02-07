# Kubernetes Deployment for Motegao

This directory contains Kubernetes manifests converted from the docker-compose.production.yml file.

## Prerequisites

- Kubernetes cluster (1.19+)
- kubectl configured
- Docker images built and pushed to a container registry

## Building and Pushing Images

Before deploying, you need to build and push your Docker images to a container registry:

```bash
# Build API image
docker build -t your-registry/motegao-api:latest -f motegao/Dockerfile .
docker push your-registry/motegao-api:latest

# Build App image
docker build -t your-registry/motegao-app:latest -f app/Dockerfile ./app
docker push your-registry/motegao-app:latest
```

Then update the image references in:

- `api-deployment.yaml`
- `app-deployment.yaml`
- `worker-deployment.yaml`

## Configuration

1. **Update secrets** in `secrets.yaml`:
   - `MONGO_ROOT_PASSWORD`
   - `SECRET_KEY`
   - `NEXT_PUBLIC_API_URL`

2. **Adjust storage** in `persistent-volumes.yaml`:
   - Update `storageClassName` to match your cluster's storage class
   - Adjust storage sizes as needed

3. **Update ConfigMap** in `configmap.yaml` if needed

## Deployment

### Option 1: Using kubectl

Deploy all resources:

```bash
kubectl apply -f k8s/
```

### Option 2: Using Kustomize

```bash
kubectl apply -k k8s/
```

## Deployment Order

The manifests will be applied in this recommended order:

1. Namespace
2. ConfigMap and Secrets
3. Persistent Volume Claims
4. Database services (MongoDB, Redis, RabbitMQ)
5. API service
6. App service
7. Worker deployment
8. Nginx proxy

## Verify Deployment

Check pod status:

```bash
kubectl get pods -n motegao-prod
```

Check services:

```bash
kubectl get svc -n motegao-prod
```

View logs:

```bash
kubectl logs -f deployment/api -n motegao-prod
kubectl logs -f deployment/app -n motegao-prod
kubectl logs -f deployment/worker -n motegao-prod
```

## Accessing the Application

Get the external IP of the nginx service:

```bash
kubectl get svc nginx -n motegao-prod
```

If using LoadBalancer, access the application via the EXTERNAL-IP.

For local development with Minikube:

```bash
minikube service nginx -n motegao-prod
```

## Scaling

Scale deployments as needed:

```bash
kubectl scale deployment api --replicas=3 -n motegao-prod
kubectl scale deployment app --replicas=3 -n motegao-prod
kubectl scale deployment worker --replicas=3 -n motegao-prod
```

## Updates

Update image versions:

```bash
kubectl set image deployment/api api=your-registry/motegao-api:v2 -n motegao-prod
kubectl set image deployment/app app=your-registry/motegao-app:v2 -n motegao-prod
```

## Cleanup

Remove all resources:

```bash
kubectl delete namespace motegao-prod
```

Or remove specific resources:

```bash
kubectl delete -f k8s/
```

## Notes

- **Storage**: Adjust `storageClassName` in PVCs based on your cluster (e.g., `gp2` for AWS, `standard` for GKE)
- **Load Balancer**: The nginx service uses LoadBalancer type. For on-premises clusters, consider using NodePort or Ingress
- **Ingress**: For production, consider using an Ingress controller instead of LoadBalancer
- **Resource limits**: Adjust resource requests/limits based on your workload
- **Secrets**: Use external secret management (e.g., Sealed Secrets, External Secrets Operator) for production
- **Monitoring**: Add Prometheus annotations for monitoring
- **Environment variables**: Review all environment variables from your .env.production file

## Ingress Example (Optional)

If you want to use Ingress instead of LoadBalancer:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: motegao-ingress
  namespace: motegao-prod
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: motegao.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nginx
                port:
                  number: 80
```
