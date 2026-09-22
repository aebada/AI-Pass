# Security Policy

## Supported versions

Security fixes are applied on the default branch (`main`) of
[aebada/AI-Pass](https://github.com/aebada/AI-Pass).

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Email **info@aipass.space** with:

- A short description of the issue
- Steps to reproduce or a proof of concept (if available)
- Impact assessment (what an attacker could do)
- Your preferred contact method and disclosure timeline

We aim to acknowledge reports within **7 days** and to provide a status update
within **14 days**.

## Safe harbor

We welcome good-faith research. Do not access or modify data that is not yours,
do not disrupt production services (including [aipass.space](https://aipass.space)),
and do not publicly disclose the issue until we have confirmed a fix or agreed
on a disclosure date.

## Secrets in contributions

Never commit API keys, OAuth secrets, FTP passwords, or `.env` files. Use the
`*.example` templates only. If you accidentally commit a secret, rotate it
immediately and notify maintainers.
