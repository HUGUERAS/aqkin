# Security Policy

## Supported Versions

This project follows semantic versioning. Security updates are provided for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest | :x:               |

## Security Best Practices

### 1. Firewall Configuration

**All VPS deployments MUST have a properly configured firewall.**

#### Required Firewall Rules (UFW)

Use the provided firewall configuration script:

```bash
# Automatic configuration (recommended)
sudo bash scripts/configure-firewall.sh

# Manual configuration
sudo ufw allow 22/tcp  # SSH - Remote access
sudo ufw allow 80/tcp  # HTTP - Web traffic
sudo ufw allow 443/tcp # HTTPS - Secure web traffic
sudo ufw enable
```

**Important Notes:**
- ⚠️ **Always allow SSH (port 22) BEFORE enabling the firewall** to prevent lockout
- Port 8000 (API) should **never** be exposed directly; use Nginx as a reverse proxy
- Use `ufw status verbose` to verify configuration
- Enable automatic security updates: `apt install unattended-upgrades`

#### Verification

After configuration, verify your firewall is working:

```bash
# Check firewall status
sudo ufw status verbose

# Test from another machine
nc -zv YOUR_SERVER_IP 80
nc -zv YOUR_SERVER_IP 443
nc -zv YOUR_SERVER_IP 8000  # Should fail (not exposed)
```

### 2. Environment Variables

**Never commit sensitive environment variables to version control.**

- Use `.env` files (already gitignored)
- Store production secrets in secure vault (Azure Key Vault, AWS Secrets Manager)
- Rotate secrets regularly (JWT_SECRET, database passwords, API keys)
- Use strong, random values: `openssl rand -base64 32`

### 3. HTTPS/SSL Configuration

**Always use HTTPS in production.**

```bash
# Automatic SSL with Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 4. Database Security

- Always use `sslmode=require` for PostgreSQL connections
- Use strong database passwords (minimum 16 characters)
- Restrict database access to specific IPs when possible
- Enable PostGIS only if geospatial features are needed
- Regular database backups (automated)

### 5. API Security

- JWT tokens should expire (default: 30 minutes)
- Implement rate limiting in production
- Validate all user inputs (already implemented with Pydantic)
- Use parameterized queries (SQLAlchemy handles this)
- Keep dependencies updated

### 6. Regular Security Maintenance

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Check for security updates
sudo apt list --upgradable

# Review firewall logs
sudo tail -f /var/log/ufw.log

# Check failed SSH attempts
sudo grep "Failed password" /var/log/auth.log
```

## Reporting a Vulnerability

If you discover a security vulnerability, please follow responsible disclosure:

1. **DO NOT** open a public GitHub issue
2. Email security concerns to: security@ativoreal.com (or open a private security advisory on GitHub)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

We will respond within 48 hours and work with you to:
- Verify the vulnerability
- Develop a fix
- Coordinate disclosure timeline
- Credit you for the discovery (if desired)

## Security Checklist for Deployment

Before going to production, verify:

- [ ] Firewall configured (ports 22, 80, 443 only)
- [ ] HTTPS/SSL enabled with valid certificate
- [ ] All `.env` files have secure, random secrets
- [ ] Database uses SSL connection
- [ ] Database passwords are strong (16+ characters)
- [ ] SSH keys used instead of password authentication
- [ ] System packages are up to date
- [ ] Automatic security updates enabled
- [ ] Regular backup schedule configured
- [ ] Monitoring/alerting configured
- [ ] Rate limiting enabled on API endpoints
- [ ] CORS configured properly (not `*` in production)

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security Guide](https://fastapi.tiangolo.com/tutorial/security/)
- [UFW Documentation](https://help.ubuntu.com/community/UFW)
- [Let's Encrypt](https://letsencrypt.org/)

