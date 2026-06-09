const http = require("node:http");
const https = require("node:https");
const dns = require("node:dns").promises;
const fs = require("node:fs");
const path = require("node:path");
const tls = require("node:tls");
const { URL } = require("node:url");

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, "public");
const MAX_BODY_BYTES = 512 * 1024;
const MAX_REDIRECTS = 5;
const MAX_CRAWL_PAGES = 6;
const REQUEST_TIMEOUT_MS = 6500;
const SCAN_TIMEOUT_MS = 28000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    "cache-control": "no-store"
  });
  res.end(body);
}

function errorMessage(error) {
  if (!error) return "Scan failed.";
  if (error.message) return error.message;
  if (error.code) return `Network request failed with ${error.code}.`;
  if (Array.isArray(error.errors) && error.errors.length) {
    return error.errors.map((item) => item.message || item.code).filter(Boolean).join("; ");
  }
  return "Scan failed. The target may be unreachable from this server.";
}

function normalizeUrl(input) {
  const raw = String(input || "").trim();
  if (!raw) {
    throw new Error("Enter a URL to scan.");
  }

  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  const url = new URL(withScheme);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https URLs can be scanned.");
  }
  if (!url.hostname || url.username || url.password) {
    throw new Error("Use a normal website URL without credentials.");
  }
  return url;
}

function isPrivateIp(address) {
  if (address === "::1" || address === "127.0.0.1" || address === "0.0.0.0") return true;
  if (address.startsWith("10.") || address.startsWith("127.") || address.startsWith("169.254.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(address)) return true;
  if (address.startsWith("192.168.")) return true;
  if (address.startsWith("fc") || address.startsWith("fd") || address.startsWith("fe80:")) return true;
  if (address === "::" || address.startsWith("::ffff:127.")) return true;
  return false;
}

async function resolvePublicHost(hostname) {
  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!records.length) {
    throw new Error("The hostname did not resolve to an IP address.");
  }

  const blocked = records.find((record) => isPrivateIp(record.address));
  if (blocked) {
    throw new Error("Scanning private, local, or internal network targets is blocked.");
  }

  return records;
}

function requestUrl(targetUrl, method = "GET") {
  return new Promise((resolve, reject) => {
    const client = targetUrl.protocol === "https:" ? https : http;
    let settled = false;
    const req = client.request(
      targetUrl,
      {
        method,
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
          "user-agent": "ZCS-Passive-Security-Scanner/1.0",
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      },
      (response) => {
        const chunks = [];
        let size = 0;

        response.on("data", (chunk) => {
          if (settled) return;
          size += chunk.length;
          if (size <= MAX_BODY_BYTES) {
            chunks.push(chunk);
          } else {
            settled = true;
            resolve({
              statusCode: response.statusCode || 0,
              headers: response.headers,
              body: Buffer.concat(chunks).toString("utf8"),
              truncated: true
            });
            req.destroy();
          }
        });

        response.on("end", () => {
          if (settled) return;
          settled = true;
          resolve({
            statusCode: response.statusCode || 0,
            headers: response.headers,
            body: method === "HEAD" ? "" : Buffer.concat(chunks).toString("utf8"),
            truncated: size > MAX_BODY_BYTES
          });
        });
      }
    );

    req.on("timeout", () => req.destroy(new Error("The website did not respond before the timeout.")));
    req.on("error", (error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    });
    req.end();
  });
}

async function fetchWithRedirects(startUrl) {
  const redirects = [];
  let current = startUrl;

  for (let i = 0; i <= MAX_REDIRECTS; i += 1) {
    await resolvePublicHost(current.hostname);
    const response = await requestUrl(current);
    const location = response.headers.location;
    const isRedirect = [301, 302, 303, 307, 308].includes(response.statusCode);

    if (!isRedirect || !location) {
      return { finalUrl: current, response, redirects };
    }

    const next = new URL(Array.isArray(location) ? location[0] : location, current);
    if (!["http:", "https:"].includes(next.protocol)) {
      throw new Error("Redirected to an unsupported URL scheme.");
    }

    redirects.push({
      from: current.toString(),
      to: next.toString(),
      statusCode: response.statusCode
    });
    current = next;
  }

  throw new Error("The website redirected too many times.");
}

function getHeader(headers, name) {
  const value = headers[name.toLowerCase()];
  return Array.isArray(value) ? value.join("; ") : value || "";
}

function addFinding(findings, severity, title, detail, recommendation, page) {
  findings.push({ severity, title, detail, recommendation, page });
}

function analyzeHeaders(originalUrl, finalUrl, response, redirects) {
  const headers = response.headers;
  const findings = [];
  const checks = [];

  const headerChecks = [
    {
      name: "Strict-Transport-Security",
      key: "strict-transport-security",
      severity: "high",
      applies: finalUrl.protocol === "https:",
      recommendation: "Add HSTS with a long max-age and includeSubDomains after confirming all subdomains support HTTPS."
    },
    {
      name: "Content-Security-Policy",
      key: "content-security-policy",
      severity: "high",
      applies: true,
      recommendation: "Add a restrictive CSP that limits script, style, frame, image, and connection sources."
    },
    {
      name: "X-Content-Type-Options",
      key: "x-content-type-options",
      severity: "medium",
      applies: true,
      recommendation: "Set X-Content-Type-Options to nosniff."
    },
    {
      name: "X-Frame-Options or CSP frame-ancestors",
      key: "x-frame-options",
      alternate: "content-security-policy",
      severity: "medium",
      applies: true,
      recommendation: "Use X-Frame-Options: DENY/SAMEORIGIN or a CSP frame-ancestors directive."
    },
    {
      name: "Referrer-Policy",
      key: "referrer-policy",
      severity: "low",
      applies: true,
      recommendation: "Set a privacy-aware policy such as strict-origin-when-cross-origin."
    },
    {
      name: "Permissions-Policy",
      key: "permissions-policy",
      severity: "low",
      applies: true,
      recommendation: "Restrict powerful browser features with a Permissions-Policy header."
    }
  ];

  for (const check of headerChecks) {
    if (!check.applies) continue;
    const primary = getHeader(headers, check.key);
    const alternate = check.alternate ? getHeader(headers, check.alternate) : "";
    const passed = Boolean(primary) || (check.alternate === "content-security-policy" && /frame-ancestors/i.test(alternate));
    checks.push({ label: check.name, passed, value: primary || alternate || "Missing" });

    if (!passed) {
      addFinding(
        findings,
        check.severity,
        `Missing ${check.name}`,
        "The response does not include this defensive browser security control.",
        check.recommendation
      );
    }
  }

  if (originalUrl.protocol === "http:" && finalUrl.protocol !== "https:") {
    addFinding(
      findings,
      "critical",
      "Website did not upgrade to HTTPS",
      "The scan started on HTTP and the final response was still not encrypted.",
      "Redirect all HTTP traffic to HTTPS and serve the site with a valid TLS certificate."
    );
  }

  const serverHeader = getHeader(headers, "server");
  const poweredBy = getHeader(headers, "x-powered-by");
  if (serverHeader || poweredBy) {
    addFinding(
      findings,
      "low",
      "Technology disclosure headers present",
      `Server exposed: ${[serverHeader, poweredBy].filter(Boolean).join(" / ")}`,
      "Remove or reduce version-identifying Server and X-Powered-By headers."
    );
  }

  return { findings, checks, redirects };
}

function analyzeCookies(headers, finalUrl) {
  const cookies = headers["set-cookie"] || [];
  const values = Array.isArray(cookies) ? cookies : [cookies];
  const findings = [];
  const details = values.map((cookie) => {
    const name = String(cookie).split("=")[0];
    const secure = /;\s*secure\b/i.test(cookie);
    const httpOnly = /;\s*httponly\b/i.test(cookie);
    const sameSite = /;\s*samesite=(strict|lax|none)\b/i.test(cookie);

    if (finalUrl.protocol === "https:" && !secure) {
      addFinding(findings, "medium", `Cookie "${name}" missing Secure`, "This cookie can be sent over unencrypted HTTP if the browser is directed there.", "Set the Secure attribute on cookies served over HTTPS.");
    }
    if (!httpOnly) {
      addFinding(findings, "medium", `Cookie "${name}" missing HttpOnly`, "Client-side scripts may be able to read this cookie.", "Set HttpOnly on session and sensitive cookies.");
    }
    if (!sameSite) {
      addFinding(findings, "low", `Cookie "${name}" missing SameSite`, "The cookie has no explicit cross-site request behavior.", "Set SameSite=Lax or SameSite=Strict unless cross-site use is required.");
    }

    return { name, secure, httpOnly, sameSite };
  });

  return { cookieCount: values.length, cookies: details, findings };
}

function analyzeHtml(body, finalUrl) {
  const findings = [];
  const html = body || "";

  if (finalUrl.protocol === "https:" && /\b(?:src|href|action)=["']http:\/\//i.test(html)) {
    addFinding(
      findings,
      "medium",
      "Possible mixed content",
      "The HTML references at least one HTTP resource from an HTTPS page.",
      "Load scripts, styles, images, and form actions through HTTPS."
    );
  }

  if (/<input[^>]+type=["']?password/i.test(html) && finalUrl.protocol !== "https:") {
    addFinding(
      findings,
      "critical",
      "Password field served over HTTP",
      "A password input was detected on a page that is not encrypted.",
      "Serve login and account pages only over HTTPS."
    );
  }

  const postForms = html.match(/<form\b[^>]*method=["']?post["']?[^>]*>/gi) || [];
  if (postForms.length && !/(csrf|xsrf|authenticity_token|nonce)/i.test(html)) {
    addFinding(
      findings,
      "medium",
      "POST form without obvious CSRF token",
      `${postForms.length} POST form(s) were found, but no common CSRF token name was detected.`,
      "Verify state-changing forms include server-side CSRF protection."
    );
  }

  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) {
    addFinding(
      findings,
      "info",
      "Missing viewport meta tag",
      "The page may not render well on mobile devices.",
      "Add a responsive viewport meta tag."
    );
  }

  return findings;
}

function calculateScore(findings) {
  const uniqueWeights = { critical: 24, high: 13, medium: 7, low: 3, info: 1 };
  const repeatWeights = { critical: 4, high: 2, medium: 1, low: 0.5, info: 0 };
  const seen = new Set();
  let penalty = 0;

  for (const finding of findings) {
    const key = `${finding.severity}:${finding.title}`;
    if (seen.has(key)) {
      penalty += repeatWeights[finding.severity] || 0;
    } else {
      penalty += uniqueWeights[finding.severity] || 0;
      seen.add(key);
    }
  }

  return Math.max(0, Math.min(100, 100 - penalty));
}

async function inspectTls(finalUrl) {
  if (finalUrl.protocol !== "https:") return null;

  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: finalUrl.hostname,
        port: Number(finalUrl.port || 443),
        servername: finalUrl.hostname,
        timeout: REQUEST_TIMEOUT_MS
      },
      () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        if (!cert || !cert.valid_to) {
          resolve(null);
          return;
        }
        const expiresAt = new Date(cert.valid_to);
        resolve({
          subject: cert.subject?.CN || finalUrl.hostname,
          issuer: cert.issuer?.O || cert.issuer?.CN || "Unknown",
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          daysRemaining: Math.ceil((expiresAt.getTime() - Date.now()) / 86400000)
        });
      }
    );

    socket.on("timeout", () => {
      socket.destroy();
      resolve(null);
    });
    socket.on("error", () => resolve(null));
  });
}

function extractTitle(html) {
  const match = String(html || "").match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, " ").trim().slice(0, 160) : "";
}

function extractLinks(html, baseUrl) {
  const links = new Set();
  const source = String(html || "");
  const re = /<a\b[^>]+href=["']([^"']+)["']/gi;
  let match;

  while ((match = re.exec(source))) {
    try {
      const next = new URL(match[1], baseUrl);
      next.hash = "";
      if (next.protocol === baseUrl.protocol && next.hostname === baseUrl.hostname) {
        links.add(next.toString());
      }
    } catch {
      // Ignore malformed links.
    }
  }

  return [...links];
}

function detectTechnologies(headers, html) {
  const technologies = new Set();
  const headerText = JSON.stringify(headers).toLowerCase();
  const source = String(html || "").toLowerCase();

  const tests = [
    ["WordPress", /wp-content|wp-includes|wp-json|x-pingback/],
    ["Drupal", /drupal|x-generator[^"]*drupal/],
    ["Joomla", /joomla|\/media\/system\/js\//],
    ["Shopify", /cdn\.shopify|x-shopify|shopify-digital-wallet/],
    ["Wix", /x-wix|wixstatic|wix-code/],
    ["Squarespace", /squarespace|static1\.squarespace/],
    ["Webflow", /webflow|data-wf-page|data-wf-site/],
    ["Next.js", /_next\/static|x-nextjs|next-router/],
    ["React", /react|data-reactroot|__react/],
    ["Vue", /vue(?:\.runtime)?\.js|data-v-|__vue__/],
    ["Angular", /ng-version|angular(?:\.min)?\.js/],
    ["PHP", /x-powered-by[^"]*php|phpsessid/],
    ["ASP.NET", /asp\.net|x-aspnet|\.aspx|aspnet_sessionid/],
    ["Express", /x-powered-by[^"]*express/],
    ["Laravel", /laravel_session|x-powered-by[^"]*laravel/],
    ["Django", /csrftoken|django/],
    ["nginx", /server[^"]*nginx/],
    ["Apache", /server[^"]*apache/],
    ["IIS", /server[^"]*iis|x-powered-by[^"]*asp\.net/],
    ["Cloudflare", /cf-ray|server[^"]*cloudflare|__cf_bm/],
    ["Vercel", /x-vercel|server[^"]*vercel/],
    ["Netlify", /x-nf-request-id|server[^"]*netlify/]
  ];

  for (const [name, pattern] of tests) {
    if (pattern.test(headerText) || pattern.test(source)) technologies.add(name);
  }

  return [...technologies].sort();
}

function summarizeSeverities(findings) {
  return findings.reduce(
    (summary, finding) => {
      summary[finding.severity] = (summary[finding.severity] || 0) + 1;
      return summary;
    },
    { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
  );
}

async function scanSinglePage(originalUrl) {
  const startedAt = Date.now();
  const dnsRecords = await resolvePublicHost(originalUrl.hostname);
  const { finalUrl, response, redirects } = await fetchWithRedirects(originalUrl);

  const headerAnalysis = analyzeHeaders(originalUrl, finalUrl, response, redirects);
  const cookieAnalysis = analyzeCookies(response.headers, finalUrl);
  const htmlFindings = analyzeHtml(response.body, finalUrl);
  const tlsInfo = await inspectTls(finalUrl);
  const tlsFindings = [];

  if (tlsInfo && tlsInfo.daysRemaining < 15) {
    addFinding(tlsFindings, "high", "TLS certificate expires soon", `The certificate expires in ${tlsInfo.daysRemaining} day(s).`, "Renew the certificate and verify automated renewal is working.");
  }

  const findings = [...headerAnalysis.findings, ...cookieAnalysis.findings, ...htmlFindings, ...tlsFindings]
    .map((finding) => ({ ...finding, page: finalUrl.toString() }))
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity));

  return {
    target: originalUrl.toString(),
    finalUrl: finalUrl.toString(),
    title: extractTitle(response.body),
    statusCode: response.statusCode,
    durationMs: Date.now() - startedAt,
    dns: dnsRecords.map((record) => ({ address: record.address, family: record.family })),
    redirects,
    tls: tlsInfo,
    checks: headerAnalysis.checks,
    cookies: cookieAnalysis.cookies,
    findings,
    technologies: detectTechnologies(response.headers, response.body),
    links: extractLinks(response.body, finalUrl),
    bodyTruncated: response.truncated
  };
}

async function scanPublicMetadata(finalUrl) {
  const files = [
    { label: "robots.txt", path: "/robots.txt" },
    { label: "sitemap.xml", path: "/sitemap.xml" },
    { label: "security.txt", path: "/.well-known/security.txt" },
    { label: "root security.txt", path: "/security.txt" }
  ];
  const scannedFiles = await Promise.all(files.map(async (file) => {
    const url = new URL(file.path, finalUrl);
    try {
      await resolvePublicHost(url.hostname);
      const response = await requestUrl(url);
      const body = response.body || "";
      const exists = response.statusCode >= 200 && response.statusCode < 300;
      const item = {
        label: file.label,
        url: url.toString(),
        statusCode: response.statusCode,
        found: exists,
        preview: exists ? body.replace(/\s+/g, " ").trim().slice(0, 260) : ""
      };
      const itemFindings = [];

      if (file.label === "robots.txt" && exists && /(admin|backup|private|secret|staging|test|\.git|config|database|db)/i.test(body)) {
        addFinding(
          itemFindings,
          "low",
          "robots.txt may expose sensitive paths",
          "robots.txt includes path names that look sensitive. This does not prove exposure, but it can guide attackers toward interesting locations.",
          "Avoid listing sensitive administrative, backup, staging, database, or secret paths in robots.txt. Protect sensitive paths with authentication.",
          url.toString()
        );
      }

      if ((file.label === "security.txt" || file.label === "root security.txt") && exists && !/contact:/i.test(body)) {
        addFinding(
          itemFindings,
          "info",
          "security.txt missing Contact field",
          "A security.txt file exists, but a Contact field was not detected.",
          "Add a Contact field so security researchers know where to report vulnerabilities.",
          url.toString()
        );
      }
      return { item, findings: itemFindings };
    } catch (error) {
      return {
        item: {
          label: file.label,
          url: url.toString(),
          statusCode: 0,
          found: false,
          preview: errorMessage(error)
        },
        findings: []
      };
    }
  }));

  const results = scannedFiles.map((entry) => entry.item);
  const findings = scannedFiles.flatMap((entry) => entry.findings);

  if (!results.some((item) => item.label.includes("security.txt") && item.found)) {
    addFinding(
      findings,
      "info",
      "No security.txt policy found",
      "The site does not appear to publish a security.txt vulnerability disclosure contact.",
      "Add /.well-known/security.txt with Contact, Policy, Preferred-Languages, and Expires fields.",
      finalUrl.toString()
    );
  }

  return { files: results, findings };
}

async function crawlSite(homePage, maxPages) {
  const visited = new Set([homePage.finalUrl]);
  const targets = [];
  for (const link of homePage.links) {
    if (targets.length >= maxPages - 1) break;
    if (link !== homePage.finalUrl && !visited.has(link)) {
      visited.add(link);
      targets.push(link);
    }
  }

  const linkedPages = await Promise.all(targets.map(async (nextUrl) => {
    try {
      return await scanSinglePage(new URL(nextUrl));
    } catch (error) {
      return {
        target: nextUrl,
        finalUrl: nextUrl,
        title: "",
        statusCode: 0,
        durationMs: 0,
        dns: [],
        redirects: [],
        tls: null,
        checks: [],
        cookies: [],
        technologies: [],
        links: [],
        bodyTruncated: false,
        findings: [
          {
            severity: "info",
            title: "Linked page could not be scanned",
            detail: errorMessage(error),
            recommendation: "Open the page manually and verify whether it is reachable.",
            page: nextUrl
          }
        ]
      };
    }
  }));

  return [homePage, ...linkedPages];
}

async function scanWebsite(input, options = {}) {
  const startedAt = Date.now();
  const originalUrl = normalizeUrl(input);
  const maxPages = options.crawl ? Math.max(1, Math.min(MAX_CRAWL_PAGES, Number(options.maxPages || 4))) : 1;
  const homePage = await scanSinglePage(originalUrl);
  const pages = maxPages > 1 ? await crawlSite(homePage, maxPages) : [homePage];
  const metadata = await scanPublicMetadata(new URL(homePage.finalUrl));
  const findings = [...pages.flatMap((page) => page.findings), ...metadata.findings]
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
  const technologies = [...new Set(pages.flatMap((page) => page.technologies))].sort();
  const score = calculateScore(findings);

  return {
    target: homePage.target,
    finalUrl: homePage.finalUrl,
    title: homePage.title,
    statusCode: homePage.statusCode,
    scannedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    score,
    severitySummary: summarizeSeverities(findings),
    dns: homePage.dns,
    redirects: homePage.redirects,
    tls: homePage.tls,
    checks: homePage.checks,
    cookies: homePage.cookies,
    technologies,
    metadata: metadata.files,
    pages: pages.map((page) => ({
      url: page.finalUrl,
      title: page.title,
      statusCode: page.statusCode,
      findings: page.findings.length,
      linksFound: page.links.length,
      truncated: page.bodyTruncated
    })),
    findings,
    bodyTruncated: pages.some((page) => page.bodyTruncated)
  };
}

function severityRank(severity) {
  return { critical: 0, high: 1, medium: 2, low: 3, info: 4 }[severity] ?? 5;
}

function withTimeout(promise, milliseconds, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), milliseconds);
    })
  ]);
}

function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "content-type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream",
      "cache-control": "no-cache"
    });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/scan") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 4096) req.destroy();
    });
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body || "{}");
        const result = await withTimeout(
          scanWebsite(payload.url, {
            crawl: Boolean(payload.crawl),
            maxPages: payload.maxPages
          }),
          SCAN_TIMEOUT_MS,
          "The scan took too long. Try again with same-domain crawling turned off or scan a specific page URL."
        );
        sendJson(res, 200, result);
      } catch (error) {
        sendJson(res, 400, { error: errorMessage(error) });
      }
    });
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405, { allow: "GET, HEAD, POST" });
  res.end("Method not allowed");
});

server.listen(PORT, () => {
  console.log(`Vulnerability scanner running at http://localhost:${PORT}`);
});
