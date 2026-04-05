// scripts/ui-en.js — burger menu, back-to-top button, modal preview, header shadow

// Burger menu (after loading menu from menu.html)
document.addEventListener("menuLoaded", () => {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.classList.toggle("no-scroll-nav", isOpen);
    });
    nav.addEventListener("click", (e) => {
      if (e.target.tagName === "A" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("no-scroll-nav");
      }
    });
  }
});

// Back-to-top button
(function () {
  const btn = document.getElementById("backToTopBtn");
  if (!btn) return;
  btn.style.display = "none";
  window.addEventListener(
    "scroll",
    function () {
      btn.style.display = window.scrollY > 50 ? "block" : "none";
    },
    { passive: true }
  );
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

// Modal image preview (avatar/certificates)
(function () {
  const modal = document.getElementById("imgModal");
  const modalImg = document.getElementById("modalImg");
  const closeBtn = document.getElementById("modalClose");
  if (!modal || !modalImg || !closeBtn) return;

  function openModalWithSrc(src) {
    modal.style.display = "block";
    modal.setAttribute("aria-hidden", "false");
    modalImg.src = src;
    document.body.classList.add("no-scroll");
    closeBtn.focus();
  }
  function closeModal() {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    modalImg.removeAttribute("src");
    document.body.classList.remove("no-scroll");
  }

  modalImg.addEventListener("click", closeModal);

  const previewImg = document.getElementById("previewImg");
  if (previewImg) {
    previewImg.classList.add("logo-image--clickable");
    previewImg.addEventListener("click", () =>
      openModalWithSrc(previewImg.src)
    );
  }

  document
    .querySelectorAll(".certificates img, .hack-block img")
    .forEach((img) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => openModalWithSrc(img.src));
    });

  closeBtn.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
})();

// Header shadow on scroll
(function () {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > 4) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

// Skills modal — detailed description on click
(function () {
  const modal = document.getElementById("skillModal");
  const overlay = modal ? modal.querySelector(".skill-modal__overlay") : null;
  const closeBtn = document.getElementById("skillModalClose");
  const titleEl = document.getElementById("skillModalTitle");
  const subtitleEl = document.getElementById("skillModalSubtitle");
  const bodyEl = document.getElementById("skillModalBody");
  const tagsEl = document.getElementById("skillModalTags");
  if (!modal || !titleEl || !bodyEl) return;

  /** Extended skill descriptions — data-skill → { desc, tags, details } */
  const SKILLS = {
    csharp: {
      desc: "Primary working language. Deep mastery of the ecosystem from low-level optimizations to high-level abstractions.",
      tags: ["async/await", "Span<T>", "LINQ", "Reflection", "Source Generators"],
      details: "<p>Working with C# for over 7 years. Expertise in:</p><ul><li>Multithreading: lock, Interlocked, Mutex, Monitor, Semaphore, SemaphoreSlim, ConcurrentDictionary, Channel&lt;T&gt;</li><li>Performance: Span&lt;T&gt;, Memory&lt;T&gt;, ArrayPool, allocation profiling via dotMemory/BenchmarkDotNet</li><li>Patterns: Generic Host, Options, DI, Mediator, Specification</li><li>Latest versions: C# 12, .NET 8, minimal APIs, AOT compilation</li></ul>"
    },
    sql: {
      desc: "Schema design and query optimization for high-load systems.",
      tags: ["T-SQL", "Indexes", "Execution Plans", "CTEs", "Window Functions"],
      details: "<p>Experience with SQL Server and PostgreSQL in production:</p><ul><li>Normalization to 3NF/BCNF, denormalization for reporting</li><li>Optimization: plan analysis (EXPLAIN/ANALYZE, SET STATISTICS), covering indexes, statistics</li><li>Analytical queries: window functions (ROW_NUMBER, LEAD/LAG, NTILE), recursive CTEs</li><li>Schema migrations: Flyway, EF Migrations, custom scripts</li></ul>"
    },
    python: {
      desc: "Automation, CI/CD scripts, helper services and integrations.",
      tags: ["Flask", "FastAPI", "CLI", "Automation", "REST"],
      details: "<p>Using Python for:</p><ul><li>CLI utilities for DevOps process automation</li><li>API clients and integrations (REST, WebSocket)</li><li>Simple microservices with Flask/FastAPI</li><li>Data processing and ETL scripts</li></ul>"
    },
    "ts-js": {
      desc: "TypeScript for frontend and server-side tooling, REST API integrations.",
      tags: ["TypeScript", "ES2022+", "Webpack", "Vite", "Node.js"],
      details: "<p>Using TypeScript/JavaScript in:</p><ul><li>React/Angular frontend with strict typing</li><li>Build configuration: Webpack, Vite, esbuild</li><li>REST API interaction, client generation from OpenAPI</li><li>Publishing npm packages to private registry (Verdaccio)</li></ul>"
    },
    "html-css": {
      desc: "Semantic markup, responsive design, dark theme, accessibility.",
      tags: ["Semantic HTML", "CSS Grid", "Flexbox", "Dark Theme", "A11y"],
      details: "<p>Markup skills:</p><ul><li>Semantic markup (article, section, nav, ARIA)</li><li>CSS Grid, Flexbox, Container Queries</li><li>Responsive design with clamp()/min()/max()</li><li>Dark theme via CSS custom properties and prefers-color-scheme</li></ul>"
    },
    dotnet: {
      desc: "Platform .NET 6/8 for building microservices and enterprise solutions.",
      tags: [".NET 8", "Minimal APIs", "Generic Host", "DI", "Configuration"],
      details: "<p>Primary working platform:</p><ul><li>Microservice architecture: Generic Host, IHostedService, BackgroundService</li><li>Configuration: Options pattern, IConfiguration, secrets</li><li>Logging: Serilog, structured logs, correlation</li><li>Testing: WebApplicationFactory, TestServer, integration tests</li><li>Containerization: multi-stage Docker builds, health checks</li></ul>"
    },
    aspnetcore: {
      desc: "REST API design with middleware, validation and documentation.",
      tags: ["REST", "Middleware", "Swagger", "Versioning", "Auth"],
      details: "<p>Key competencies:</p><ul><li>REST API: contracts, versioning (URL/Header), HATEOAS</li><li>Authorization: JWT Bearer, OAuth 2.0, policies, Resource-based</li><li>Middleware pipeline: custom middleware, Exception handling</li><li>Documentation: Swagger/OpenAPI, SDK client generation (NSwag, Kiota)</li><li>Performance: caching (Response/Distributed), Rate Limiting</li></ul>"
    },
    aspnetmvc: {
      desc: "Support and modernization of legacy ASP.NET MVC applications.",
      tags: ["MVC 5", "Razor", "Legacy", "Migration"],
      details: "<p>Legacy experience:</p><ul><li>Support for ASP.NET MVC 5 / Web Forms systems</li><li>Gradual migration to ASP.NET Core</li><li>Legacy code performance optimization</li><li>Integration of modern approaches (DI, async) into old code</li></ul>"
    },
    blazor: {
      desc: "Component model in C# for interactive web applications.",
      tags: ["WASM", "Components", "JS Interop", "SignalR"],
      details: "<p>Blazor WebAssembly:</p><ul><li>Components, cascading parameters, RenderFragment</li><li>State management: Fluxor, cascading values</li><li>JS Interop for integration with JS libraries</li><li>SignalR hubs for real-time</li></ul>"
    },
    efcore: {
      desc: "ORM for .NET: Code First, migrations, LINQ query optimization.",
      tags: ["Code First", "Migrations", "LINQ", "NoTracking", "Concurrency"],
      details: "<p>Entity Framework Core in production:</p><ul><li>Code First: Fluent API, conventions, ValueConverters</li><li>Migrations: CI automation, seed data</li><li>Performance: AsNoTracking, Split Queries, Compiled Queries</li><li>Concurrency: RowVersion, optimistic locking</li><li>Profiling: SQL logging, MiniProfiler</li></ul>"
    },
    dapper: {
      desc: "Micro-ORM for high-performance data access.",
      tags: ["Raw SQL", "Multi-Mapping", "Stored Procs", "Performance"],
      details: "<p>Dapper for performance-critical sections:</p><ul><li>Manual mappings, multi-mapping (One-to-Many, Many-to-Many)</li><li>Read/Write split (CQRS read-side)</li><li>Stored procedures and dynamic parameters</li><li>Batch operations, bulk insert via SqlBulkCopy</li></ul>"
    },
    grpc: {
      desc: "High-performance binary RPC for inter-service communication.",
      tags: ["Protobuf", "Streams", "Interceptors", "Load Balancing"],
      details: "<p>gRPC in microservices:</p><ul><li>Contract definition via .proto files</li><li>Unary, Server/Client/Bidirectional streaming</li><li>Interceptors for logging, authorization, metrics</li><li>Load balancing: client-side (gRPC-LB) and via Envoy/Linkerd</li></ul>"
    },
    signalr: {
      desc: "Real-time for web clients: notifications, chats, dashboards.",
      tags: ["Hubs", "Groups", "Backplane", "WebSocket"],
      details: "<p>SignalR in production:</p><ul><li>Hubs, groups, connection authorization</li><li>Scaling: Redis Backplane, Azure SignalR Service</li><li>Fallback transports: WebSocket → SSE → Long Polling</li><li>Integration with Blazor WASM and React clients</li></ul>"
    },
    wcf: {
      desc: "Support for legacy WCF services and migration paths.",
      tags: ["SOAP", "Legacy", "CoreWCF", "Migration"],
      details: "<p>Working with legacy WCF:</p><ul><li>Support for existing SOAP services</li><li>Migration to CoreWCF or REST</li><li>Contract compatibility during transition</li></ul>"
    },
    react: {
      desc: "SPAs and interfaces for internal services on React + TypeScript.",
      tags: ["React 18", "TypeScript", "Hooks", "React Router"],
      details: "<p>React for internal tools:</p><ul><li>Functional components, hooks (useState, useEffect, useReducer, useMemo)</li><li>React Router for navigation, lazy route loading</li><li>REST API integration via axios/fetch</li><li>State management: Context API, Zustand</li></ul>"
    },
    angular: {
      desc: "Support and improvements of existing Angular modules.",
      tags: ["Angular", "RxJS", "TypeScript", "Modules"],
      details: "<p>Angular for existing projects:</p><ul><li>Component fixes, service work and DI</li><li>REST API integration via HttpClient</li><li>Angular version migrations</li></ul>"
    },
    xamarin: {
      desc: "Cross-platform mobile and desktop development in C#.",
      tags: ["Xamarin.Forms", ".NET MAUI", "Mobile", "Cross-platform"],
      details: "<p>Mobile development:</p><ul><li>Xamarin.Forms for iOS/Android from a single codebase</li><li>Migration to .NET MAUI</li><li>MVVM pattern, navigation, native APIs</li></ul>"
    },
    gitlabci: {
      desc: "Pipelines build/test/deploy, artifacts, environments, agents.",
      tags: ["YAML", "Stages", "Artifacts", "Environments", "Helm"],
      details: "<p>Primary CI/CD platform:</p><ul><li>Multi-stage YAML pipelines with caching and artifacts</li><li>Deploy to Kubernetes via Helm charts</li><li>Environments: dev/staging/production with Manual Approval</li><li>Shared Runners and self-managed GitLab Runners</li><li>Automatic review apps for MR</li></ul>"
    },
    tfs: {
      desc: "Build and release pipeline configuration in TFS 2018, Windows/Linux agents.",
      tags: ["TFS 2018", "Build/Release", "Agent Pools", "XAML"],
      details: "<p>Working with TFS 2018:</p><ul><li>Build/Release pipeline creation and maintenance</li><li>Release templates for multi-stage deployment</li><li>Agent pool configuration (Windows/Linux)</li><li>SonarQube and Artifactory integration</li></ul>"
    },
    jenkins: {
      desc: "Declarative pipelines, Shared Libraries, Docker integration.",
      tags: ["Declarative Pipeline", "Shared Libs", "Docker", "Webhooks"],
      details: "<p>Jenkins CI:</p><ul><li>Declarative and Scripted pipelines (Jenkinsfile)</li><li>Shared Libraries for logic reuse</li><li>Docker Registry integration for push/pull images</li><li>Webhook triggers from GitLab/GitHub</li></ul>"
    },
    git: {
      desc: "Branching, code review, GitFlow, policies and automation.",
      tags: ["GitFlow", "PR/MR", "Rebase", "Branch Policies", "Hooks"],
      details: "<p>Daily tool:</p><ul><li>PR/MR processes, review culture</li><li>GitFlow, trunk-based and feature-branch strategies</li><li>Rebase vs Merge, squash, cherry-pick</li><li>Branch policies, required reviewers, CI gates</li><li>Git hooks for linting and commit checks</li></ul>"
    },
    ansible: {
      desc: "Provisioning, server configuration, idempotent playbooks.",
      tags: ["Playbooks", "Roles", "Vault", "Inventory", "Idempotency"],
      details: "<p>Ansible for infrastructure:</p><ul><li>Playbooks for server provisioning</li><li>Roles, collections, dynamic inventory</li><li>Ansible Vault for secrets</li><li>CI/CD integration for configuration rollout</li></ul>"
    },
    teamcity: {
      desc: "CI server from JetBrains: configuration, artifacts, integrations.",
      tags: ["Build Configs", "Artifacts", "VCS Triggers", "Kotlin DSL"],
      details: "<p>TeamCity CI:</p><ul><li>Build configurations with parameters and dependencies</li><li>Artifacts and dependencies between configurations</li><li>VCS and Issue-tracker integration</li><li>Kotlin DSL for Configuration as Code</li></ul>"
    },
    "ado-agents": {
      desc: "Azure DevOps: agent pools, YAML pipelines, artifacts and secrets.",
      tags: ["Azure Pipelines", "YAML", "Agent Pools", "Artifacts", "Secrets"],
      details: "<p>Azure DevOps platform:</p><ul><li>YAML pipelines with multi-stage and templates</li><li>Self-hosted agent configuration (Windows/Linux)</li><li>Tokens, parallel builds, queue optimization</li><li>Azure Artifacts for NuGet/npm feeds</li><li>Security: Variable Groups, Key Vault integration</li></ul>"
    },
    octopus: {
      desc: "Deployment automation and release management via Octopus Deploy.",
      tags: ["Projects", "Environments", "Runbooks", "Tenants", "Variables"],
      details: "<p>Octopus Deploy:</p><ul><li>Projects with multi-stage deployment</li><li>Environments: Dev → Staging → Production</li><li>Variables with scope by environments and tenants</li><li>Runbooks for operational tasks</li><li>TeamCity/Azure DevOps/Jenkins integration</li></ul>"
    },
    ghactions: {
      desc: "CI/CD in GitHub ecosystem: workflows, matrix builds, actions.",
      tags: ["Workflows", "Matrix", "Reusable Actions", "GitHub Pages"],
      details: "<p>GitHub Actions:</p><ul><li>YAML workflows with matrix builds and conditions</li><li>Reusable and composite actions</li><li>Deploy to GitHub Pages, Docker Registry, K8s</li><li>Secrets management and OIDC</li></ul>"
    },
    docker: {
      desc: "Containerization: Dockerfile, multi-stage builds, registries.",
      tags: ["Dockerfile", "Multi-stage", "BuildKit", "Registries"],
      details: "<p>Docker in daily work:</p><ul><li>Multi-stage Dockerfile for .NET, Node.js, Python</li><li>BuildKit: layer caching, build secrets, SSH</li><li>Image size optimization (alpine, distroless)</li><li>Working with private registries (Harbor, GitLab Registry, ACR)</li><li>Docker-in-Docker for CI agents</li></ul>"
    },
    compose: {
      desc: "Container orchestration for local development and testing.",
      tags: ["docker-compose", "Networks", "Volumes", "Profiles"],
      details: "<p>Docker Compose:</p><ul><li>Multi-container environments: API + DB + Redis + RabbitMQ</li><li>Override files for dev/test/prod</li><li>Profiles for optional services</li><li>Healthchecks and depends_on with condition</li></ul>"
    },
    kubernetes: {
      desc: "Orchestration, deployment, scaling and cluster monitoring.",
      tags: ["Deployment", "StatefulSet", "HPA", "Services", "RBAC"],
      details: "<p>Kubernetes in production:</p><ul><li>Deployment, StatefulSet, DaemonSet, CronJob</li><li>ConfigMap/Secret, external storage mounting</li><li>HPA/VPA for auto-scaling</li><li>Network Policies, RBAC, Pod Security</li><li>Monitoring: Prometheus Operator, kube-state-metrics</li></ul>"
    },
    helm: {
      desc: "K8s resource packaging: charts, values, repositories.",
      tags: ["Charts", "Values", "Templates", "Repositories"],
      details: "<p>Helm for deployment:</p><ul><li>Custom charts with templates and helpers</li><li>Values per environment (dev/staging/prod)</li><li>Helm repositories (ChartMuseum, OCI)</li><li>Deployment via GitLab CI with helm upgrade --install</li></ul>"
    },
    ingress: {
      desc: "HTTP traffic routing in K8s: TLS, rewrite, rate-limit.",
      tags: ["Ingress NGINX", "TLS", "cert-manager", "Annotations"],
      details: "<p>Ingress in Kubernetes:</p><ul><li>Ingress NGINX Controller: routing annotations</li><li>TLS termination via cert-manager + Let's Encrypt</li><li>Rewrite rules, custom headers, rate limiting</li><li>Load balancing and sticky sessions</li></ul>"
    },
    nuget: {
      desc: "Management of .NET packages: creation, publication, private feeds.",
      tags: ["NuGet", ".nuspec", "Private Feeds", "Versioning"],
      details: "<p>NuGet ecosystem:</p><ul><li>Creating and publishing NuGet packages</li><li>Private feeds: Azure Artifacts, BaGet</li><li>Semantic Versioning, pre-releases</li><li>Publishing automation from CI/CD</li></ul>"
    },
    verdaccio: {
      desc: "Local npm registry for caching and private modules.",
      tags: ["npm", "Private Registry", "Caching", "Scoped Packages"],
      details: "<p>Verdaccio:</p><ul><li>Private npm registry setup and administration</li><li>Public package caching for offline access</li><li>Scoped packages for internal libraries</li><li>Authentication and access rights</li></ul>"
    },
    harbor: {
      desc: "Private Docker image registries with audit and vulnerability scanning.",
      tags: ["Docker Registry", "Vulnerability Scan", "Replication", "RBAC"],
      details: "<p>Harbor:</p><ul><li>Docker image storage and management</li><li>Vulnerability scanning (Trivy)</li><li>Replication between locations</li><li>RBAC, quotas, Webhook notifications</li></ul>"
    },
    postgres: {
      desc: "Design, indexing and performance optimization.",
      tags: ["PostgreSQL", "Indexes", "EXPLAIN", "Partitioning", "Extensions"],
      details: "<p>PostgreSQL in production:</p><ul><li>Normalization, indexes (btree, gin, gist, brin)</li><li>EXPLAIN ANALYZE, pg_stat_statements</li><li>Partitioning for large tables</li><li>Extensions: pg_trgm, PostGIS, TimescaleDB</li><li>Migrations via Flyway/EF Core</li></ul>"
    },
    mssql: {
      desc: "T-SQL, stored procedures, SSRS/SSAS reporting.",
      tags: ["T-SQL", "Stored Procs", "SSRS", "SSAS", "Performance"],
      details: "<p>MS SQL Server:</p><ul><li>Stored procedures, functions, triggers</li><li>Optimization: indexes, statistics, Query Store</li><li>SSRS for report building</li><li>SSAS/OLAP for multidimensional analysis</li><li>Always On, replication, backups</li></ul>"
    },
    mongodb: {
      desc: "Document-oriented database for microservices.",
      tags: ["MongoDB", "Aggregation", "Indexes", "Replica Set"],
      details: "<p>MongoDB:</p><ul><li>Collection and schema design</li><li>Aggregation pipeline for analytics</li><li>Indexes: compound, text, TTL</li><li>Replica Set, sharding</li></ul>"
    },
    neo4j: {
      desc: "Graph database for modeling relationships and nested structures.",
      tags: ["Neo4j", "Cypher", "Graph", "Relationships"],
      details: "<p>Neo4j:</p><ul><li>Cypher queries for graph traversal</li><li>Relationship modeling: costs, hierarchies, dependencies</li><li>Query optimization and indexing</li></ul>"
    },
    redis: {
      desc: "Caching, sessions, Pub/Sub, distributed locks.",
      tags: ["Redis", "Cache", "Pub/Sub", "Streams", "Sentinel"],
      details: "<p>Redis in microservices:</p><ul><li>Data caching (IDistributedCache)</li><li>Distributed locks (Redlock)</li><li>Pub/Sub for events, Streams for queues</li><li>Sentinel for HA, Cluster for scaling</li></ul>"
    },
    elasticsearch: {
      desc: "Full-text search and log analytics.",
      tags: ["Elasticsearch", "Kibana", "ELK", "Mappings", "Aggregations"],
      details: "<p>Elasticsearch:</p><ul><li>Indexes, mappings, analyzers</li><li>Full-text search with ranking</li><li>Aggregations for analytics</li><li>Kibana dashboards for visualization</li></ul>"
    },
    olap: {
      desc: "Multidimensional analytics via MS Analysis Services.",
      tags: ["OLAP", "Cubes", "MDX", "Dimensions", "Measures"],
      details: "<p>OLAP/Analysis Services:</p><ul><li>Cube modeling: dimensions and facts</li><li>MDX queries for data slicing</li><li>Aggregations and partitions for performance</li><li>Cell and dimension-level security</li></ul>"
    },
    pentaho: {
      desc: "ETL processes, BI reports and Big Data work.",
      tags: ["ETL", "Pentaho DI", "Reports", "Big Data"],
      details: "<p>Pentaho:</p><ul><li>ETL processes via Pentaho Data Integration (Kettle)</li><li>BI report and dashboard building</li><li>Integration with various data sources</li></ul>"
    },
    superset: {
      desc: "Data visualization and dashboards on Apache Superset.",
      tags: ["Superset", "Dashboards", "SQLAlchemy", "Charts"],
      details: "<p>Apache Superset:</p><ul><li>Dashboard and chart creation</li><li>SQLAlchemy connection to various databases</li><li>Filters, cross-filtering, drill-down</li></ul>"
    },
    airflow: {
      desc: "Workflow orchestration and ETL pipeline management.",
      tags: ["Airflow", "DAGs", "Operators", "Scheduling"],
      details: "<p>Apache Airflow:</p><ul><li>DAG definitions for workflows</li><li>Operators: BashOperator, PythonOperator, KubernetesPodOperator</li><li>Scheduling, monitoring, retries</li></ul>"
    },
    ssrs: {
      desc: "SQL Server Reporting Services: reports and visualization.",
      tags: ["SSRS", "RDL", "Parameters", "Subscriptions"],
      details: "<p>SSRS:</p><ul><li>Report design (RDL/RDLC)</li><li>Parameterized reports with drill-through</li><li>Subscriptions and scheduled delivery</li><li>SharePoint integration</li></ul>"
    },
    rest: {
      desc: "Standardized HTTP interfaces, contract-first approach.",
      tags: ["REST", "HTTP", "OpenAPI", "Idempotency", "Pagination"],
      details: "<p>REST API design:</p><ul><li>Method idempotency, correct HTTP codes</li><li>Pagination (cursor/offset), filtering, sorting</li><li>Contract-first approach via OpenAPI 3.0</li><li>Versioning: URI, Header, Query</li></ul>"
    },
    websocket: {
      desc: "Real-time for streaming and notifications.",
      tags: ["WebSocket", "Streaming", "Reconnect", "Binary"],
      details: "<p>WebSocket:</p><ul><li>Subscriptions and real-time</li><li>Automatic reconnect with exponential backoff</li><li>Binary message exchange</li><li>SignalR and native WS integration</li></ul>"
    },
    ngcp: {
      desc: "RTPengine control protocol.",
      tags: ["NGCP", "RTPengine", "VoIP", "Protocol"],
      details: "<p>NGCP:</p><ul><li>Extended RTPengine control protocol</li><li>VoIP infrastructure integration</li></ul>"
    },
    openapi: {
      desc: "API contracts, automatic client and server generation.",
      tags: ["Swagger", "OpenAPI 3.0", "NSwag", "Kiota", "SDK Gen"],
      details: "<p>Swagger/OpenAPI:</p><ul><li>API documentation via Swagger UI / ReDoc</li><li>Schema validation and contract compatibility</li><li>SDK generation: NSwag (C#), Kiota, openapi-generator</li><li>Contract-first vs Code-first approaches</li></ul>"
    },
    oauth2: {
      desc: "Authorization and access delegation via OAuth 2.0.",
      tags: ["OAuth 2.0", "OIDC", "JWT", "PKCE", "Refresh Tokens"],
      details: "<p>OAuth 2.0 / OIDC:</p><ul><li>Authorization Code + PKCE, Client Credentials</li><li>JWT: validation, claims, refresh tokens</li><li>Keycloak, Azure AD, IdentityServer integration</li><li>Secure token storage and secret management</li></ul>"
    },
    rabbitmq: {
      desc: "Message queues: exchange, routing, dead-letter, retries.",
      tags: ["RabbitMQ", "Exchange", "Queue", "DLQ", "MassTransit"],
      details: "<p>RabbitMQ:</p><ul><li>Exchange types: Direct, Fanout, Topic, Headers</li><li>Dead Letter Exchange for error handling</li><li>Acknowledgments (ACK/NACK), idempotency</li><li>MassTransit / NServiceBus integration</li><li>Clustering and queue mirroring</li></ul>"
    },
    kafka: {
      desc: "Event streaming, consumer groups, end-to-end processing.",
      tags: ["Kafka", "Topics", "Partitions", "Consumer Groups", "Streams"],
      details: "<p>Apache Kafka:</p><ul><li>Topics and partitions, message keys</li><li>Consumer groups and offset management</li><li>Exactly-once semantics</li><li>Confluent and Schema Registry integration</li></ul>"
    },
    prometheus: {
      desc: "Metrics, alerts, exporters for services and clusters.",
      tags: ["Prometheus", "PromQL", "Alertmanager", "Exporters"],
      details: "<p>Prometheus:</p><ul><li>Metric collection: Counter, Gauge, Histogram, Summary</li><li>PromQL for queries and alert rules</li><li>Alertmanager: routing, silencing, grouping</li><li>Exporters: node_exporter, kube-state-metrics, custom</li></ul>"
    },
    grafana: {
      desc: "Observability dashboards, SLA monitoring and analytics.",
      tags: ["Grafana", "Dashboards", "Alerts", "Datasources"],
      details: "<p>Grafana:</p><ul><li>Dashboards with variables and drill-down</li><li>Datasources: Prometheus, Loki, Elasticsearch, PostgreSQL</li><li>Annotations for deployment events</li><li>Provisioning via JSON/YAML</li></ul>"
    },
    elk: {
      desc: "Centralized logging: Elasticsearch + Logstash + Kibana.",
      tags: ["ELK", "Logstash", "Kibana", "Filebeat", "Pipelines"],
      details: "<p>ELK Stack:</p><ul><li>Logstash/Filebeat for log collection and parsing</li><li>Elasticsearch for indexing and storage</li><li>Kibana for visualization and search</li><li>Index lifecycle management and rotation</li></ul>"
    },
    jaeger: {
      desc: "Distributed request tracing in microservices.",
      tags: ["Jaeger", "OpenTelemetry", "Tracing", "Spans"],
      details: "<p>Jaeger / OpenTelemetry:</p><ul><li>OpenTelemetry SDK for .NET instrumentation</li><li>HTTP, gRPC, DB query tracing</li><li>Latency analysis and service bottleneck identification</li><li>Export to Jaeger, Zipkin, OTLP</li></ul>"
    },
    nginx: {
      desc: "Reverse proxy, static files, TLS termination.",
      tags: ["Nginx", "Reverse Proxy", "TLS", "Caching", "Load Balancing"],
      details: "<p>Nginx:</p><ul><li>Virtual host configuration</li><li>TLS termination and HTTP/2</li><li>Backend application proxying</li><li>Static file caching and micro-cache</li><li>Load balancing: round-robin, least_conn, ip_hash</li></ul>"
    },
    traefik: {
      desc: "Dynamic reverse proxy with auto-service discovery.",
      tags: ["Traefik", "Docker", "Kubernetes", "Let's Encrypt", "Middleware"],
      details: "<p>Traefik:</p><ul><li>Auto-service discovery via Docker/K8s providers</li><li>Automatic TLS via Let's Encrypt</li><li>Middleware: rate limiting, basic auth, headers</li><li>Routing by hosts, paths, headers</li></ul>"
    },
    cerbot: {
      desc: "Automatic SSL certificate acquisition and renewal.",
      tags: ["Certbot", "Let's Encrypt", "ACME", "Wildcard"],
      details: "<p>Certbot / Let's Encrypt:</p><ul><li>Automatic SSL certificate acquisition</li><li>Wildcard certificates via DNS challenge</li><li>Auto-renewal via cron/systemd timer</li><li>Nginx, Apache, standalone integration</li></ul>"
    },
    iis: {
      desc: "Hosting .NET applications in Windows environment.",
      tags: ["IIS", "App Pools", "Windows", ".NET Hosting"],
      details: "<p>IIS:</p><ul><li>Sites and application pools</li><li>ASP.NET Core / MVC deployment</li><li>Logging, limits and security</li><li>URL Rewrite, Application Request Routing</li></ul>"
    },
    apache: {
      desc: "Classic web server: .htaccess, mod_rewrite, mod_proxy.",
      tags: ["Apache", "mod_rewrite", "mod_proxy", "Virtual Hosts"],
      details: "<p>Apache HTTP Server:</p><ul><li>Virtual hosts, mod_proxy for proxying</li><li>mod_ssl for TLS, mod_rewrite for URL routing</li><li>.htaccess for access control</li></ul>"
    },
    caddy: {
      desc: "Automatic HTTPS, zero-config web server.",
      tags: ["Caddy", "Auto HTTPS", "Caddyfile", "API"],
      details: "<p>Caddy:</p><ul><li>Automatic TLS certificate acquisition</li><li>Caddyfile for simple configuration</li><li>Reverse proxy with health checks</li><li>API for dynamic management</li></ul>"
    },
    ddd: {
      desc: "Domain-driven design for complex system architecture.",
      tags: ["DDD", "Bounded Context", "Aggregates", "Events", "Ubiquitous Language"],
      details: "<p>Domain-Driven Design:</p><ul><li>Bounded Context and Context Mapping</li><li>Aggregates, Entities, Value Objects</li><li>Domain Events and Event Sourcing</li><li>Ubiquitous Language and business collaboration</li><li>Anti-corruption layers for integration</li></ul>"
    },
    solid: {
      desc: "Design principles for code quality and maintainability.",
      tags: ["SRP", "OCP", "LSP", "ISP", "DIP"],
      details: "<p>SOLID in practice:</p><ul><li>SRP: class decomposition by responsibility zones</li><li>OCP: extension via abstractions without modification</li><li>LSP: correct subtype substitution</li><li>ISP: narrow interfaces instead of \"fat\" ones</li><li>DIP: abstraction dependency, DI container</li></ul>"
    },
    cqrs: {
      desc: "Command and Query separation for scalable systems.",
      tags: ["CQRS", "Event Sourcing", "MediatR", "Read/Write Split"],
      details: "<p>CQRS:</p><ul><li>Command and Query model separation</li><li>Event Sourcing: storing events instead of state</li><li>MediatR for command/query routing</li><li>Eventual consistency and projections</li></ul>"
    },
    kiss: {
      desc: "Principle of simplicity: minimal dependencies, clear architecture.",
      tags: ["KISS", "Simplicity", "Minimal Dependencies"],
      details: "<p>KISS:</p><ul><li>Simple interfaces, minimal dependencies</li><li>Avoiding over-engineering</li><li>Clear code that is easy to read and maintain</li></ul>"
    },
    tdd: {
      desc: "Development via testing: red-green-refactor.",
      tags: ["TDD", "Red-Green-Refactor", "Test Pyramid", "Unit Tests"],
      details: "<p>Test-Driven Development:</p><ul><li>Cycle: Red → Green → Refactor</li><li>Test pyramid: unit → integration → E2E</li><li>Fast unit tests for instant feedback</li><li>Code coverage as metric, not goal</li></ul>"
    },
    "clean-arch": {
      desc: "Layered architecture with clear dependencies and boundaries.",
      tags: ["Clean Architecture", "Use Cases", "Entities", "Ports & Adapters"],
      details: "<p>Clean Architecture:</p><ul><li>Layers: Entities → Use Cases → Interface Adapters → Frameworks</li><li>Dependency rule: inner layers don't know about outer ones</li><li>Ports & Adapters (Hexagonal) for testability</li><li>Separation of Concerns and inversion of control</li></ul>"
    },
    "agile-scrum": {
      desc: "Iterative development, Scrum ceremonies, flow metrics.",
      tags: ["Scrum", "Kanban", "Sprint", "Retrospective", "Velocity"],
      details: "<p>Agile / Scrum:</p><ul><li>Sprint planning, estimation (Planning Poker, Story Points)</li><li>Daily Standup, Sprint Review, Retrospective</li><li>Kanban boards, WIP limits, flow metrics</li><li>Refinement/Grooming for backlog preparation</li></ul>"
    },
    xunit: {
      desc: "Unit testing .NET: xUnit, NUnit, parameterization.",
      tags: ["xUnit", "NUnit", "Theory", "TestCase", "CI"],
      details: "<p>Unit testing:</p><ul><li>xUnit: Fact, Theory, InlineData, ClassData</li><li>NUnit: TestCase, TestFixture, parameterization</li><li>CI integration for automatic test runs</li><li>Code coverage: Coverlet, ReportGenerator</li></ul>"
    },
    moq: {
      desc: "Mocking dependencies for isolated tests.",
      tags: ["Moq", "NSubstitute", "Mocking", "Verify"],
      details: "<p>Mocking:</p><ul><li>Moq: Setup, Returns, Verify, Callback</li><li>NSubstitute: more readable syntax</li><li>AutoMocker for automatic mock creation</li><li>Verification of calls and arguments</li></ul>"
    },
    selenium: {
      desc: "E2E testing of web applications via browser.",
      tags: ["Selenium", "WebDriver", "E2E", "Playwright"],
      details: "<p>E2E testing:</p><ul><li>Selenium WebDriver for browser automation</li><li>Page Object Model for maintainable tests</li><li>Playwright as modern alternative</li></ul>"
    },
    postman: {
      desc: "API testing: collections, variables, automation.",
      tags: ["Postman", "Collections", "Newman", "Pre-request Scripts"],
      details: "<p>Postman:</p><ul><li>Request collections with environments</li><li>Pre-request and Test scripts</li><li>Newman for CI execution</li><li>Mock servers and documentation</li></ul>"
    },
    windows: {
      desc: "Server roles, services, .NET environment configuration.",
      tags: ["Windows Server", "Services", "Active Directory", "IIS"],
      details: "<p>Windows:</p><ul><li>Windows Server: roles, services, group policies</li><li>Active Directory for authentication</li><li>.NET and CI agent environment setup</li><li>Permissions, task scheduler, Event Log</li></ul>"
    },
    linux: {
      desc: "Production environment for containers, services and monitoring.",
      tags: ["Ubuntu", "CentOS", "systemd", "Networking", "Security"],
      details: "<p>Linux:</p><ul><li>Ubuntu/CentOS for production servers</li><li>systemd for service management</li><li>Network configuration: firewalld/iptables, DNS</li><li>Security: SSH hardening, fail2ban, updates</li></ul>"
    }
  };

  function openSkillModal(card) {
    const skillKey = card.getAttribute("data-skill");
    const titleBtn = card.querySelector(".skill-title");
    const tooltipEl = card.querySelector(".skill-tooltip");
    const contentEl = card.querySelector(".skill-content");

    const name = titleBtn ? titleBtn.textContent.trim() : "";
    const tooltip = tooltipEl ? tooltipEl.textContent.trim() : "";

    const data = SKILLS[skillKey];

    titleEl.textContent = name;
    subtitleEl.textContent = data ? data.desc : tooltip;

    if (data && data.details) {
      bodyEl.innerHTML = data.details;
    } else if (contentEl) {
      bodyEl.innerHTML = contentEl.innerHTML;
    } else {
      bodyEl.innerHTML = "<p>" + tooltip + "</p>";
    }

    // Tags
    tagsEl.innerHTML = "";
    if (data && data.tags) {
      data.tags.forEach(function (t) {
        const span = document.createElement("span");
        span.className = "skill-modal__tag";
        span.textContent = t;
        tagsEl.appendChild(span);
      });
    }

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    closeBtn.focus();
  }

  function closeSkillModal() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  // Click on .skill-title → modal
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".skill-title");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const card = btn.closest(".skill-card");
    if (card) openSkillModal(card);
  });

  closeBtn.addEventListener("click", closeSkillModal);
  if (overlay) overlay.addEventListener("click", closeSkillModal);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeSkillModal();
    }
  });
})();

// Obfuscated contacts — protection from spam bots
(function () {
  document.querySelectorAll("[data-contact]").forEach((el) => {
    const encoded = el.getAttribute("data-contact");
    try {
      const decoded = atob(encoded);
      el.setAttribute("href", decoded);
      const labelEl = el.querySelector(".contact-text");
      if (labelEl && el.hasAttribute("data-label")) {
        labelEl.textContent = atob(el.getAttribute("data-label"));
      }
    } catch (e) {
      // graceful degradation
    }
  });
})();
