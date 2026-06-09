const form = document.querySelector("#scan-form");
const input = document.querySelector("#target-url");
const statusBox = document.querySelector("#status");
const results = document.querySelector("#results");
const crawlPages = document.querySelector("#crawl-pages");
const maxPages = document.querySelector("#max-pages");
const retestButton = document.querySelector("#retest-button");
const exportJsonButton = document.querySelector("#export-json-button");
const printReportButton = document.querySelector("#print-report-button");
const historyContainer = document.querySelector("#history");

const severityOrder = ["critical", "high", "medium", "low", "info"];
let lastResult = null;
let loaderTimer = null;
let activeSeverityFilter = "all";
let activeCategoryFilter = "all";
let activeFindingSort = "severity";

const loaderMessages = [
  "Connecting to target",
  "Checking redirects and HTTPS",
  "Inspecting security headers",
  "Reviewing cookies and HTML",
  "Checking robots, sitemap, and security.txt",
  "Crawling same-domain pages",
  "Preparing report"
];

const fixGuides = [
  {
    match: /Strict-Transport-Security/i,
    steps: [
      "Force HTTP traffic to redirect to HTTPS.",
      "Add the Strict-Transport-Security response header only after HTTPS works across the whole site.",
      "Start with a shorter max-age while testing, then increase it for production."
    ],
    example: "Strict-Transport-Security: max-age=31536000; includeSubDomains"
  },
  {
    match: /Content-Security-Policy/i,
    steps: [
      "Inventory the scripts, styles, images, frames, and APIs the site really needs.",
      "Add a Content-Security-Policy header that allows only trusted sources.",
      "Deploy in report-only mode first if the site is large, then enforce it after fixing violations."
    ],
    example: "Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'self'; base-uri 'self'"
  },
  {
    match: /X-Content-Type-Options/i,
    steps: [
      "Add the nosniff header on all HTML, JavaScript, CSS, and API responses.",
      "Verify files are served with the correct Content-Type header."
    ],
    example: "X-Content-Type-Options: nosniff"
  },
  {
    match: /X-Frame-Options|frame-ancestors/i,
    steps: [
      "Decide whether the page should ever be embedded in an iframe.",
      "If not, block framing entirely. If same-site embedding is needed, allow only your own origin.",
      "Prefer CSP frame-ancestors for modern apps; X-Frame-Options is still useful for older browser coverage."
    ],
    example: "X-Frame-Options: SAMEORIGIN\nContent-Security-Policy: frame-ancestors 'self'"
  },
  {
    match: /Referrer-Policy/i,
    steps: [
      "Choose how much URL information should be sent when users leave your site.",
      "For most business websites, strict-origin-when-cross-origin is a practical default.",
      "Use no-referrer for pages that contain sensitive path or query data."
    ],
    example: "Referrer-Policy: strict-origin-when-cross-origin"
  },
  {
    match: /Permissions-Policy/i,
    steps: [
      "List browser features the site actually uses, such as camera, microphone, geolocation, or payment.",
      "Disable features that are not needed.",
      "Allow a feature only for the origins that require it."
    ],
    example: "Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()"
  },
  {
    match: /missing Secure/i,
    steps: [
      "Serve the site over HTTPS.",
      "Set the Secure attribute on session and authentication cookies.",
      "Confirm HTTP requests redirect to HTTPS before cookies are issued."
    ],
    example: "Set-Cookie: session=...; Secure; HttpOnly; SameSite=Lax"
  },
  {
    match: /missing HttpOnly/i,
    steps: [
      "Set HttpOnly on session, authentication, and sensitive cookies.",
      "Do not store secrets in cookies that JavaScript must read.",
      "Use a separate non-sensitive cookie if client-side code needs UI preferences."
    ],
    example: "Set-Cookie: session=...; Secure; HttpOnly; SameSite=Lax"
  },
  {
    match: /missing SameSite/i,
    steps: [
      "Use SameSite=Lax for most regular session cookies.",
      "Use SameSite=Strict for highly sensitive workflows where cross-site navigation is not needed.",
      "Use SameSite=None only when cross-site cookies are required, and pair it with Secure."
    ],
    example: "Set-Cookie: session=...; Secure; HttpOnly; SameSite=Lax"
  },
  {
    match: /mixed content/i,
    steps: [
      "Find every http:// script, stylesheet, image, iframe, and form action in the page.",
      "Replace those URLs with https:// versions.",
      "If the external service does not support HTTPS, remove it or proxy it through a secure source."
    ],
    example: "Replace http://cdn.example.com/app.js with https://cdn.example.com/app.js"
  },
  {
    match: /Password field served over HTTP/i,
    steps: [
      "Move the login page to HTTPS immediately.",
      "Redirect all HTTP traffic to HTTPS before rendering forms.",
      "Mark session cookies Secure and enable HSTS after validating HTTPS."
    ],
    example: "Return 301 redirects from http://example.com/login to https://example.com/login"
  },
  {
    match: /CSRF token/i,
    steps: [
      "Add a server-generated CSRF token to every state-changing form.",
      "Validate the token on the server before processing the request.",
      "Pair CSRF tokens with SameSite cookies for stronger protection."
    ],
    example: '<input type="hidden" name="csrf_token" value="server-generated-token">'
  },
  {
    match: /Technology disclosure/i,
    steps: [
      "Remove framework and runtime version headers where your server allows it.",
      "Avoid exposing detailed product versions in error pages.",
      "Keep this as a hardening task; it is usually lower priority than missing HTTPS, CSP, or cookie flags."
    ],
    example: "Remove or override headers like X-Powered-By: Express and detailed Server version strings."
  },
  {
    match: /robots\.txt/i,
    steps: [
      "Remove sensitive-looking paths from robots.txt.",
      "Protect private areas with authentication and authorization, not crawler rules.",
      "Check whether any listed paths are publicly reachable."
    ],
    example: "Do not rely on Disallow: /admin-backup/ as access control."
  },
  {
    match: /security\.txt/i,
    steps: [
      "Create /.well-known/security.txt.",
      "Add a monitored security contact and an expiry date.",
      "Link to your vulnerability disclosure policy if you have one."
    ],
    example: "Contact: mailto:security@example.com\nPolicy: https://example.com/security\nExpires: 2026-12-31T23:59:59Z"
  },
  {
    match: /viewport/i,
    steps: [
      "Add a viewport meta tag in the document head.",
      "Test the page at mobile widths after adding it."
    ],
    example: '<meta name="viewport" content="width=device-width, initial-scale=1">'
  },
  {
    match: /TLS certificate expires soon/i,
    steps: [
      "Renew the TLS certificate before it expires.",
      "Verify automatic renewal is scheduled and monitored.",
      "Check the full certificate chain after renewal."
    ],
    example: "Use your hosting panel, load balancer, or certificate automation tool to renew the certificate."
  }
];

function getFixGuide(title) {
  return fixGuides.find((guide) => guide.match.test(title));
}

function severityRank(severity) {
  const index = severityOrder.indexOf(severity);
  return index === -1 ? severityOrder.length : index;
}

function riskLabel(score) {
  if (score >= 85) return { label: "Low risk", text: "The site has a solid passive security baseline. Review remaining hardening items." };
  if (score >= 65) return { label: "Moderate risk", text: "Important protections are missing. Prioritize high and medium findings first." };
  if (score >= 40) return { label: "Elevated risk", text: "Several browser and transport protections need attention across the site." };
  return { label: "High risk", text: "The site is missing multiple core protections. Start with the top recommendations." };
}

const categoryOrder = ["server", "frontend", "backend", "metadata", "dns"];
const categoryLabels = {
  server: "Server / Hosting",
  frontend: "Frontend",
  backend: "Backend / App",
  metadata: "Metadata",
  dns: "DNS / Email"
};

function findingCategory(title) {
  if (/Strict-Transport|TLS certificate|HTTPS|X-Content-Type|X-Frame|Referrer|Permissions|Technology disclosure|Server exposed/i.test(title)) return "server";
  if (/Content-Security|mixed content|Password field|viewport/i.test(title)) return "frontend";
  if (/Cookie|CSRF|POST form/i.test(title)) return "backend";
  if (/robots|security\.txt|sitemap/i.test(title)) return "metadata";
  if (/SPF|DKIM|DMARC|MX|DNS/i.test(title)) return "dns";
  return "server";
}

function categoryLabel(category) {
  return categoryLabels[category] || category;
}

function platformFixes(title) {
  if (/Strict-Transport-Security/i.test(title)) {
    return [
      { platform: "nginx", code: "add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;" },
      { platform: "Apache .htaccess", code: "Header always set Strict-Transport-Security \"max-age=31536000; includeSubDomains\"" },
      { platform: "Express", code: "app.use((req, res, next) => {\n  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');\n  next();\n});" },
      { platform: "Cloudflare", code: "SSL/TLS -> Edge Certificates -> Enable HSTS after confirming HTTPS works on all subdomains." }
    ];
  }

  if (/Content-Security-Policy/i.test(title)) {
    return [
      { platform: "nginx", code: "add_header Content-Security-Policy \"default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'self'; base-uri 'self'\" always;" },
      { platform: "Apache .htaccess", code: "Header set Content-Security-Policy \"default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'self'; base-uri 'self'\"" },
      { platform: "Express", code: "app.use((req, res, next) => {\n  res.setHeader('Content-Security-Policy', \"default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'self'; base-uri 'self'\");\n  next();\n});" },
      { platform: "Vercel / Netlify", code: "Add this as a custom response header in your platform headers config. Relax script-src/style-src only for services your site actually uses." }
    ];
  }

  if (/X-Content-Type-Options/i.test(title)) {
    return [
      { platform: "nginx", code: "add_header X-Content-Type-Options \"nosniff\" always;" },
      { platform: "Apache .htaccess", code: "Header always set X-Content-Type-Options \"nosniff\"" },
      { platform: "Express", code: "app.use((req, res, next) => {\n  res.setHeader('X-Content-Type-Options', 'nosniff');\n  next();\n});" }
    ];
  }

  if (/X-Frame-Options|frame-ancestors/i.test(title)) {
    return [
      { platform: "nginx", code: "add_header X-Frame-Options \"SAMEORIGIN\" always;\nadd_header Content-Security-Policy \"frame-ancestors 'self'\" always;" },
      { platform: "Apache .htaccess", code: "Header always set X-Frame-Options \"SAMEORIGIN\"\nHeader set Content-Security-Policy \"frame-ancestors 'self'\"" },
      { platform: "Express", code: "app.use((req, res, next) => {\n  res.setHeader('X-Frame-Options', 'SAMEORIGIN');\n  res.setHeader('Content-Security-Policy', \"frame-ancestors 'self'\");\n  next();\n});" }
    ];
  }

  if (/Referrer-Policy/i.test(title)) {
    return [
      { platform: "nginx", code: "add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;" },
      { platform: "Apache .htaccess", code: "Header always set Referrer-Policy \"strict-origin-when-cross-origin\"" },
      { platform: "Express", code: "app.use((req, res, next) => {\n  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');\n  next();\n});" }
    ];
  }

  if (/Permissions-Policy/i.test(title)) {
    return [
      { platform: "nginx", code: "add_header Permissions-Policy \"camera=(), microphone=(), geolocation=(), payment=()\" always;" },
      { platform: "Apache .htaccess", code: "Header always set Permissions-Policy \"camera=(), microphone=(), geolocation=(), payment=()\"" },
      { platform: "Express", code: "app.use((req, res, next) => {\n  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');\n  next();\n});" }
    ];
  }

  if (/Cookie .*missing/i.test(title)) {
    return [
      { platform: "PHP", code: "session_set_cookie_params([\n  'secure' => true,\n  'httponly' => true,\n  'samesite' => 'Lax'\n]);\nsession_start();" },
      { platform: "Express", code: "res.cookie('session', value, {\n  secure: true,\n  httpOnly: true,\n  sameSite: 'lax'\n});" },
      { platform: "Laravel", code: "Set SESSION_SECURE_COOKIE=true and SESSION_SAME_SITE=lax in .env, then clear config cache." },
      { platform: "ASP.NET Core", code: "options.Cookie.SecurePolicy = CookieSecurePolicy.Always;\noptions.Cookie.HttpOnly = true;\noptions.Cookie.SameSite = SameSiteMode.Lax;" }
    ];
  }

  if (/mixed content/i.test(title)) {
    return [
      { platform: "HTML", code: "Change src=\"http://...\" or href=\"http://...\" to https:// URLs." },
      { platform: "WordPress", code: "Update WordPress Address and Site Address to https://, then replace old http:// URLs in content and media references." },
      { platform: "Cloudflare", code: "Enable Automatic HTTPS Rewrites, but still fix hard-coded http:// URLs in the source." }
    ];
  }

  if (/CSRF token/i.test(title)) {
    return [
      { platform: "PHP", code: "$_SESSION['csrf'] = bin2hex(random_bytes(32));\n// Put $_SESSION['csrf'] in a hidden form field and compare it on POST." },
      { platform: "Laravel", code: "Use @csrf inside Blade forms and keep VerifyCsrfToken middleware enabled." },
      { platform: "Django", code: "Use {% csrf_token %} in forms and keep CsrfViewMiddleware enabled." },
      { platform: "Express", code: "Use a maintained CSRF middleware or validate a server-generated token on every state-changing POST." }
    ];
  }

  return [];
}

function nextVerificationSteps(title) {
  const common = [
    "Apply the change in staging or during a low-traffic window.",
    "Clear CDN, proxy, and browser caches if the old header still appears.",
    "Run this scanner again and confirm the finding disappears."
  ];

  if (/Content-Security-Policy/i.test(title)) {
    return [
      "Start with Content-Security-Policy-Report-Only if the site uses many third-party scripts.",
      "Open key pages and check the browser console for blocked resources.",
      ...common
    ];
  }

  if (/Strict-Transport-Security/i.test(title)) {
    return [
      "Confirm every subdomain supports HTTPS before using includeSubDomains.",
      "Use a shorter max-age first if you are unsure.",
      ...common
    ];
  }

  return common;
}

function riskExplanation(finding) {
  if (/Content-Security-Policy/i.test(finding.title)) return "A missing CSP makes it harder to contain cross-site scripting and third-party script injection risk.";
  if (/Strict-Transport-Security/i.test(finding.title)) return "Without HSTS, browsers may try insecure HTTP before reaching the secure site.";
  if (/X-Frame-Options|frame-ancestors/i.test(finding.title)) return "Missing frame protection can allow clickjacking through embedded deceptive pages.";
  if (/Cookie .*missing/i.test(finding.title)) return "Cookie flags reduce the chance that session cookies are leaked, read by scripts, or sent in risky cross-site contexts.";
  if (/mixed content/i.test(finding.title)) return "HTTP resources on HTTPS pages can be blocked or manipulated in transit.";
  return "This issue weakens the site's security posture or makes future attacks easier to investigate and exploit.";
}

function addCopyButtons(root) {
  root.querySelectorAll(".fix-example").forEach((pre) => {
    if (pre.querySelector(".copy-code")) return;
    const button = el("button", "copy-code", "Copy");
    button.type = "button";
    button.addEventListener("click", async () => {
      const code = pre.querySelector("code")?.textContent || "";
      await navigator.clipboard.writeText(code);
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = "Copy";
      }, 1200);
    });
    pre.append(button);
  });
}

function renderPlatformTabs(container, finding) {
  const fixes = platformFixes(finding.title);
  if (!fixes.length) return;

  const tabs = el("div", "code-tabs");
  const tabList = el("div", "code-tab-list");
  const panel = el("div", "code-tab-panel");

  function selectFix(index) {
    tabList.querySelectorAll("button").forEach((button, buttonIndex) => {
      button.classList.toggle("active", buttonIndex === index);
    });
    panel.replaceChildren();
    const pre = el("pre", "fix-example");
    pre.append(el("code", "", fixes[index].code));
    panel.append(pre);
    addCopyButtons(panel);
  }

  fixes.forEach((fix, index) => {
    const button = el("button", index === 0 ? "active" : "", fix.platform);
    button.type = "button";
    button.addEventListener("click", () => selectFix(index));
    tabList.append(button);
  });

  tabs.append(tabList, panel);
  container.append(tabs);
  selectFix(0);
}

function renderHandHolding(card, finding) {
  const verify = nextVerificationSteps(finding.title);

  const guide = el("div", "guided-fix");
  guide.append(el("strong", "", "Guided fix"));

  renderPlatformTabs(guide, finding);

  const verifyBox = el("div", "verify-box");
  verifyBox.append(el("span", "platform-name", "After you apply it"));
  const list = el("ol", "fix-steps");
  verify.forEach((step) => list.append(el("li", "", step)));
  verifyBox.append(list);
  guide.append(verifyBox);
  card.append(guide);
}

function setStatus(message, isError = false, isLoading = false) {
  statusBox.replaceChildren();
  statusBox.classList.toggle("loading", isLoading);
  if (message) {
    if (isLoading) {
      statusBox.append(el("span", "spinner"));
      const copy = el("span", "loader-copy");
      copy.append(el("strong", "", message));
      copy.append(el("small", "", "Keep this tab open while the passive scan runs."));
      statusBox.append(copy);
    } else {
      statusBox.textContent = message;
    }
  }
  statusBox.classList.toggle("hidden", !message);
  statusBox.style.background = isError ? "#fef2f2" : "#fff7ed";
  statusBox.style.borderColor = isError ? "#fecaca" : "#fed7aa";
  statusBox.style.color = isError ? "#7f1d1d" : "#7c2d12";
}

function startLoader() {
  let index = 0;
  setStatus(loaderMessages[index], false, true);
  window.clearInterval(loaderTimer);
  loaderTimer = window.setInterval(() => {
    index = Math.min(index + 1, loaderMessages.length - 1);
    setStatus(loaderMessages[index], false, true);
  }, 1400);
}

function stopLoader() {
  window.clearInterval(loaderTimer);
  loaderTimer = null;
}

function el(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

function renderChecks(checks) {
  const list = document.querySelector("#checks");
  list.replaceChildren();

  const passed = checks.filter((check) => check.passed).length;
  const summary = el("li", "check-summary");
  summary.append(el("div", "check-summary-card pass", `${passed} passed`));
  summary.append(el("div", "check-summary-card fail", `${checks.length - passed} missing`));
  list.append(summary);

  checks.forEach((check) => {
    const item = el("li", check.passed ? "check-row pass" : "check-row fail");
    const icon = el("span", `check-icon ${check.passed ? "pass" : "fail"}`);
    icon.append(el("i", check.passed ? "fa-solid fa-check" : "fa-solid fa-exclamation"));
    const copy = el("div");
    copy.append(el("span", "check-title", check.label));
    copy.append(el("span", "check-value", check.value));
    item.append(icon, copy, el("span", `check-status ${check.passed ? "pass" : "fail"}`, check.passed ? "Present" : "Missing"));
    list.append(item);
  });
}

function sortedFindings(findings) {
  const filtered = findings.filter((finding) => {
    const severityMatch = activeSeverityFilter === "all" || finding.severity === activeSeverityFilter;
    const categoryMatch = activeCategoryFilter === "all" || findingCategory(finding.title) === activeCategoryFilter;
    return severityMatch && categoryMatch;
  });

  return filtered.sort((a, b) => {
    if (activeFindingSort === "category") {
      return categoryOrder.indexOf(findingCategory(a.title)) - categoryOrder.indexOf(findingCategory(b.title)) || severityRank(a.severity) - severityRank(b.severity);
    }
    if (activeFindingSort === "page") {
      return String(a.page || "").localeCompare(String(b.page || "")) || severityRank(a.severity) - severityRank(b.severity);
    }
    return severityRank(a.severity) - severityRank(b.severity);
  });
}

function renderFindingControls(findings) {
  const filters = document.querySelector("#severity-filters");
  if (!filters) return;
  filters.replaceChildren();

  ["all", ...severityOrder].forEach((severity) => {
    const count = severity === "all" ? findings.length : findings.filter((finding) => finding.severity === severity).length;
    const button = el("button", severity === activeSeverityFilter ? "active" : "", `${severity} ${count}`);
    button.type = "button";
    button.addEventListener("click", () => {
      activeSeverityFilter = severity;
      renderFindings(lastResult?.findings || []);
    });
    filters.append(button);
  });

  const categoryFilters = document.querySelector("#category-filters");
  if (categoryFilters) {
    categoryFilters.replaceChildren();
    ["all", ...categoryOrder].forEach((category) => {
      const count = category === "all" ? findings.length : findings.filter((finding) => findingCategory(finding.title) === category).length;
      const label = category === "all" ? "All owners" : categoryLabel(category);
      const button = el("button", category === activeCategoryFilter ? "active" : "", `${label} ${count}`);
      button.type = "button";
      button.addEventListener("click", () => {
        activeCategoryFilter = category;
        renderFindings(lastResult?.findings || []);
      });
      categoryFilters.append(button);
    });
  }

  const sort = document.querySelector("#finding-sort");
  if (sort && !sort.dataset.bound) {
    sort.dataset.bound = "true";
    sort.addEventListener("change", () => {
      activeFindingSort = sort.value;
      renderFindings(lastResult?.findings || []);
    });
  }
}

function renderFindings(findings) {
  const container = document.querySelector("#findings");
  container.replaceChildren();
  renderFindingControls(findings);

  if (!findings.length) {
    container.append(el("p", "empty", "No common passive-scan findings were detected."));
    return;
  }

  const visibleFindings = sortedFindings(findings);
  if (!visibleFindings.length) {
    container.append(el("p", "empty", "No findings match this filter."));
    return;
  }

  visibleFindings
    .forEach((finding) => {
      const card = el("details", `finding ${finding.severity}`);
      const head = el("summary", "finding-head");
      const titleWrap = el("span", "finding-summary-copy");
      titleWrap.append(el("span", `category-badge ${findingCategory(finding.title)}`, categoryLabel(findingCategory(finding.title))));
      titleWrap.append(el("span", "finding-title", finding.title));
      titleWrap.append(el("span", "finding-short", finding.detail));
      if (finding.page) titleWrap.append(el("span", "finding-page", finding.page));
      head.append(titleWrap);
      head.append(el("span", `severity ${finding.severity}`, finding.severity));
      card.append(head);

      const body = el("div", "finding-body");
      body.append(el("p", "", `Evidence: ${finding.detail}`));
      body.append(el("p", "", `Owner category: ${categoryLabel(findingCategory(finding.title))}`));
      body.append(el("p", "", `Why this matters: ${riskExplanation(finding)}`));
      body.append(el("p", "", `Recommended fix: ${finding.recommendation}`));

      const guide = getFixGuide(finding.title);
      if (guide) {
        const fixBox = el("div", "fix-box");
        fixBox.append(el("strong", "", "Fix steps"));
        const steps = el("ol", "fix-steps");
        guide.steps.forEach((step) => steps.append(el("li", "", step)));
        fixBox.append(steps);
        if (guide.example) {
          const example = el("pre", "fix-example");
          example.append(el("code", "", guide.example));
          fixBox.append(example);
        }
        body.append(fixBox);
      }

      renderHandHolding(body, finding);
      card.append(body);
      addCopyButtons(card);
      container.append(card);
    });
}

function renderCookies(cookies) {
  const container = document.querySelector("#cookies");
  container.replaceChildren();

  if (!cookies.length) {
    container.append(el("p", "empty", "No Set-Cookie headers were returned."));
    return;
  }

  cookies.forEach((cookie) => {
    const row = el("div", "plain-row");
    row.append(el("strong", "", cookie.name));
    row.append(el("span", "", `Secure: ${cookie.secure ? "yes" : "no"} | HttpOnly: ${cookie.httpOnly ? "yes" : "no"} | SameSite: ${cookie.sameSite ? "yes" : "no"}`));
    container.append(row);
  });
}

function renderRedirects(redirects) {
  const container = document.querySelector("#redirects");
  container.replaceChildren();

  if (!redirects.length) {
    container.append(el("p", "empty", "No redirects followed."));
    return;
  }

  redirects.forEach((redirect) => {
    const row = el("div", "plain-row");
    row.append(el("strong", "", `${redirect.statusCode}`));
    row.append(el("span", "", `${redirect.from} -> ${redirect.to}`));
    container.append(row);
  });
}

function renderSeveritySummary(summary) {
  const container = document.querySelector("#severity-summary");
  container.replaceChildren();
  severityOrder.forEach((severity) => {
    const count = summary?.[severity] || 0;
    container.append(el("span", `summary-pill ${severity}`, `${count} ${severity}`));
  });
}

function renderCategorySummary(findings) {
  const container = document.querySelector("#category-summary");
  if (!container) return;
  container.replaceChildren();

  categoryOrder.forEach((category) => {
    const count = findings.filter((finding) => findingCategory(finding.title) === category).length;
    const card = el("div", `category-card ${category}`);
    card.append(el("span", "category-card-label", categoryLabel(category)));
    card.append(el("strong", "", String(count)));
    container.append(card);
  });
}

function renderRiskSummary(data) {
  const score = Number(data.score || 0);
  const risk = riskLabel(score);
  const heading = document.querySelector("#risk-heading");
  const summary = document.querySelector("#risk-summary");
  const sidebarScore = document.querySelector("#sidebar-score");
  const sidebarRisk = document.querySelector("#sidebar-risk");
  const sidebarTotal = document.querySelector("#sidebar-total");
  const sidebarDuration = document.querySelector("#sidebar-duration");

  if (heading) heading.textContent = risk.label;
  if (summary) summary.textContent = risk.text;
  if (sidebarScore) sidebarScore.textContent = `${score}/100`;
  if (sidebarRisk) {
    sidebarRisk.textContent = risk.label;
    sidebarRisk.className = `risk-label ${score >= 85 ? "low" : score >= 65 ? "medium" : score >= 40 ? "high" : "critical"}`;
  }
  if (sidebarTotal) sidebarTotal.textContent = String(data.findings?.length || 0);
  if (sidebarDuration) sidebarDuration.textContent = `${data.durationMs} ms`;
}

function renderTopRecommendations(findings) {
  const container = document.querySelector("#top-recommendations");
  if (!container) return;
  container.replaceChildren();

  const unique = [];
  const seen = new Set();
  findings
    .slice()
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity))
    .forEach((finding) => {
      const key = `${finding.severity}:${finding.title}`;
      if (!seen.has(key) && unique.length < 4) {
        seen.add(key);
        unique.push(finding);
      }
    });

  if (!unique.length) {
    container.append(el("p", "empty", "No recommendations yet."));
    return;
  }

  unique.forEach((finding, index) => {
    const row = el("div", `recommendation ${finding.severity}`);
    row.append(el("span", "recommendation-rank", String(index + 1)));
    const copy = el("div", "recommendation-copy");
    const titleLine = el("div", "recommendation-title-line");
    titleLine.append(el("strong", "", finding.title));
    titleLine.append(el("span", `category-badge ${findingCategory(finding.title)}`, categoryLabel(findingCategory(finding.title))));
    copy.append(titleLine);
    copy.append(el("p", "", finding.recommendation));
    copy.append(el("small", "", `Owner: ${categoryLabel(findingCategory(finding.title))}`));
    row.append(copy);
    row.append(el("span", `severity ${finding.severity}`, finding.severity));
    container.append(row);
  });
}

function renderZcsValue(findings = []) {
  const container = document.querySelector("#zcs-value-summary");
  if (!container) return;
  container.replaceChildren();

  const categories = categoryOrder
    .map((category) => ({
      category,
      count: findings.filter((finding) => findingCategory(finding.title) === category).length
    }))
    .filter((item) => item.count > 0);

  if (!categories.length) {
    container.append(el("p", "empty", "No active findings were detected. Zion Cloud Solutions can still help with ongoing monitoring, cloud security reviews, and hardening validation."));
    return;
  }

  const intro = el("p", "value-intro", "Based on this scan, the biggest value comes from coordinating fixes across these ownership areas:");
  const list = el("div", "value-owner-list");
  categories.forEach((item) => {
    const chip = el("span", `category-badge ${item.category}`, `${categoryLabel(item.category)}: ${item.count}`);
    list.append(chip);
  });
  container.append(intro, list);
}

function renderTechnologies(technologies) {
  const target = document.querySelector("#technologies");
  target.replaceChildren();
  if (!technologies.length) {
    target.textContent = "No common technology fingerprints detected";
    return;
  }
  const wrap = el("div", "tag-wrap");
  technologies.forEach((name) => wrap.append(el("span", "tag", name)));
  target.append(wrap);
}

function renderPages(pages) {
  const container = document.querySelector("#pages");
  container.replaceChildren();
  if (!pages.length) {
    container.append(el("p", "empty", "No pages scanned."));
    return;
  }
  pages.forEach((page) => {
    const row = el("div", "plain-row");
    row.append(el("strong", "", page.title || page.url));
    row.append(el("span", "", `${page.url} | HTTP ${page.statusCode || "n/a"} | findings: ${page.findings} | links: ${page.linksFound}`));
    container.append(row);
  });
}

function renderMetadata(files) {
  const container = document.querySelector("#metadata");
  container.replaceChildren();
  if (!files.length) {
    container.append(el("p", "empty", "No metadata files checked."));
    return;
  }
  files.forEach((file) => {
    const row = el("div", "plain-row");
    row.append(el("strong", "", `${file.label} - ${file.found ? "found" : "not found"} (${file.statusCode || "n/a"})`));
    row.append(el("span", "", file.url));
    if (file.preview) row.append(el("p", "metadata-preview", file.preview));
    container.append(row);
  });
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem("zcsScannerHistory") || "[]");
  } catch {
    return [];
  }
}

function renderHistory() {
  historyContainer.replaceChildren();
  const history = getHistory();
  if (!history.length) {
    historyContainer.append(el("p", "empty", "No previous scans saved in this browser."));
    return;
  }
  history.forEach((item) => {
    const row = el("button", "history-row");
    row.type = "button";
    row.append(el("strong", "", `${item.score}/100 - ${item.finalUrl}`));
    row.append(el("span", "", new Date(item.scannedAt).toLocaleString()));
    row.addEventListener("click", () => {
      input.value = item.target;
      form.requestSubmit();
    });
    historyContainer.append(row);
  });
}

function saveHistory(data) {
  const history = getHistory().filter((item) => item.finalUrl !== data.finalUrl);
  history.unshift({
    target: data.target,
    finalUrl: data.finalUrl,
    score: data.score,
    summary: data.severitySummary,
    scannedAt: data.scannedAt
  });
  localStorage.setItem("zcsScannerHistory", JSON.stringify(history.slice(0, 8)));
  renderHistory();
}

function exportJson() {
  if (!lastResult) return;
  const blob = new Blob([JSON.stringify(lastResult, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `security-scan-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function severityCountsHtml(summary = {}) {
  return severityOrder
    .map((severity) => `<span class="pill ${severity}">${summary[severity] || 0} ${severity}</span>`)
    .join("");
}

function categoryCountsHtml(findings = []) {
  return categoryOrder
    .map((category) => {
      const count = findings.filter((finding) => findingCategory(finding.title) === category).length;
      return `<div class="metric"><span>${escapeHtml(categoryLabel(category))}</span><strong>${count}</strong></div>`;
    })
    .join("");
}

function findingsReportHtml(findings = []) {
  if (!findings.length) return "<p>No findings detected.</p>";
  return findings
    .slice()
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity))
    .map((finding, index) => {
      const guide = getFixGuide(finding.title);
      const fixes = platformFixes(finding.title);
      return `
      <article class="finding ${escapeHtml(finding.severity)}">
        <div class="finding-head">
          <div>
            <span class="category">${escapeHtml(categoryLabel(findingCategory(finding.title)))}</span>
            <h3>${index + 1}. ${escapeHtml(finding.title)}</h3>
          </div>
          <span class="pill ${escapeHtml(finding.severity)}">${escapeHtml(finding.severity)}</span>
        </div>
        <p><strong>Affected URL:</strong> ${escapeHtml(finding.page || "Site-wide")}</p>
        <p><strong>Evidence:</strong> ${escapeHtml(finding.detail)}</p>
        <p><strong>Risk:</strong> ${escapeHtml(riskExplanation(finding))}</p>
        <p><strong>Recommended fix:</strong> ${escapeHtml(finding.recommendation)}</p>
        ${guide ? `<div class="subbox"><strong>Step-by-step fix</strong><ol>${guide.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>${guide.example ? `<pre>${escapeHtml(guide.example)}</pre>` : ""}</div>` : ""}
        ${fixes.length ? `<div class="subbox"><strong>Platform examples</strong>${fixes.map((fix) => `<h4>${escapeHtml(fix.platform)}</h4><pre>${escapeHtml(fix.code)}</pre>`).join("")}</div>` : ""}
        <div class="subbox"><strong>Verification checklist</strong><ol>${nextVerificationSteps(finding.title).map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol></div>
      </article>
    `;
    })
    .join("");
}

function rowsHtml(items = [], renderer) {
  if (!items.length) return "<p>None returned.</p>";
  return items.map(renderer).join("");
}

function checksReportHtml(checks = []) {
  return rowsHtml(checks, (check) => `<tr><td>${escapeHtml(check.label)}</td><td>${check.passed ? "Passed" : "Failed"}</td><td>${escapeHtml(check.value)}</td></tr>`);
}

function cookiesReportHtml(cookies = []) {
  return rowsHtml(cookies, (cookie) => `<tr><td>${escapeHtml(cookie.name)}</td><td>${cookie.secure ? "Yes" : "No"}</td><td>${cookie.httpOnly ? "Yes" : "No"}</td><td>${cookie.sameSite ? "Yes" : "No"}</td></tr>`);
}

function redirectsReportHtml(redirects = []) {
  return rowsHtml(redirects, (redirect) => `<div class="row"><strong>HTTP ${escapeHtml(redirect.statusCode)}</strong><br>${escapeHtml(redirect.from)} -> ${escapeHtml(redirect.to)}</div>`);
}

function zcsReportValueHtml(findings = []) {
  const categories = categoryOrder
    .map((category) => ({
      category,
      count: findings.filter((finding) => findingCategory(finding.title) === category).length
    }))
    .filter((item) => item.count > 0);
  const categoryText = categories.length
    ? categories.map((item) => `${categoryLabel(item.category)} (${item.count})`).join(", ")
    : "No active findings";

  return `
    <section class="card">
      <h2>How Zion Cloud Solutions can help fix this</h2>
      <p><strong>Primary remediation areas:</strong> ${escapeHtml(categoryText)}</p>
      <div class="grid">
        <div class="row"><strong>1. Prioritized roadmap</strong><br>Translate findings into a clear fix order by severity, ownership, business risk, and speed of remediation.</div>
        <div class="row"><strong>2. Implementation support</strong><br>Help your server, frontend, backend, CDN, and DNS owners apply the right fixes without breaking production traffic.</div>
        <div class="row"><strong>3. Validation and proof</strong><br>Retest after remediation and provide evidence that the issue is resolved.</div>
        <div class="row"><strong>4. Ongoing hardening</strong><br>Set repeatable checks for headers, TLS, cookies, public metadata, and platform configuration drift.</div>
      </div>
      <p>Learn more at <a href="https://zionclouds.com/">https://zionclouds.com/</a></p>
    </section>
  `;
}

function downloadReport() {
  if (!lastResult) {
    setStatus("Run a scan first, then download the report.", true);
    return;
  }

  const risk = riskLabel(Number(lastResult.score || 0));
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Security Scan Report - ${escapeHtml(lastResult.finalUrl)}</title>
  <style>
    body{margin:0;background:#f8fafc;color:#0f172a;font-family:Inter,Segoe UI,Arial,sans-serif;line-height:1.55}
    .wrap{max-width:1040px;margin:0 auto;padding:38px 24px}
    .hero,.card,.finding{background:#fff;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 12px 28px rgba(15,23,42,.06)}
    .hero{padding:28px;margin-bottom:18px}
    h1{margin:0 0 10px;font-size:34px;letter-spacing:-.03em;font-weight:600} h2{margin:0 0 14px;font-size:20px;font-weight:600} h3{margin:6px 0 8px;font-size:17px;font-weight:600} h4{margin:14px 0 6px;font-weight:600}
    .muted{color:#64748b}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.metrics{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-top:16px}
    .metric{padding:13px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px}.metric span{display:block;color:#64748b;font-size:12px;text-transform:uppercase;font-weight:600}.metric strong{font-size:28px}
    .card{padding:20px;margin-top:18px}.pill{display:inline-flex;padding:5px 10px;border-radius:999px;font-size:12px;font-weight:600;text-transform:uppercase}
    .critical{color:#dc2626;background:#fef2f2}.high{color:#ea580c;background:#fff7ed}.medium{color:#d97706;background:#fffbeb}.low{color:#2563eb;background:#eff6ff}.info{color:#64748b;background:#f1f5f9}
    .finding{padding:16px;margin:12px 0;border-left:6px solid #64748b}.finding.critical{border-left-color:#dc2626}.finding.high{border-left-color:#ea580c}.finding.medium{border-left-color:#d97706}.finding.low{border-left-color:#2563eb}
    .finding-head{display:flex;justify-content:space-between;gap:12px}.category{display:inline-flex;color:#1d4ed8;background:#eff6ff;border-radius:999px;padding:4px 9px;font-size:11px;font-weight:600;text-transform:uppercase}
    .row{padding:12px;border:1px solid #e2e8f0;border-radius:14px;background:#f8fafc;margin:8px 0;overflow-wrap:anywhere} table{width:100%;border-collapse:collapse;margin-top:10px}td,th{padding:10px;border-bottom:1px solid #e2e8f0;text-align:left;vertical-align:top}th{color:#64748b;font-weight:600;text-transform:uppercase;font-size:12px}pre{white-space:pre-wrap;background:#f8fafc;border:1px solid #dbeafe;border-radius:12px;padding:12px;overflow-wrap:anywhere}.subbox{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:12px;margin-top:10px}
    @media print{body{background:#fff}.wrap{padding:0}.hero,.card,.finding{box-shadow:none;break-inside:avoid}}
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <p class="muted">Passive Website Security Scanner</p>
      <h1>Security Scan Report</h1>
      <p><strong>Target:</strong> ${escapeHtml(lastResult.target)}</p>
      <p><strong>Final URL:</strong> ${escapeHtml(lastResult.finalUrl)}</p>
      <p><strong>Scanned:</strong> ${escapeHtml(new Date(lastResult.scannedAt).toLocaleString())}</p>
      <div class="grid">
        <div class="metric"><span>Score</span><strong>${escapeHtml(lastResult.score)}/100</strong></div>
        <div class="metric"><span>Risk</span><strong>${escapeHtml(risk.label)}</strong></div>
        <div class="metric"><span>Status</span><strong>HTTP ${escapeHtml(lastResult.statusCode)}</strong></div>
        <div class="metric"><span>Duration</span><strong>${escapeHtml(lastResult.durationMs)} ms</strong></div>
      </div>
      <p class="muted">${escapeHtml(risk.text)}</p>
      <div>${severityCountsHtml(lastResult.severitySummary)}</div>
    </section>
    <section class="card">
      <h2>Executive Summary</h2>
      <p>This report is a passive security review of publicly reachable web responses. It checks transport security, browser security headers, cookie flags, visible HTML patterns, public metadata files, redirects, and detected technology signals. It does not attempt exploitation, authentication bypass, brute force, or intrusive testing.</p>
      <p>The score is calculated from detected findings. Unique high-impact findings reduce the score more than repeated duplicates across crawled pages.</p>
    </section>
    <section class="card">
      <h2>Scope and Target Details</h2>
      <div class="grid">
        <div class="row"><strong>Requested target</strong><br>${escapeHtml(lastResult.target)}</div>
        <div class="row"><strong>Final URL</strong><br>${escapeHtml(lastResult.finalUrl)}</div>
        <div class="row"><strong>DNS</strong><br>${escapeHtml((lastResult.dns || []).map((record) => `${record.address} (IPv${record.family})`).join(", ") || "Not available")}</div>
        <div class="row"><strong>TLS</strong><br>${lastResult.tls ? `${escapeHtml(lastResult.tls.subject)}, issuer ${escapeHtml(lastResult.tls.issuer)}, expires ${escapeHtml(lastResult.tls.validTo)} (${escapeHtml(lastResult.tls.daysRemaining)} days)` : "Not available"}</div>
      </div>
    </section>
    <section class="card">
      <h2>Findings by Owner</h2>
      <div class="metrics">${categoryCountsHtml(lastResult.findings || [])}</div>
    </section>
    ${zcsReportValueHtml(lastResult.findings || [])}
    <section class="card">
      <h2>Security Header Checks</h2>
      <table><thead><tr><th>Check</th><th>Status</th><th>Observed value</th></tr></thead><tbody>${checksReportHtml(lastResult.checks || [])}</tbody></table>
    </section>
    <section class="card">
      <h2>Cookie Flags</h2>
      <table><thead><tr><th>Cookie</th><th>Secure</th><th>HttpOnly</th><th>SameSite</th></tr></thead><tbody>${cookiesReportHtml(lastResult.cookies || [])}</tbody></table>
    </section>
    <section class="card">
      <h2>Findings and Recommended Fixes</h2>
      ${findingsReportHtml(lastResult.findings || [])}
    </section>
    <section class="card">
      <h2>Scanned Pages</h2>
      ${rowsHtml(lastResult.pages || [], (page) => `<div class="row"><strong>${escapeHtml(page.title || page.url)}</strong><br>${escapeHtml(page.url)}<br>HTTP ${escapeHtml(page.statusCode)} | findings: ${escapeHtml(page.findings)}</div>`)}
    </section>
    <section class="card">
      <h2>Metadata Files</h2>
      ${rowsHtml(lastResult.metadata || [], (file) => `<div class="row"><strong>${escapeHtml(file.label)} - ${file.found ? "found" : "not found"}</strong><br>${escapeHtml(file.url)}<br>${escapeHtml(file.preview || "")}</div>`)}
    </section>
    <section class="card">
      <h2>Redirect Chain</h2>
      ${redirectsReportHtml(lastResult.redirects || [])}
    </section>
    <section class="card">
      <h2>Methodology</h2>
      <ul>
        <li>Fetches the requested URL and follows standard HTTP redirects.</li>
        <li>Checks common browser security headers and HTTPS posture.</li>
        <li>Reviews Set-Cookie attributes returned by the target.</li>
        <li>Looks for visible HTML patterns such as mixed content, password fields over HTTP, and obvious CSRF token hints.</li>
        <li>Checks public metadata files such as robots.txt, sitemap.xml, and security.txt.</li>
        <li>Does not run exploit payloads or intrusive vulnerability tests.</li>
      </ul>
    </section>
  </main>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `security-scan-report-${new Date().toISOString().slice(0, 10)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function renderResult(data) {
  lastResult = data;
  document.querySelector("#score").textContent = `${data.score}/100`;
  document.querySelector("#status-code").textContent = `HTTP ${data.statusCode}`;
  document.querySelector("#duration").textContent = `${data.durationMs} ms`;
  document.querySelector("#requested-url").textContent = data.target;
  document.querySelector("#final-url").textContent = data.finalUrl;
  document.querySelector("#dns").textContent = data.dns.map((record) => `${record.address} (IPv${record.family})`).join(", ");
  document.querySelector("#tls").textContent = data.tls
    ? `${data.tls.subject}, expires ${data.tls.validTo} (${data.tls.daysRemaining} days)`
    : "Not available";

  renderSeveritySummary(data.severitySummary);
  renderCategorySummary(data.findings || []);
  renderRiskSummary(data);
  renderTopRecommendations(data.findings || []);
  renderZcsValue(data.findings || []);
  renderTechnologies(data.technologies || []);
  renderChecks(data.checks);
  renderFindings(data.findings);
  renderPages(data.pages || []);
  renderMetadata(data.metadata || []);
  renderCookies(data.cookies);
  renderRedirects(data.redirects);
  saveHistory(data);
  results.classList.remove("hidden");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button");
  const buttonLabel = button.querySelector("span");
  const url = input.value.trim();

  button.disabled = true;
  buttonLabel.textContent = "Scanning";
  results.classList.add("hidden");
  startLoader();

  try {
    const response = await fetch("/api/scan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        url,
        crawl: crawlPages.checked,
        maxPages: Number(maxPages.value)
      })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Scan failed.");
    stopLoader();
    setStatus("");
    renderResult(payload);
  } catch (error) {
    stopLoader();
    setStatus(error.message, true);
  } finally {
    button.disabled = false;
    buttonLabel.textContent = "Scan";
  }
});

retestButton.addEventListener("click", () => {
  if (input.value.trim()) form.requestSubmit();
});

exportJsonButton.addEventListener("click", exportJson);
printReportButton.addEventListener("click", downloadReport);
renderHistory();
