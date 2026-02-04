# 🔥 Firewall Configuration Guide

## Overview

This guide explains how to properly configure the firewall for the Ativo Real application on a VPS (Virtual Private Server). A properly configured firewall is **critical** for security.

## Why Firewall Configuration is Important

Without a firewall:
- ❌ All ports are exposed to the internet
- ❌ Attackers can directly access your API on port 8000
- ❌ Vulnerable services can be exploited
- ❌ Higher risk of unauthorized access

With a properly configured firewall:
- ✅ Only necessary ports are accessible
- ✅ Internal services are protected
- ✅ Reduced attack surface
- ✅ Better security posture

## Quick Start

### Automatic Configuration (Recommended)

```bash
# On your VPS server
curl -sSL https://raw.githubusercontent.com/HUGUERAS/aqkin/main/scripts/configure-firewall.sh -o configure-firewall.sh
chmod +x configure-firewall.sh
sudo bash configure-firewall.sh
```

This script will:
1. Install UFW (Uncomplicated Firewall) if needed
2. Configure default policies (deny incoming, allow outgoing)
3. Allow SSH (22), HTTP (80), and HTTPS (443)
4. Enable the firewall
5. Display the configuration

### Manual Configuration

If you prefer manual setup:

```bash
# 1. Install UFW
sudo apt update
sudo apt install -y ufw

# 2. Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 3. Allow SSH (CRITICAL: do this first!)
sudo ufw allow 22/tcp comment 'SSH'

# 4. Allow web traffic
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# 5. Enable firewall
sudo ufw --force enable

# 6. Verify configuration
sudo ufw status verbose
```

## Port Configuration Explained

### Ports That Should Be Open

| Port | Protocol | Service | Why Open? |
|------|----------|---------|-----------|
| 22   | TCP      | SSH     | Remote server access |
| 80   | TCP      | HTTP    | Web traffic (redirects to HTTPS) |
| 443  | TCP      | HTTPS   | Secure web traffic |

### Ports That Should NOT Be Open

| Port | Protocol | Service | Why Closed? |
|------|----------|---------|-------------|
| 8000 | TCP      | FastAPI | Direct API access should use Nginx proxy |
| 5432 | TCP      | PostgreSQL | Database should not be exposed (use Supabase) |
| 3000 | TCP      | Dev Server | Development only, never production |

**Important:** Port 8000 (FastAPI) is accessed **only** through Nginx reverse proxy on localhost. This provides:
- SSL/TLS termination
- Rate limiting
- Request filtering
- Better security

## Default Policies

```bash
# Deny all incoming connections by default
sudo ufw default deny incoming

# Allow all outgoing connections
sudo ufw default allow outgoing
```

This "deny by default" approach is secure because:
- Only explicitly allowed services are accessible
- New services won't accidentally be exposed
- Reduces attack surface

## Common Commands

### View Firewall Status

```bash
# Basic status
sudo ufw status

# Verbose status with details
sudo ufw status verbose

# Numbered list (useful for deleting rules)
sudo ufw status numbered
```

### Add Rules

```bash
# Allow specific port
sudo ufw allow 80/tcp

# Allow with comment
sudo ufw allow 443/tcp comment 'HTTPS'

# Allow from specific IP
sudo ufw allow from 192.168.1.100 to any port 22

# Allow port range
sudo ufw allow 6000:6010/tcp
```

### Delete Rules

```bash
# View numbered rules
sudo ufw status numbered

# Delete by number
sudo ufw delete 3

# Delete by rule specification
sudo ufw delete allow 8080/tcp
```

### Enable/Disable/Reload

```bash
# Enable firewall
sudo ufw enable

# Disable firewall (not recommended)
sudo ufw disable

# Reload rules without disconnecting
sudo ufw reload

# Reset all rules (careful!)
sudo ufw reset
```

## Verification

After configuring the firewall, verify it's working:

### From Inside the Server

```bash
# Check UFW status
sudo ufw status verbose

# Test localhost API access (should work)
curl localhost:8000

# Check which processes are listening
sudo netstat -tulpn | grep LISTEN
```

### From Another Computer

```bash
# Test HTTP (should work)
nc -zv YOUR_SERVER_IP 80

# Test HTTPS (should work)
nc -zv YOUR_SERVER_IP 443

# Test direct API access (should fail - this is good!)
nc -zv YOUR_SERVER_IP 8000

# Or use curl
curl http://YOUR_SERVER_IP
curl https://YOUR_SERVER_IP
```

## Troubleshooting

### Problem: Locked Out After Enabling Firewall

**Prevention:**
Always allow SSH (port 22) **before** enabling the firewall:

```bash
sudo ufw allow 22/tcp
sudo ufw enable
```

**Solution (if you still have console access):**
```bash
# Access via VPS console (not SSH)
sudo ufw disable
sudo ufw allow 22/tcp
sudo ufw enable
```

### Problem: Website Not Loading

**Check firewall:**
```bash
sudo ufw status | grep -E '80|443'
```

**Should see:**
```
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

**Fix:**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

### Problem: API Returns 502 Bad Gateway

This is usually **not** a firewall issue. Check:

```bash
# Is the API service running?
systemctl status ativo-real-api

# Is it listening on port 8000?
sudo netstat -tulpn | grep 8000

# Check API logs
journalctl -u ativo-real-api -f

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

### Problem: Firewall Rules Not Taking Effect

```bash
# Reload UFW
sudo ufw reload

# Or restart UFW service
sudo systemctl restart ufw

# Check if UFW is active
sudo ufw status
```

## Integration with Deploy Scripts

The firewall configuration is automatically included in:

1. **scripts/deploy-hostinger.sh** - Full deployment with firewall
2. **scripts/deploy-completo.sh** - Complete deployment
3. **scripts/configure-firewall.sh** - Standalone firewall setup

When you run the deploy scripts, the firewall is configured automatically.

## Security Best Practices

### DO ✅

- ✅ Always allow SSH (port 22) before enabling firewall
- ✅ Use `sudo ufw status verbose` to verify configuration
- ✅ Document any custom firewall rules
- ✅ Test firewall from outside the server
- ✅ Keep firewall logs for security monitoring
- ✅ Review firewall rules periodically
- ✅ Use comments for rules: `ufw allow 80/tcp comment 'HTTP'`

### DON'T ❌

- ❌ Disable the firewall in production
- ❌ Open port 8000 to the internet (use Nginx proxy)
- ❌ Use `allow from any to any` (defeats the purpose)
- ❌ Forget to enable the firewall after configuration
- ❌ Open unnecessary ports "just in case"
- ❌ Ignore firewall logs

## Advanced Configuration

### Rate Limiting

UFW supports rate limiting to prevent brute force attacks:

```bash
# Limit SSH connections (max 6 attempts in 30 seconds)
sudo ufw limit 22/tcp
```

### IP-Based Rules

```bash
# Allow from specific IP
sudo ufw allow from 192.168.1.100

# Allow from subnet
sudo ufw allow from 192.168.1.0/24

# Deny from specific IP
sudo ufw deny from 203.0.113.100
```

### Application Profiles

```bash
# List available profiles
sudo ufw app list

# Allow Nginx profile
sudo ufw allow 'Nginx Full'

# View profile details
sudo ufw app info 'Nginx Full'
```

## Monitoring and Logs

### Enable Logging

```bash
# Enable logging
sudo ufw logging on

# Set log level (low, medium, high, full)
sudo ufw logging medium
```

### View Logs

```bash
# View recent firewall logs
sudo tail -f /var/log/ufw.log

# Search for blocked connections
sudo grep '\[UFW BLOCK\]' /var/log/ufw.log

# Count blocked attempts from IP
sudo grep '203.0.113.100' /var/log/ufw.log | wc -l
```

## Related Documentation

- [DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md) - VPS deployment guide
- [SECURITY.md](SECURITY.md) - Security policies and best practices
- [scripts/configure-firewall.sh](scripts/configure-firewall.sh) - Automated configuration script

## Additional Resources

- [UFW Community Documentation](https://help.ubuntu.com/community/UFW)
- [UFW Manual Page](http://manpages.ubuntu.com/manpages/focal/man8/ufw.8.html)
- [DigitalOcean UFW Essentials](https://www.digitalocean.com/community/tutorials/ufw-essentials-common-firewall-rules-and-commands)
