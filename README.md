# SecureScope

SecureScope is a lightweight passive website vulnerability scanner that helps you review a public website's security posture without running exploit attempts. It checks common website hardening issues, calculates a security score, groups findings by severity and owner category, and generates clear remediation guidance that can be shared with clients or internal teams.

## What SecureScope Checks

- HTTPS and redirect behavior
- TLS certificate details and expiry window
- Security headers such as HSTS, CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and Permissions-Policy
- Cookie flags including Secure, HttpOnly, and SameSite
- Mixed content and insecure form signals
- Public metadata files such as robots.txt, sitemap.xml, and security.txt
- Technology disclosure headers
- Optional same-domain page crawling
- Redirect chain and response timing

## Key Features

- Passive scanning only: no exploitation, brute force, authentication bypass, or intrusive testing
- Modern light-theme SaaS dashboard UI
- Large security score summary with risk explanation
- Severity metrics for critical, high, medium, low, and info findings
- Owner categories for server, frontend, backend, metadata, and DNS/email-related work
- Top recommendations ranked by impact
- Accordion findings with evidence, risk explanation, fix steps, and code examples
- Severity and category filters
- Downloadable HTML report with detailed remediation guidance
- JSON export for developers or automation workflows
- Separate SEO-friendly landing page at `/landing.html`

## Pages

- `/` - scanner app and report dashboard
- `/landing.html` - marketing landing page for the scanner
- `/api/scan` - backend scan API route

## Local Setup

Install Node.js 18 or newer, then run:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

Landing page:

```text
http://localhost:3000/landing.html
```

## Useful Commands

```bash
npm start
npm run check
```

## Project Structure

```text
public/
  app.js          Scanner frontend logic and report rendering
  index.html     Scanner dashboard page
  landing.html   SEO landing page
  landing.css    Landing page styles
  styles.css     Scanner dashboard styles
server.js        Node.js HTTP server and passive scanner API
package.json     App metadata and scripts
```

## Safety Notes

Only scan websites you own or have explicit permission to test. SecureScope blocks private and local network targets and is designed for passive checks, but responsible authorization is still required.

## SEO Focus

SecureScope is optimized around these search intents:

- website vulnerability scanner
- passive website security scanner
- security headers checker
- HTTPS and TLS scanner
- cookie security audit
- website security report tool
- website security posture review

## License

Add your preferred license before publishing for public reuse.
