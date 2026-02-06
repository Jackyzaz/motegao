# SSL Setup Guide for Kubernetes

This guide explains how to set up SSL/TLS for your Motegao Kubernetes deployment.

## Option 1: Using Your Own SSL Certificates

If you already have SSL certificates (e.g., from Let's Encrypt, DigiCert, etc.):

### 1. Create the SSL Secret

Replace the placeholder content in `nginx-ssl-secret.yaml` with your actual certificates:

```bash
# If you have certificate files
kubectl create secret tls nginx-ssl-certs \
  --cert=/path/to/fullchain.pem \
  --key=/path/to/privkey.pem \
  -n motegao-prod
```

Or edit the `nginx-ssl-secret.yaml` file and paste your certificate content.

### 2. Deploy SSL-enabled Nginx

```bash
kubectl apply -f k8s/nginx-ssl-configmap.yaml
kubectl apply -f k8s/nginx-ssl-deployment.yaml
```

## Option 2: Self-Signed Certificate (Development/Testing)

For testing purposes, generate a self-signed certificate:

```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt \
  -subj "/CN=localhost/O=Motegao"

# Create secret from generated files
kubectl create secret tls nginx-ssl-certs \
  --cert=tls.crt \
  --key=tls.key \
  -n motegao-prod

# Deploy
kubectl apply -f k8s/nginx-ssl-configmap.yaml
kubectl apply -f k8s/nginx-ssl-deployment.yaml
```

## Option 3: Using Cert-Manager with Let's Encrypt (Production Recommended)

### 1. Install Cert-Manager

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml
```

### 2. Create ClusterIssuer for Let's Encrypt

```bash
kubectl apply -f k8s/cert-manager-issuer.yaml
```

### 3. Deploy with Cert-Manager

The cert-manager will automatically provision and renew certificates.

```bash
kubectl apply -f k8s/nginx-ssl-certmanager-deployment.yaml
```

## Verification

Check that the SSL service is running:

```bash
kubectl get svc nginx-ssl -n motegao-prod
```

Get the external IP:

```bash
kubectl get svc nginx-ssl -n motegao-prod -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

Test SSL connection:

```bash
# HTTP (should redirect to HTTPS)
curl -I http://<EXTERNAL-IP>

# HTTPS
curl -k https://<EXTERNAL-IP>
```

## Certificate Renewal

### Manual Certificates

You'll need to manually renew and update the secret:

```bash
kubectl create secret tls nginx-ssl-certs \
  --cert=/path/to/new/fullchain.pem \
  --key=/path/to/new/privkey.pem \
  -n motegao-prod \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart nginx to pick up new certs
kubectl rollout restart deployment/nginx-ssl -n motegao-prod
```

### Cert-Manager

Automatic renewal happens 30 days before expiration.

## Security Considerations

1. **Never commit real certificates to git** - Use secret management tools
2. **Use strong TLS protocols** - The config uses TLSv1.2 and TLSv1.3
3. **Update secrets securely** - Use `kubectl create secret` instead of committing to YAML
4. **Monitor certificate expiration** - Set up alerts for certificate expiry

## Switching from HTTP to HTTPS

If you deployed the non-SSL version first:

```bash
# Remove old nginx deployment
kubectl delete deployment nginx -n motegao-prod
kubectl delete svc nginx -n motegao-prod

# Deploy SSL version
kubectl apply -f k8s/nginx-ssl-configmap.yaml
kubectl apply -f k8s/nginx-ssl-secret.yaml
kubectl apply -f k8s/nginx-ssl-deployment.yaml
```

## Troubleshooting

Check nginx logs:

```bash
kubectl logs -f deployment/nginx-ssl -n motegao-prod
```

Verify certificate is mounted:

```bash
kubectl exec -it deployment/nginx-ssl -n motegao-prod -- ls -la /etc/nginx/ssl/
```

Test nginx config:

```bash
kubectl exec -it deployment/nginx-ssl -n motegao-prod -- nginx -t
```
