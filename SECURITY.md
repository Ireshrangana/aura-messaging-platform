# Security Policy

## Supported Use

This repository is a product foundation and demo workspace. Treat it as development software unless you have completed your own production hardening, infrastructure review, and secret management setup.

## Sensitive Data Rules

Never commit:

- real API keys
- real JWT or OTP secrets
- production database URLs
- private certificates or key files
- customer data
- exported session data

Only `.env.example` should remain in version control.

## Responsible Publishing Checklist

Before pushing this repository to a public remote:

1. Confirm `.env`, `.env.local`, and environment-local files are absent
2. Confirm no private keys or certificate files exist in the repo
3. Review git status carefully before each commit
4. Rotate any credential that may have been exposed previously in local development

## Reporting

If you discover a security issue in this project, do not publish sensitive exploit details in a public issue. Share a private report with the repository owner or internal maintainer instead.
