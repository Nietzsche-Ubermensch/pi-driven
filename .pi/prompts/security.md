---
description: Run a security audit on the codebase for common vulnerabilities
argument-hint: "[scope]"
---
Run a security audit on $ARGUMENTS (or the entire codebase if not specified). Check for:

## OWASP Top 10
- Broken access control (missing auth checks, direct object references)
- Cryptographic failures (hardcoded keys, weak algorithms)
- Injection (SQL, NoSQL, command, LDAP, XPath)
- Insecure design (missing rate limiting, no input validation)
- Security misconfiguration (debug enabled, default credentials)
- Vulnerable components (outdated dependencies)

## Secrets & Credentials
- Hardcoded API keys, tokens, passwords
- Secrets in config files or environment variables
- Private keys or certificates in source

## Data Protection
- PII exposure in logs or error messages
- Missing encryption for sensitive data
- Insecure data storage

## Dependencies
- Known CVEs in package.json
- Unmaintained or deprecated packages
- Supply chain risks

For each finding, provide: severity (CRITICAL/HIGH/MEDIUM/LOW), location, description, and remediation.
