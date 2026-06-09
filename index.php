<?php
/**
 * Template Name: ZCS_Google Partner
 * Template Post Type: page
 */
get_header();

/* -----------------------------------------------------------
 |  STATIC CONTENT (EDIT COPY/IMAGES/LINKS HERE)
 |  ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
 |  $spec_* controls the 1st section “Our Google Specializations”
 |  $tabs controls the 2nd section tabs and the “Data & Analytics” sub-sections
 |  $active_tab sets which tab is selected by default: 'genai' | 'ml' | 'data'
 ----------------------------------------------------------- */
$spec_title    = 'Our Google Specializations';
$spec_subtitle = 'Exploring the depth of innovation across three key disciplines; from intelligent automation to data-driven transformation.';
$spec_cards = [
  // Card 1
  [
    'image'       => 'http://zionclouds.com/wp-content/uploads/2025/10/Generative-AI.png',
    'title'       => 'Generative AI',
    'description' => "Build conversational systems, document automation, and knowledge assistants powered by Google's Vertex AI and Gemini models.",
    'link_url'    => '/products/summarizeai',
    'link_label'  => 'Explore GenAI →',
  ],
  // Card 2
  [
    'image'       => 'http://zionclouds.com/wp-content/uploads/2025/10/Machine-Learning.png',
    'title'       => 'Machine Learning',
    'description' => 'Deploy models through Vertex AI, train at scale with TensorFlow, and integrate AI into production workflows.',
    'link_url'    => '/insights/ml',
    'link_label'  => 'Explore ML →',
  ],
  // Card 3
  [
    'image'       => 'http://zionclouds.com/wp-content/uploads/2025/10/Data-Analytics.png',
    'title'       => 'Data & Analytics',
    'description' => 'Modernize data foundations on BigQuery, integrate Looker dashboards, and enable real-time decision analytics.',
    'link_url'    => '/products/insightsai',
    'link_label'  => 'Explore Data & Analytics →',
  ],
];

/* Tabs data for Section 2 */
$tabs = [
  'genai' => [
    'label'   => 'Generative AI',
    'heading' => 'Designing Responsible, Agentic AI Systems with Google Cloud Vertex AI',
    'paras'   => [
      "Zion Cloud Solutions builds Generative AI solutions on Vertex AI, combining model orchestration, retrieval-augmented generation, and responsible AI practices for secure enterprise use.",
      "We integrate Gemini 1.5 Pro and Vertex AI Search & Conversation to power document understanding, conversational agents, and workflow automation."
    ],
    'image'   => 'http://zionclouds.com/wp-content/uploads/2025/10/Generative-AI.png',
  ],
  'ml' => [
    'label'   => 'Machine Learning',
    'heading' => 'Operationalize Machine Learning with Vertex AI',
    'paras'   => [
      "Train with TensorFlow, orchestrate pipelines, and serve models on Vertex AI endpoints with monitoring and CI/CD.",
      "Our MLOps patterns shorten time-to-value and bring reproducibility, lineage, and automated evaluations to production."
    ],
    'image'   => 'http://zionclouds.com/wp-content/uploads/2025/10/Machine-Learning.png',
  ],
  'data' => [
    'label'   => 'Data & Analytics',
    'heading' => 'Building Data-Driven Enterprises with Google Cloud',
    'paras'   => [
      "Struggling with silo'd data? ZCS helps modernize data ecosystems, break down silos, and uncover insights - enabling better outcomes with unified governance and intelligent decision-making on Google's industry-leading data platform.",
      "We modernize foundations on BigQuery, integrate Looker dashboards, and enable faster insights, unified governance, and intelligent decision-making."
    ],
    'image'   => 'http://zionclouds.com/wp-content/uploads/2025/10/Data-Analytics.png',
    'cta'     => [
      'label' => 'Talk to Our Data Analytics Experts ->',
      'url'   => '/contact',
    ],
  ],
];
$active_tab = 'data'; // Default active tab: 'genai' | 'ml' | 'data'
?>
<main class="main zcs-page">
  <style>
    /* -------------------------------------------------------
     |  GLOBAL STYLE SNIPPETS (SAFE TO TWEAK)
     ------------------------------------------------------- */
    .zcs-heading-60 { font-size:50px; line-height:1.15; }
    @media (max-width: 767.98px) { .zcs-heading-60 { font-size:36px; line-height:1.2; } }

    /* Tab button look/feel */
    #zcs-google-tabbed .zgt__tab{cursor:pointer;border:none;background:none;padding:12px 24px;border-radius:999px;font-weight:700;color:#0b3154}
    #zcs-google-tabbed .zgt__tab[aria-selected="true"]{background:#fff;color:#0b3154;border:1px solid #d9e4f5;box-shadow:0 2px 8px rgba(14,40,80,.08)}
    #zcs-google-tabbed .zgt__cta{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:14px 28px;border-radius:999px;border:1px solid #0b3154;color:#0b3154;text-decoration:none;transition:background-color .2s ease,color .2s ease}
    #zcs-google-tabbed .zgt__cta:hover{background-color:#0b3154;color:#fff}
    @media(max-width:767.98px){ #zcs-google-tabbed .zgt__card{padding:22px} }
  </style>

  <!-- =======================================================
       BREADCRUMB
       ======================================================= -->
  <nav class="container-fluid" aria-label="breadcrumb" style="margin-top:18px;">
    <div class="container-fluid" style="width:80%;max-width:1600px;margin:0 auto;">
      <ol class="breadcrumb" style="--bs-breadcrumb-divider:'›';font-size:14px;">
        <li class="breadcrumb-item"><a href="<?php echo esc_url(home_url('/')); ?>">Home</a></li>
        <li class="breadcrumb-item active" aria-current="page">Google Cloud Partner</li>
      </ol>
    </div>
  </nav>

  <!-- =======================================================
       SECTION 1: SPECIALIZATIONS
       ======================================================= -->
  <section id="zcs-google-specializations" style="background:#eaf1fb;padding:56px 0 64px;">
    <div class="container-fluid" style="width:80%;max-width:1600px;margin:0 auto;">
      <div class="text-center mb-4" style="max-width:900px;margin:auto;">
        <h2 class="zcs-heading-60" style="color:#0b3154;font-weight:600;"><?php echo esc_html($spec_title); ?></h2>
        <p style="color:#304b63;"><?php echo esc_html($spec_subtitle); ?></p>
      </div>

      <div class="row gy-4 gx-xl-4">
        <?php foreach ($spec_cards as $card): ?>
        <div class="col-12 col-md-6 col-xl-4">
          <div class="card border-0 shadow-sm h-100" style="border-radius:16px;">
            <div class="position-relative pt-56" style="position:relative;padding-top:56%;margin:16px 16px 0;border-radius:16px;overflow:hidden;">
              <img src="<?php echo esc_url($card['image']); ?>" alt="<?php echo esc_attr($card['title']); ?>" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">
            </div>
            <div class="card-body text-center pt-3">
              <h3 class="fw-semibold" style="color:#09385e;"><?php echo esc_html($card['title']); ?></h3>
              <p style="color:#324b63;"><?php echo esc_html($card['description']); ?></p>
              <a href="<?php echo esc_url($card['link_url']); ?>" class="fw-bold" style="color:#0a63c8;text-decoration:none;"><?php echo esc_html($card['link_label']); ?></a>
            </div>
          </div>
        </div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- =======================================================
       SECTION 2: TABBED + MAIN CARD
       ======================================================= -->
  <section id="zcs-google-tabbed" style="background:#eaf1fb;padding:32px 0 48px;">
    <div class="container-fluid" style="width:80%;max-width:1600px;margin:0 auto;">

      <!-- Tabs -->
      <div class="text-center mb-4">
        <div class="zgt__tabs" role="tablist" aria-label="Google Specializations Tabs"
             style="display:inline-flex;gap:8px;background:#f3f7ff;border:1px solid #d9e4f5;border-radius:999px;padding:6px;">
          <?php foreach ($tabs as $slug => $t): ?>
            <button class="zgt__tab" role="tab" aria-selected="<?php echo $slug===$active_tab?'true':'false'; ?>" data-tab="<?php echo esc_attr($slug); ?>">
              <?php echo esc_html($t['label']); ?>
            </button>
          <?php endforeach; ?>
        </div>
      </div>

      <!-- Active content -->
      <div class="zgt__card card border-0 shadow-lg" style="border-radius:18px;padding:80px 60px;border:1px solid #e4ecf7; margin-top:60px; margin-bottom:60px;">
        <div class="row g-4 align-items-start">
          <div class="col-12 col-lg-6">
            <h2 id="zgt-heading" class="zcs-heading-60" style="color:#0b3154;font-weight:600;"><?php echo esc_html($tabs[$active_tab]['heading']); ?></h2>
          </div>
          <div class="col-12 col-lg-6 d-flex flex-column gap-3" id="zgt-copy">
            <?php foreach ($tabs[$active_tab]['paras'] as $p): ?>
              <p style="color:#304b63;line-height:1.6;"><?php echo esc_html($p); ?></p>
            <?php endforeach; ?>
            <?php if (!empty($tabs[$active_tab]['cta'])): ?>
              <a id="zgt-cta"
                 class="zgt__cta fw-semibold"
                 href="<?php echo esc_url($tabs[$active_tab]['cta']['url']); ?>">
                <?php echo esc_html($tabs[$active_tab]['cta']['label']); ?>
              </a>
            <?php endif; ?>
          </div>
          <div class="col-12">
            <div class="overflow-hidden rounded-3">
              <img id="zgt-image" src="<?php echo esc_url($tabs[$active_tab]['image']); ?>" alt="" style="width:100%;height:360px;object-fit:cover;">
            </div>
          </div>
        </div>
      </div>


      <!-- =====================================================
           GENAI TAB EXTRAS (Visible for 'genai')
           ===================================================== -->
      <div id="zgt-genai-extras" style="<?php echo $active_tab==='genai'?'':'display:none'; ?>;margin-top:24px;">

        <div class="row g-4 align-items-stretch">
          <div class="col-12 col-lg-6 d-flex">
            <div class="card shadow-sm border-0 flex-fill p-4" style="border-radius:18px;">
              <div class="card-body d-flex flex-column justify-content-center">
                <h3 class="zcs-heading-60 fw-semibold mb-3" style="color:#0b3154;">Our Generative AI Practice</h3>
                <p class="mb-2" style="color:#304b63;">
                  ZCS’s Generative AI practice leverages Google Cloud’s Vertex AI platform to create intelligent, context-aware applications.
                </p>
                <p style="color:#304b63;">
                  Our engineers integrate Gemini 1.5 Pro and Vertex AI Search &amp; Conversation to power document understanding,
                  conversational agents, and workflow automation.
                </p>
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-6 d-flex">
            <div class="card shadow-sm border-0 flex-fill" style="border-radius:18px; padding:80px 60px; border:1px solid #e4ecf7;">
              <div class="card-body">
                <h4 class="fw-semibold mb-3" style="color:#0b3154;">Core Google Cloud Products We Use</h4>
                <ul class="mb-0" style="color:#304b63;line-height:1.7;">
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- What We Deliver (GENAI) -->
        <section class="py-5" style="padding-top:100px; padding-bottom:100px;">
          <h2 class="text-center zcs-heading-60 fw-semibold mb-4" style="color:#0b3154;">What We Deliver</h2>
          <div class="row g-4">
            <div class="col-12 col-md-6 d-flex">
              <div class="card border-0 shadow-sm rounded-4 text-center flex-fill" style="border-radius:18px; padding:50px;">
                <div class="card-body d-flex flex-column align-items-center justify-content-center p-4">
                  <h3 class="h5 fw-semibold mb-2" style="color:#0b3154;">Conversational Assistants</h3>
                  <p class="mb-0" style="color:#304b63;">Secure GenAI chatbots trained on internal or domain-specific data.</p>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6 d-flex">
              <div class="card border-0 shadow-sm rounded-4 text-center flex-fill" style="border-radius:18px; padding:50px;">
                <div class="card-body d-flex flex-column align-items-center justify-content-center p-4">
                  <h3 class="h5 fw-semibold mb-2" style="color:#0b3154;">Document Intelligence</h3>
                  <p class="mb-0" style="color:#304b63;">Automating classification, summarization, and insight extraction.</p>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6 d-flex">
              <div class="card border-0 shadow-sm rounded-4 text-center flex-fill" style="border-radius:18px; padding:50px;">
                <div class="card-body d-flex flex-column align-items-center justify-content-center p-4">
                  <h3 class="h5 fw-semibold mb-2" style="color:#0b3154;">Content Generation</h3>
                  <p class="mb-0" style="color:#304b63;">AI-generated reports, proposals, and learning material with governance control.</p>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6 d-flex">
              <div class="card border-0 shadow-sm rounded-4 text-center flex-fill" style="border-radius:18px; padding:50px;">
                <div class="card-body d-flex flex-column align-items-center justify-content-center p-4">
                  <h3 class="h5 fw-semibold mb-2" style="color:#0b3154;">Knowledge Agents</h3>
                  <p class="mb-0" style="color:#304b63;">Internal AI assistants that integrate with BigQuery and Google Workspace data.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Responsible & Secure AI (GENAI) -->
        <div class="mt-5" style="background:#0a3154;color:#e9f1fb;border:1px solid #082a47;border-radius:24px; padding:80px 60px; margin-top:60px; margin-bottom:60px;">
          <h3 class="zcs-heading-60 fw-semibold mb-4" style="color:#fff;">Responsible &amp; Secure AI Framework</h3>
          <p class="mb-4" style="color:#cfe2f3;">Our GenAI deployments follow principles of responsibility, transparency, and data protection, using:</p>
          <ul class="mb-0" style="color:#eaf3ff; line-height:1.8;">
            <li>Google Cloud’s Vertex AI Responsible AI Toolkit</li>
            <li>Encryption-in-use and data isolation for sensitive workloads</li>
            <li>Audit logging and RBAC for compliance with SOC 2 and NIST standards</li>
          </ul>
        </div>

        <!-- Two sample case cards (GENAI) -->
        <div class="card shadow-sm border-0" style="border-radius:18px; padding:0; overflow:hidden; margin-bottom:24px;">
          <div class="row g-0"><div class="col-12">
            <img src="http://zionclouds.com/wp-content/uploads/2025/10/Generative-AI.png" alt="" style="width:100%;height:220px;object-fit:cover;">
          </div></div>
          <div class="p-4">
            <span class="badge rounded-pill" style="background:#0b3154;color:#fff;">Case Study</span>
            <p class="mb-0 mt-2" style="color:#304b63;">GenAI-driven document summarization for a state-level agency.</p>
          </div>
        </div>

        <div class="card shadow-sm border-0" style="border-radius:18px; padding:0; overflow:hidden;">
          <div class="row g-0"><div class="col-12">
            <img src="http://zionclouds.com/wp-content/uploads/2025/10/Generative-AI.png" alt="" style="width:100%;height:220px;object-fit:cover;">
          </div></div>
          <div class="p-4">
            <span class="badge rounded-pill" style="background:#0b3154;color:#fff;">Case Study</span>
            <p class="mb-0 mt-2" style="color:#304b63;">Conversational policy assistant using Vertex AI Search.</p>
          </div>
        </div>

        <!-- Why ZCS (GENAI mini) -->
        <div class="text-center mt-5 p-5" style="background:#c83737;color:#fff;border-radius:24px; padding-top:80px !important; padding-bottom:80px !important;">
          <h2 class="zcs-heading-60 fw-semibold mb-5" style="color:#fff;">Why Zion Cloud Solutions — Generative AI</h2>
          <div class="row g-4 justify-content-center align-items-start">
            <div class="col-12 col-lg-4 d-flex flex-column align-items-center px-4">
              <p class="mb-0 text-center" style="max-width:300px;line-height:1.6;">Certified Google Cloud Partner in Generative AI Services</p>
            </div>
            <div class="col-12 col-lg-4 d-flex flex-column align-items-center px-4">
              <p class="mb-0 text-center" style="max-width:300px;line-height:1.6;">Specialized in Gemini and Vertex AI architecture design</p>
            </div>
            <div class="col-12 col-lg-4 d-flex flex-column align-items-center px-4">
              <p class="mb-0 text-center" style="max-width:300px;line-height:1.6;">Committed to secure, responsible AI practices</p>
            </div>
          </div>
          <div class="mt-5">
            <a href="/contact" class="d-inline-block fw-semibold"
               style="border:1px solid rgba(255,255,255,.85);border-radius:12px;padding:16px 28px;color:#fff;text-decoration:none;">
              Connect with a GenAI Expert →
            </a>
          </div>
        </div>
      </div><!-- /#zgt-genai-extras -->
    </div>

    <!-- =======================================================
         JS: SIMPLE TABS SWITCHER (now toggles DATA + GenAI extras)
         ======================================================= -->
    <script>
      (function(){
        const tabs = document.querySelectorAll('#zcs-google-tabbed .zgt__tab');
        const headingEl = document.getElementById('zgt-heading');
        const copyEl = document.getElementById('zgt-copy');
        const imgEl = document.getElementById('zgt-image');

        const extrasData  = document.getElementById('zgt-data-extras');
        const extrasGenAI = document.getElementById('zgt-genai-extras');

        const tabData = <?php echo json_encode($tabs); ?>;

        function setActive(slug){
          tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.tab === slug ? 'true' : 'false'));
          const data = tabData[slug]; if(!data) return;

          headingEl.textContent = data.heading || '';
          imgEl.src = data.image || '';
          copyEl.innerHTML = '';
          (data.paras || []).forEach(txt => {
            const p = document.createElement('p');
            p.style.color = '#304b63'; p.style.lineHeight='1.6';
            p.textContent = txt; copyEl.appendChild(p);
          });
          if (data.cta && data.cta.url && data.cta.label) {
            const btn = document.createElement('a');
            btn.className = 'zgt__cta fw-semibold';
            btn.href = data.cta.url;
            btn.textContent = data.cta.label;
            btn.id = 'zgt-cta';
            copyEl.appendChild(btn);
          }

          if (extrasData)  extrasData.style.display  = (slug === 'data') ? '' : 'none';
          if (extrasGenAI) extrasGenAI.style.display = (slug === 'genai') ? '' : 'none';
        }

        tabs.forEach(t => {
          t.addEventListener('click', () => setActive(t.dataset.tab));
          t.addEventListener('keydown', e => {
            if(e.key==='Enter'||e.key===' '){
              e.preventDefault(); setActive(t.dataset.tab);
            }
          });
        });
      })();
    </script>
  </section>
</main>

<?php get_footer(); ?>
