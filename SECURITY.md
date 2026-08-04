# Security

AI-Pass takes the security of the platform and customer data seriously.

## Reporting a vulnerability

Please email **security@ai-pass.com** with:

- A description of the issue and potential impact  
- Steps to reproduce (proof-of-concept if available)  
- Affected component or URL, if known  

Do not open public GitHub issues for security-sensitive reports.

We aim to acknowledge reports within a few business days and will coordinate disclosure once a fix is available.

## Practice (high level)

- Authentication and session handling via the Laravel auth service (`services/auth-api`)  
- Membership and wallet controls for usage and feature access  
- Trust Engine and governance modules for certification, inventory, and policy workflows  
- Prefer environment variables / secret stores for API keys — never commit credentials  

For architecture context, see [docs/AUTH.md](./docs/AUTH.md) and [docs/TRUST-ENGINE.md](./docs/TRUST-ENGINE.md).
