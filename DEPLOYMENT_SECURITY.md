# Deployment Security Best Practices

## Critical Security Issues Addressed

This document outlines the security improvements made to the deployment scripts.

### 1. Credentials Management

**Problem:** Sensitive credentials (Supabase keys, JWT secrets, API keys) were committed to version control.

**Solution:**
- All sensitive files removed from repository
- Example templates created (`.example` suffix)
- `.gitignore` updated to prevent accidental commits
- Environment-based configuration using `.deploy.env` file

**Files to configure before deployment:**
1. Copy `.deploy.env.example` to `.deploy.env` and fill in your values
2. Copy `apps/web/.env.example` to `apps/web/.env` with your configuration
3. Copy `scripts/ENV_VARS_VPS.sh.example` to `scripts/ENV_VARS_VPS.sh` on your VPS
4. Copy `.cursor/mcp.json.example` to `.cursor/mcp.json` if using Cursor IDE

### 2. SSH Host Key Verification

**Problem:** Scripts disabled SSH host key verification (`StrictHostKeyChecking=no`, `-AcceptKey`), making them vulnerable to man-in-the-middle attacks.

**Why this is dangerous:**
- Attackers can impersonate your VPS
- Deployment artifacts (including secrets) could be intercepted
- Commands could be executed on attacker-controlled servers

**Solution:**
- Remove `StrictHostKeyChecking=no` from all SSH/SCP commands
- Remove `-AcceptKey` flag from PowerShell SSH sessions
- Add manual trust step for initial host key verification
- Subsequent connections will verify against known host key

**Updated workflow:**
1. First connection: Manually verify host key fingerprint
2. Host key stored in `~/.ssh/known_hosts`
3. Future connections automatically verified against stored key

### 3. PowerShell Module Security

**Problem:** `Posh-SSH` module installed with `-SkipPublisherCheck`, allowing unsigned/unverified code execution.

**Solution:**
- Pin to specific version: `Posh-SSH` version 3.0.8
- Remove `-SkipPublisherCheck` flag
- Verify publisher signature before installation
- Document manual installation if signature verification fails

### 4. Authentication at Startup

**Problem:** API silently disabled authentication if `JWT_SECRET` was not configured.

**Solution:**
- Application now fails fast at startup if `JWT_SECRET` is missing
- Logs critical error message
- Prevents accidental deployment without authentication
- Forces explicit configuration

## Pre-Deployment Checklist

Before running any deployment scripts:

- [ ] Copy all `.example` files and configure with actual values
- [ ] Verify `.gitignore` excludes all sensitive files
- [ ] Ensure `JWT_SECRET` and `SUPABASE_SERVICE_KEY` are set
- [ ] Verify SSH key is generated and added to VPS
- [ ] Manually verify VPS host key fingerprint on first connection
- [ ] Test authentication endpoint after deployment
- [ ] Rotate any credentials that were previously exposed

## Credential Rotation

If credentials were previously committed to Git history:

1. **Immediately rotate:**
   - Supabase service role key (in Supabase dashboard)
   - JWT secret (generate new secret)
   - Hostinger API tokens (regenerate in control panel)

2. **Consider:**
   - Changing VPS root password
   - Regenerating SSH keys
   - Reviewing Git history for other sensitive data

3. **Clean Git history** (optional, advanced):
   - Use tools like `git-filter-repo` or `BFG Repo-Cleaner`
   - Force push cleaned history (breaks others' clones)
   - Notify all contributors

## Monitoring

After deployment:

1. Monitor Supabase logs for unauthorized access
2. Check API logs for authentication failures
3. Review VPS auth logs: `sudo tail -f /var/log/auth.log`
4. Set up alerts for failed authentication attempts

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [SSH Security Best Practices](https://www.ssh.com/academy/ssh/security)
- [Git Secret Management](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Supabase Security](https://supabase.com/docs/guides/platform/going-into-prod)

## Contact

For security concerns, please file an issue or contact the repository maintainers privately.
