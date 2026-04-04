// scripts/ui.js — бургер-меню, кнопка «Наверх», модальное превью, тень шапки

// Бургер-меню (после загрузки меню из menu.html)
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

// Кнопка «Наверх»
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

// Модальное превью изображений (аватар/сертификаты)
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

// Тень у шапки при скролле
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

// Модальное окно навыков — подробное описание при клике
(function () {
  const modal = document.getElementById("skillModal");
  const overlay = modal ? modal.querySelector(".skill-modal__overlay") : null;
  const closeBtn = document.getElementById("skillModalClose");
  const titleEl = document.getElementById("skillModalTitle");
  const subtitleEl = document.getElementById("skillModalSubtitle");
  const bodyEl = document.getElementById("skillModalBody");
  const tagsEl = document.getElementById("skillModalTags");
  if (!modal || !titleEl || !bodyEl) return;

  /** Расширенные описания навыков — data-skill → { desc, tags, details } */
  const SKILLS = {
    csharp: {
      desc: "Основной рабочий язык. Глубокое владение экосистемой от low-level оптимизаций до высокоуровневых абстракций.",
      tags: ["async/await", "Span<T>", "LINQ", "Reflection", "Source Generators"],
      details: "<p>Работаю с C# более 7 лет. Владею:</p><ul><li>Многопоточность: lock, Interlocked, Mutex, Monitor, Semaphore, SemaphoreSlim, ConcurrentDictionary, Channel&lt;T&gt;</li><li>Производительность: Span&lt;T&gt;, Memory&lt;T&gt;, ArrayPool, профилирование аллокаций через dotMemory/BenchmarkDotNet</li><li>Паттерны: Generic Host, Options, DI, Mediator, Specification</li><li>Последние версии: C# 12, .NET 8, minimal APIs, AOT-компиляция</li></ul>"
    },
    sql: {
      desc: "Проектирование схем и оптимизация запросов для высоконагруженных систем.",
      tags: ["T-SQL", "Indexes", "Execution Plans", "CTEs", "Window Functions"],
      details: "<p>Опыт работы с SQL Server и PostgreSQL в production:</p><ul><li>Нормализация до 3NF/BCNF, денормализация для отчётности</li><li>Оптимизация: анализ планов (EXPLAIN/ANALYZE, SET STATISTICS), покрывающие индексы, статистика</li><li>Аналитические запросы: оконные функции (ROW_NUMBER, LEAD/LAG, NTILE), рекурсивные CTE</li><li>Миграции схем: Flyway, EF Migrations, собственные скрипты</li></ul>"
    },
    python: {
      desc: "Автоматизация, скрипты для CI/CD, вспомогательные сервисы и интеграции.",
      tags: ["Flask", "FastAPI", "CLI", "Automation", "REST"],
      details: "<p>Использую Python для:</p><ul><li>CLI-утилиты для автоматизации DevOps-процессов</li><li>API-клиенты и интеграции (REST, WebSocket)</li><li>Простые микросервисы на Flask/FastAPI</li><li>Скрипты обработки данных и ETL</li></ul>"
    },
    "ts-js": {
      desc: "TypeScript для фронтенда и серверного tooling, интеграции с REST API.",
      tags: ["TypeScript", "ES2022+", "Webpack", "Vite", "Node.js"],
      details: "<p>Применяю TypeScript/JavaScript в:</p><ul><li>React/Angular фронтенд с строгой типизацией</li><li>Настройка сборки: Webpack, Vite, esbuild</li><li>Взаимодействие с REST API, генерация клиентов по OpenAPI</li><li>Публикация npm-пакетов в приватный реестр (Verdaccio)</li></ul>"
    },
    "html-css": {
      desc: "Семантическая вёрстка, адаптивный дизайн, тёмная тема, доступность.",
      tags: ["Semantic HTML", "CSS Grid", "Flexbox", "Dark Theme", "A11y"],
      details: "<p>Навыки вёрстки:</p><ul><li>Семантическая разметка (article, section, nav, ARIA)</li><li>CSS Grid, Flexbox, Container Queries</li><li>Адаптивный дизайн с clamp()/min()/max()</li><li>Тёмная тема через CSS custom properties и prefers-color-scheme</li></ul>"
    },
    dotnet: {
      desc: "Платформа .NET 6/8 для построения микросервисов и enterprise-решений.",
      tags: [".NET 8", "Minimal APIs", "Generic Host", "DI", "Configuration"],
      details: "<p>Основная рабочая платформа:</p><ul><li>Микросервисная архитектура: Generic Host, IHostedService, BackgroundService</li><li>Конфигурация: Options pattern, IConfiguration, секреты</li><li>Логирование: Serilog, структурированные логи, корреляция</li><li>Тестирование: WebApplicationFactory, TestServer, интеграционные тесты</li><li>Контейнеризация: multi-stage Docker builds, health checks</li></ul>"
    },
    aspnetcore: {
      desc: "Проектирование REST API с middleware, валидацией и документацией.",
      tags: ["REST", "Middleware", "Swagger", "Versioning", "Auth"],
      details: "<p>Ключевые компетенции:</p><ul><li>REST API: контракты, версионирование (URL/Header), HATEOAS</li><li>Авторизация: JWT Bearer, OAuth 2.0, политики, Resource-based</li><li>Middleware pipeline: кастомные middleware, Exception handling</li><li>Документация: Swagger/OpenAPI, генерация SDK-клиентов (NSwag, Kiota)</li><li>Производительность: кеширование (Response/Distributed), Rate Limiting</li></ul>"
    },
    aspnetmvc: {
      desc: "Поддержка и модернизация легаси ASP.NET MVC приложений.",
      tags: ["MVC 5", "Razor", "Legacy", "Migration"],
      details: "<p>Опыт с легаси:</p><ul><li>Поддержка систем на ASP.NET MVC 5 / Web Forms</li><li>Поэтапная миграция на ASP.NET Core</li><li>Оптимизация производительности legacy-кода</li><li>Интеграция современных подходов (DI, async) в старый код</li></ul>"
    },
    blazor: {
      desc: "Компонентная модель на C# для интерактивных веб-приложений.",
      tags: ["WASM", "Components", "JS Interop", "SignalR"],
      details: "<p>Blazor WebAssembly:</p><ul><li>Компоненты, каскадные параметры, RenderFragment</li><li>Управление состоянием: Fluxor, каскадные значения</li><li>JS Interop для интеграции с JS-библиотеками</li><li>SignalR-хабы для реального времени</li></ul>"
    },
    efcore: {
      desc: "ORM для .NET: Code First, миграции, оптимизация LINQ-запросов.",
      tags: ["Code First", "Migrations", "LINQ", "NoTracking", "Concurrency"],
      details: "<p>Entity Framework Core в production:</p><ul><li>Code First: Fluent API, конвенции, ValueConverters</li><li>Миграции: автоматизация через CI, seed-данные</li><li>Производительность: AsNoTracking, Split Queries, Compiled Queries</li><li>Конкаренси: RowVersion, оптимистичная блокировка</li><li>Профилирование: логирование SQL, MiniProfiler</li></ul>"
    },
    dapper: {
      desc: "Микро-ORM для высокопроизводительного доступа к данным.",
      tags: ["Raw SQL", "Multi-Mapping", "Stored Procs", "Performance"],
      details: "<p>Dapper для критичных по производительности участков:</p><ul><li>Ручные маппинги, мульти-маппинг (One-to-Many, Many-to-Many)</li><li>Сплит на чтение/запись (CQRS read-side)</li><li>Хранимые процедуры и динамические параметры</li><li>Batch-операции, bulk insert через SqlBulkCopy</li></ul>"
    },
    grpc: {
      desc: "Высокопроизводительные бинарные RPC для межсервисного взаимодействия.",
      tags: ["Protobuf", "Streams", "Interceptors", "Load Balancing"],
      details: "<p>gRPC в микросервисах:</p><ul><li>Определение контрактов через .proto файлы</li><li>Unary, Server/Client/Bidirectional стриминг</li><li>Interceptors для логирования, авторизации, метрик</li><li>Балансировка: клиентская (gRPC-LB) и через Envoy/Linkerd</li></ul>"
    },
    signalr: {
      desc: "Реальное время для веб-клиентов: уведомления, чаты, дашборды.",
      tags: ["Hubs", "Groups", "Backplane", "WebSocket"],
      details: "<p>SignalR в production:</p><ul><li>Хабы, группы, авторизация подключений</li><li>Масштабирование: Redis Backplane, Azure SignalR Service</li><li>Fallback-транспорты: WebSocket → SSE → Long Polling</li><li>Интеграция с Blazor WASM и React-клиентами</li></ul>"
    },
    wcf: {
      desc: "Поддержка легаси WCF сервисов и миграционные пути.",
      tags: ["SOAP", "Legacy", "CoreWCF", "Migration"],
      details: "<p>Работа с legacy WCF:</p><ul><li>Поддержка существующих SOAP-сервисов</li><li>Миграция на CoreWCF или REST</li><li>Совместимость контрактов при переходе</li></ul>"
    },
    react: {
      desc: "SPA и интерфейсы для внутренних сервисов на React + TypeScript.",
      tags: ["React 18", "TypeScript", "Hooks", "React Router"],
      details: "<p>React для внутренних инструментов:</p><ul><li>Функциональные компоненты, хуки (useState, useEffect, useReducer, useMemo)</li><li>React Router для навигации, lazy-загрузка маршрутов</li><li>Интеграция с REST API через axios/fetch</li><li>Стейт-менеджмент: Context API, Zustand</li></ul>"
    },
    angular: {
      desc: "Поддержка и доработка существующих Angular-модулей.",
      tags: ["Angular", "RxJS", "TypeScript", "Modules"],
      details: "<p>Angular для существующих проектов:</p><ul><li>Правки компонентов, работа с сервисами и DI</li><li>Интеграция с REST API через HttpClient</li><li>Миграции между версиями Angular</li></ul>"
    },
    xamarin: {
      desc: "Кроссплатформенная мобильная и десктоп-разработка на C#.",
      tags: ["Xamarin.Forms", ".NET MAUI", "Mobile", "Cross-platform"],
      details: "<p>Мобильная разработка:</p><ul><li>Xamarin.Forms для iOS/Android из одной кодовой базы</li><li>Переход на .NET MAUI</li><li>MVVM-паттерн, навигация, нативные API</li></ul>"
    },
    gitlabci: {
      desc: "Пайплайны build/test/deploy, артефакты, окружения, агенты.",
      tags: ["YAML", "Stages", "Artifacts", "Environments", "Helm"],
      details: "<p>Основная CI/CD платформа:</p><ul><li>Многоэтапные YAML-пайплайны с кэшированием и артефактами</li><li>Deploy на Kubernetes через Helm-чарты</li><li>Окружения: dev/staging/production с Manual Approval</li><li>Shared Runners и собственные GitLab Runners</li><li>Автоматические review apps для MR</li></ul>"
    },
    tfs: {
      desc: "Конфигурация билдов и релизов в TFS 2018, агенты Windows/Linux.",
      tags: ["TFS 2018", "Build/Release", "Agent Pools", "XAML"],
      details: "<p>Работа с TFS 2018:</p><ul><li>Создание и поддержка Build/Release pipelines</li><li>Шаблоны release для multi-stage деплоя</li><li>Настройка пулов агентов (Windows/Linux)</li><li>Интеграция с SonarQube и Artifactory</li></ul>"
    },
    jenkins: {
      desc: "Declarative pipelines, Shared Libraries, интеграция с Docker.",
      tags: ["Declarative Pipeline", "Shared Libs", "Docker", "Webhooks"],
      details: "<p>Jenkins CI:</p><ul><li>Declarative и Scripted pipelines (Jenkinsfile)</li><li>Shared Libraries для переиспользования логики</li><li>Интеграция с Docker Registry для push/pull образов</li><li>Webhook-триггеры из GitLab/GitHub</li></ul>"
    },
    git: {
      desc: "Ветвление, code-review, GitFlow, политики и автоматизация.",
      tags: ["GitFlow", "PR/MR", "Rebase", "Branch Policies", "Hooks"],
      details: "<p>Ежедневный инструмент:</p><ul><li>PR/MR-процессы, review-культура</li><li>GitFlow, trunk-based и feature-branch стратегии</li><li>Rebase vs Merge, squash, cherry-pick</li><li>Branch policies, required reviewers, CI gates</li><li>Git hooks для линтинга и проверки коммитов</li></ul>"
    },
    ansible: {
      desc: "Provisioning, конфигурация серверов, идемпотентные плейбуки.",
      tags: ["Playbooks", "Roles", "Vault", "Inventory", "Idempotency"],
      details: "<p>Ansible для инфраструктуры:</p><ul><li>Плейбуки для provisioning серверов</li><li>Роли, коллекции, динамический инвентори</li><li>Ansible Vault для секретов</li><li>Интеграция с CI/CD для раскатки конфигураций</li></ul>"
    },
    teamcity: {
      desc: "CI-сервер от JetBrains: конфигурация, артефакты, интеграции.",
      tags: ["Build Configs", "Artifacts", "VCS Triggers", "Kotlin DSL"],
      details: "<p>TeamCity CI:</p><ul><li>Конфигурации билдов с параметрами и зависимостями</li><li>Артефакты и зависимости между конфигурациями</li><li>Интеграция с VCS и Issue-трекерами</li><li>Kotlin DSL для Configuration as Code</li></ul>"
    },
    "ado-agents": {
      desc: "Azure DevOps: пулы агентов, YAML-пайплайны, артефакты и секреты.",
      tags: ["Azure Pipelines", "YAML", "Agent Pools", "Artifacts", "Secrets"],
      details: "<p>Azure DevOps platform:</p><ul><li>YAML-пайплайны с multi-stage и templates</li><li>Конфигурация self-hosted агентов (Windows/Linux)</li><li>Маркеры, параллельные сборки, оптимизация очередей</li><li>Azure Artifacts для NuGet/npm фидов</li><li>Безопасность: Variable Groups, Key Vault интеграция</li></ul>"
    },
    octopus: {
      desc: "Автоматизация деплоя и управление релизами через Octopus Deploy.",
      tags: ["Projects", "Environments", "Runbooks", "Tenants", "Variables"],
      details: "<p>Octopus Deploy:</p><ul><li>Проекты с многоэтапным деплоем</li><li>Окружения: Dev → Staging → Production</li><li>Переменные с scope по окружениям и тенантам</li><li>Runbooks для операционных задач</li><li>Интеграция с TeamCity/Azure DevOps/Jenkins</li></ul>"
    },
    ghactions: {
      desc: "CI/CD в экосистеме GitHub: workflows, matrix builds, actions.",
      tags: ["Workflows", "Matrix", "Reusable Actions", "GitHub Pages"],
      details: "<p>GitHub Actions:</p><ul><li>YAML workflows с matrix builds и условиями</li><li>Reusable actions и composite actions</li><li>Деплой на GitHub Pages, Docker Registry, K8s</li><li>Secrets management и OIDC</li></ul>"
    },
    docker: {
      desc: "Контейнеризация: Dockerfile, multi-stage сборки, реестры.",
      tags: ["Dockerfile", "Multi-stage", "BuildKit", "Registries"],
      details: "<p>Docker в ежедневной работе:</p><ul><li>Multi-stage Dockerfile для .NET, Node.js, Python</li><li>BuildKit: кэширование слоёв, build secrets, SSH</li><li>Оптимизация размера образов (alpine, distroless)</li><li>Работа с приватными реестрами (Harbor, GitLab Registry, ACR)</li><li>Docker-in-Docker для CI-агентов</li></ul>"
    },
    compose: {
      desc: "Оркестрация контейнеров для локальной разработки и тестирования.",
      tags: ["docker-compose", "Networks", "Volumes", "Profiles"],
      details: "<p>Docker Compose:</p><ul><li>Многоконтейнерные среды: API + DB + Redis + RabbitMQ</li><li>Override-файлы для dev/test/prod</li><li>Profiles для опциональных сервисов</li><li>Healthchecks и depends_on с condition</li></ul>"
    },
    kubernetes: {
      desc: "Оркестрация, деплой, масштабирование и мониторинг кластеров.",
      tags: ["Deployment", "StatefulSet", "HPA", "Services", "RBAC"],
      details: "<p>Kubernetes в production:</p><ul><li>Deployment, StatefulSet, DaemonSet, CronJob</li><li>ConfigMap/Secret, подключение внешних хранилищ</li><li>HPA/VPA для автомасштабирования</li><li>Network Policies, RBAC, Pod Security</li><li>Мониторинг: Prometheus Operator, kube-state-metrics</li></ul>"
    },
    helm: {
      desc: "Пакетирование K8s-ресурсов: чарты, values, репозитории.",
      tags: ["Charts", "Values", "Templates", "Repositories"],
      details: "<p>Helm для деплоя:</p><ul><li>Собственные чарты с шаблонами и helpers</li><li>Values per environment (dev/staging/prod)</li><li>Helm-репозитории (ChartMuseum, OCI)</li><li>Деплой через GitLab CI с helm upgrade --install</li></ul>"
    },
    ingress: {
      desc: "Маршрутизация HTTP-трафика в K8s: TLS, rewrite, rate-limit.",
      tags: ["Ingress NGINX", "TLS", "cert-manager", "Annotations"],
      details: "<p>Ingress в Kubernetes:</p><ul><li>Ingress NGINX Controller: аннотации для routing</li><li>TLS-терминация через cert-manager + Let's Encrypt</li><li>Rewrite rules, custom headers, rate limiting</li><li>Балансировка и sticky sessions</li></ul>"
    },
    nuget: {
      desc: "Управление .NET-пакетами: создание, публикация, приватные фиды.",
      tags: ["NuGet", ".nuspec", "Private Feeds", "Versioning"],
      details: "<p>NuGet экосистема:</p><ul><li>Создание и публикация NuGet-пакетов</li><li>Приватные фиды: Azure Artifacts, BaGet</li><li>Semantic Versioning, пререлизы</li><li>Автоматизация публикации из CI/CD</li></ul>"
    },
    verdaccio: {
      desc: "Локальный npm-реестр для кэширования и приватных модулей.",
      tags: ["npm", "Private Registry", "Caching", "Scoped Packages"],
      details: "<p>Verdaccio:</p><ul><li>Настройка и администрирование приватного npm-реестра</li><li>Кэширование публичных пакетов для offline-доступа</li><li>Scoped packages для внутренних библиотек</li><li>Аутентификация и права доступа</li></ul>"
    },
    harbor: {
      desc: "Приватные реестры Docker-образов с аудитом и сканированием.",
      tags: ["Docker Registry", "Vulnerability Scan", "Replication", "RBAC"],
      details: "<p>Harbor:</p><ul><li>Хранение и управление Docker-образами</li><li>Сканирование уязвимостей (Trivy)</li><li>Репликация между площадками</li><li>RBAC, квоты, Webhook-уведомления</li></ul>"
    },
    postgres: {
      desc: "Проектирование, индексация и оптимизация производительности.",
      tags: ["PostgreSQL", "Indexes", "EXPLAIN", "Partitioning", "Extensions"],
      details: "<p>PostgreSQL в production:</p><ul><li>Нормализация, индексы (btree, gin, gist, brin)</li><li>EXPLAIN ANALYZE, pg_stat_statements</li><li>Партиционирование для больших таблиц</li><li>Расширения: pg_trgm, PostGIS, TimescaleDB</li><li>Миграции через Flyway/EF Core</li></ul>"
    },
    mssql: {
      desc: "T-SQL, хранимые процедуры, отчётность SSRS/SSAS.",
      tags: ["T-SQL", "Stored Procs", "SSRS", "SSAS", "Performance"],
      details: "<p>MS SQL Server:</p><ul><li>Хранимые процедуры, функции, триггеры</li><li>Оптимизация: индексы, статистика, Query Store</li><li>SSRS для построения отчётов</li><li>SSAS/OLAP для многомерного анализа</li><li>Always On, репликация, бэкапы</li></ul>"
    },
    mongodb: {
      desc: "Документо-ориентированная БД для микросервисов.",
      tags: ["MongoDB", "Aggregation", "Indexes", "Replica Set"],
      details: "<p>MongoDB:</p><ul><li>Проектирование коллекций и схем</li><li>Aggregation pipeline для аналитики</li><li>Индексы: compound, text, TTL</li><li>Replica Set, шардирование</li></ul>"
    },
    neo4j: {
      desc: "Графовая БД для моделирования связей и вложенных структур.",
      tags: ["Neo4j", "Cypher", "Graph", "Relationships"],
      details: "<p>Neo4j:</p><ul><li>Cypher-запросы для обхода графов</li><li>Моделирование связей: затраты, иерархии, зависимости</li><li>Оптимизация запросов и индексация</li></ul>"
    },
    redis: {
      desc: "Кэширование, сессии, Pub/Sub, распределённые блокировки.",
      tags: ["Redis", "Cache", "Pub/Sub", "Streams", "Sentinel"],
      details: "<p>Redis в микросервисах:</p><ul><li>Кэширование данных (IDistributedCache)</li><li>Распределённые блокировки (Redlock)</li><li>Pub/Sub для событий, Streams для очередей</li><li>Sentinel для HA, Cluster для масштабирования</li></ul>"
    },
    elasticsearch: {
      desc: "Полнотекстовый поиск и аналитика логов.",
      tags: ["Elasticsearch", "Kibana", "ELK", "Mappings", "Aggregations"],
      details: "<p>Elasticsearch:</p><ul><li>Индексы, маппинги, анализаторы</li><li>Полнотекстовый поиск с ранжированием</li><li>Агрегации для аналитики</li><li>Kibana-дашборды для визуализации</li></ul>"
    },
    olap: {
      desc: "Многомерная аналитика через MS Analysis Services.",
      tags: ["OLAP", "Cubes", "MDX", "Dimensions", "Measures"],
      details: "<p>OLAP/Analysis Services:</p><ul><li>Моделирование кубов: измерения и факты</li><li>MDX-запросы для срезов данных</li><li>Агрегации и партиции для производительности</li><li>Безопасность на уровне ячеек и измерений</li></ul>"
    },
    pentaho: {
      desc: "ETL-процессы, BI-отчёты и работа с Big Data.",
      tags: ["ETL", "Pentaho DI", "Reports", "Big Data"],
      details: "<p>Pentaho:</p><ul><li>ETL-процессы через Pentaho Data Integration (Kettle)</li><li>Построение BI-отчётов и дашбордов</li><li>Интеграция с различными источниками данных</li></ul>"
    },
    superset: {
      desc: "Визуализация данных и дашборды на Apache Superset.",
      tags: ["Superset", "Dashboards", "SQLAlchemy", "Charts"],
      details: "<p>Apache Superset:</p><ul><li>Создание дашбордов и чартов</li><li>Подключение через SQLAlchemy к различным БД</li><li>Фильтры, кросс-фильтрация, drill-down</li></ul>"
    },
    airflow: {
      desc: "Оркестрация рабочих процессов и ETL-пайплайнов.",
      tags: ["Airflow", "DAGs", "Operators", "Scheduling"],
      details: "<p>Apache Airflow:</p><ul><li>DAG-определения для рабочих процессов</li><li>Операторы: BashOperator, PythonOperator, KubernetesPodOperator</li><li>Расписание, мониторинг, ретраи</li></ul>"
    },
    ssrs: {
      desc: "SQL Server Reporting Services: отчёты и визуализация.",
      tags: ["SSRS", "RDL", "Parameters", "Subscriptions"],
      details: "<p>SSRS:</p><ul><li>Проектирование отчётов (RDL/RDLC)</li><li>Параметризованные отчёты с drill-through</li><li>Подписки и доставка по расписанию</li><li>Интеграция с SharePoint</li></ul>"
    },
    rest: {
      desc: "Стандартизированные HTTP-интерфейсы, контракт-первый подход.",
      tags: ["REST", "HTTP", "OpenAPI", "Idempotency", "Pagination"],
      details: "<p>REST API дизайн:</p><ul><li>Идемпотентность методов, правильные HTTP-коды</li><li>Пагинация (cursor/offset), фильтрация, сортировка</li><li>Контракт-первый подход через OpenAPI 3.0</li><li>Версионирование: URI, Header, Query</li></ul>"
    },
    websocket: {
      desc: "Реальное время для стриминга и уведомлений.",
      tags: ["WebSocket", "Streaming", "Reconnect", "Binary"],
      details: "<p>WebSocket:</p><ul><li>Подписки и реальное время</li><li>Автоматический reconnect с exponential backoff</li><li>Обмен бинарными сообщениями</li><li>Интеграция с SignalR и нативными WS</li></ul>"
    },
    ngcp: {
      desc: "Протокол управления RTPengine.",
      tags: ["NGCP", "RTPengine", "VoIP", "Protocol"],
      details: "<p>NGCP:</p><ul><li>Расширенный протокол управления RTPengine</li><li>Интеграция с VoIP-инфраструктурой</li></ul>"
    },
    openapi: {
      desc: "Контракты API, автоматическая генерация клиентов и серверов.",
      tags: ["Swagger", "OpenAPI 3.0", "NSwag", "Kiota", "SDK Gen"],
      details: "<p>Swagger/OpenAPI:</p><ul><li>Документация API через Swagger UI / ReDoc</li><li>Валидация схем и совместимости контрактов</li><li>Генерация SDK: NSwag (C#), Kiota, openapi-generator</li><li>Contract-first vs Code-first подходы</li></ul>"
    },
    oauth2: {
      desc: "Авторизация и делегирование доступа через OAuth 2.0.",
      tags: ["OAuth 2.0", "OIDC", "JWT", "PKCE", "Refresh Tokens"],
      details: "<p>OAuth 2.0 / OIDC:</p><ul><li>Authorization Code + PKCE, Client Credentials</li><li>JWT: валидация, claims, refresh-токены</li><li>Интеграция с Keycloak, Azure AD, IdentityServer</li><li>Безопасное хранение токенов и секретов</li></ul>"
    },
    rabbitmq: {
      desc: "Очереди сообщений: exchange, маршрутизация, dead-letter, ретраи.",
      tags: ["RabbitMQ", "Exchange", "Queue", "DLQ", "MassTransit"],
      details: "<p>RabbitMQ:</p><ul><li>Exchange типы: Direct, Fanout, Topic, Headers</li><li>Dead Letter Exchange для обработки ошибок</li><li>Подтверждения (ACK/NACK), идемпотентность</li><li>Интеграция через MassTransit / NServiceBus</li><li>Кластеризация и зеркалирование очередей</li></ul>"
    },
    kafka: {
      desc: "Стриминг событий, consumer-группы, сквозная обработка.",
      tags: ["Kafka", "Topics", "Partitions", "Consumer Groups", "Streams"],
      details: "<p>Apache Kafka:</p><ul><li>Темы и партиции, ключи сообщений</li><li>Consumer-группы и offset management</li><li>Exactly-once семантика</li><li>Интеграция с Confluent, Schema Registry</li></ul>"
    },
    prometheus: {
      desc: "Метрики, алерты, экспортеры для сервисов и кластеров.",
      tags: ["Prometheus", "PromQL", "Alertmanager", "Exporters"],
      details: "<p>Prometheus:</p><ul><li>Сбор метрик: Counter, Gauge, Histogram, Summary</li><li>PromQL для запросов и правил алертов</li><li>Alertmanager: маршрутизация, silencing, группировка</li><li>Экспортеры: node_exporter, kube-state-metrics, custom</li></ul>"
    },
    grafana: {
      desc: "Дашборды для наблюдаемости, SLA-мониторинга и аналитики.",
      tags: ["Grafana", "Dashboards", "Alerts", "Datasources"],
      details: "<p>Grafana:</p><ul><li>Дашборды с переменными и drill-down</li><li>Datasources: Prometheus, Loki, Elasticsearch, PostgreSQL</li><li>Аннотации для событий деплоя</li><li>Provisioning через JSON/YAML</li></ul>"
    },
    elk: {
      desc: "Централизованное логирование: Elasticsearch + Logstash + Kibana.",
      tags: ["ELK", "Logstash", "Kibana", "Filebeat", "Pipelines"],
      details: "<p>ELK Stack:</p><ul><li>Logstash/Filebeat для сбора и парсинга логов</li><li>Elasticsearch для индексации и хранения</li><li>Kibana для визуализации и поиска</li><li>Index lifecycle management и ротация</li></ul>"
    },
    jaeger: {
      desc: "Распределённая трассировка запросов в микросервисах.",
      tags: ["Jaeger", "OpenTelemetry", "Tracing", "Spans"],
      details: "<p>Jaeger / OpenTelemetry:</p><ul><li>OpenTelemetry SDK для инструментации .NET</li><li>Трассировка HTTP, gRPC, DB-запросов</li><li>Анализ латентности и bottleneck-сервисов</li><li>Экспорт в Jaeger, Zipkin, OTLP</li></ul>"
    },
    nginx: {
      desc: "Реверс-прокси, статика, TLS-терминация.",
      tags: ["Nginx", "Reverse Proxy", "TLS", "Caching", "Load Balancing"],
      details: "<p>Nginx:</p><ul><li>Конфигурация виртуальных хостов</li><li>TLS-терминация и HTTP/2</li><li>Проксирование до backend-приложений</li><li>Кеширование статики и микрокеш</li><li>Балансировка нагрузки: round-robin, least_conn, ip_hash</li></ul>"
    },
    traefik: {
      desc: "Динамический реверс-прокси с автообнаружением сервисов.",
      tags: ["Traefik", "Docker", "Kubernetes", "Let's Encrypt", "Middleware"],
      details: "<p>Traefik:</p><ul><li>Автообнаружение сервисов через Docker/K8s провайдеры</li><li>Автоматический TLS через Let's Encrypt</li><li>Middleware: rate limiting, basic auth, headers</li><li>Маршрутизация по хостам, путям, заголовкам</li></ul>"
    },
    cerbot: {
      desc: "Автоматическое получение и обновление SSL-сертификатов.",
      tags: ["Certbot", "Let's Encrypt", "ACME", "Wildcard"],
      details: "<p>Certbot / Let's Encrypt:</p><ul><li>Автоматическое получение SSL-сертификатов</li><li>Wildcard-сертификаты через DNS challenge</li><li>Автообновление через cron/systemd timer</li><li>Интеграция с Nginx, Apache, standalone</li></ul>"
    },
    iis: {
      desc: "Хостинг .NET-приложений в Windows-среде.",
      tags: ["IIS", "App Pools", "Windows", ".NET Hosting"],
      details: "<p>IIS:</p><ul><li>Сайты и пулы приложений</li><li>Развертывание ASP.NET Core / MVC</li><li>Логирование, ограничения и безопасность</li><li>URL Rewrite, Application Request Routing</li></ul>"
    },
    apache: {
      desc: "Классический веб-сервер: .htaccess, mod_rewrite, mod_proxy.",
      tags: ["Apache", "mod_rewrite", "mod_proxy", "Virtual Hosts"],
      details: "<p>Apache HTTP Server:</p><ul><li>Виртуальные хосты, mod_proxy для проксирования</li><li>mod_ssl для TLS, mod_rewrite для URL routing</li><li>.htaccess для управления доступом</li></ul>"
    },
    caddy: {
      desc: "Автоматический HTTPS, zero-config веб-сервер.",
      tags: ["Caddy", "Auto HTTPS", "Caddyfile", "API"],
      details: "<p>Caddy:</p><ul><li>Автоматическое получение TLS-сертификатов</li><li>Caddyfile для простой конфигурации</li><li>Реверс-прокси с health checks</li><li>API для динамического управления</li></ul>"
    },
    ddd: {
      desc: "Предметно-ориентированное проектирование сложных систем.",
      tags: ["DDD", "Bounded Context", "Aggregates", "Events", "Ubiquitous Language"],
      details: "<p>Domain-Driven Design:</p><ul><li>Bounded Context и Context Mapping</li><li>Aggregates, Entities, Value Objects</li><li>Domain Events и Event Sourcing</li><li>Ubiquitous Language и коллаборация с бизнесом</li><li>Антикоррупционные слои при интеграции</li></ul>"
    },
    solid: {
      desc: "Принципы проектирования для качества и сопровождаемости кода.",
      tags: ["SRP", "OCP", "LSP", "ISP", "DIP"],
      details: "<p>SOLID на практике:</p><ul><li>SRP: декомпозиция классов по зонам ответственности</li><li>OCP: расширение через абстракции без модификации</li><li>LSP: корректная подстановка подтипов</li><li>ISP: узкие интерфейсы вместо «толстых»</li><li>DIP: зависимость от абстракций, DI-контейнер</li></ul>"
    },
    cqrs: {
      desc: "Разделение команд и запросов для масштабируемых систем.",
      tags: ["CQRS", "Event Sourcing", "MediatR", "Read/Write Split"],
      details: "<p>CQRS:</p><ul><li>Разделение Command и Query моделей</li><li>Event Sourcing: хранение событий вместо состояния</li><li>MediatR для маршрутизации команд/запросов</li><li>Eventual consistency и проекции</li></ul>"
    },
    kiss: {
      desc: "Принцип простоты: минимум зависимостей, ясная архитектура.",
      tags: ["KISS", "Simplicity", "Minimal Dependencies"],
      details: "<p>KISS:</p><ul><li>Простые интерфейсы, минимум зависимостей</li><li>Избегание over-engineering</li><li>Ясный код, который легко читать и поддерживать</li></ul>"
    },
    tdd: {
      desc: "Разработка через тестирование: red-green-refactor.",
      tags: ["TDD", "Red-Green-Refactor", "Test Pyramid", "Unit Tests"],
      details: "<p>Test-Driven Development:</p><ul><li>Цикл: Red → Green → Refactor</li><li>Пирамида тестов: unit → integration → E2E</li><li>Быстрые юнит-тесты для мгновенной обратной связи</li><li>Покрытие кода как метрика, но не цель</li></ul>"
    },
    "clean-arch": {
      desc: "Слоистая архитектура с чёткими зависимостями и границами.",
      tags: ["Clean Architecture", "Use Cases", "Entities", "Ports & Adapters"],
      details: "<p>Clean Architecture:</p><ul><li>Слои: Entities → Use Cases → Interface Adapters → Frameworks</li><li>Правило зависимости: внутренние слои не знают о внешних</li><li>Ports & Adapters (Hexagonal) для тестируемости</li><li>Separation of Concerns и инверсия управления</li></ul>"
    },
    "agile-scrum": {
      desc: "Итеративная разработка, Scrum-церемонии, метрики потока.",
      tags: ["Scrum", "Kanban", "Sprint", "Retrospective", "Velocity"],
      details: "<p>Agile / Scrum:</p><ul><li>Планирование спринтов, оценка (Planning Poker, Story Points)</li><li>Daily Standup, Sprint Review, Retrospective</li><li>Канбан-доски, WIP-лимиты, метрики потока</li><li>Refinement/Grooming для подготовки бэклога</li></ul>"
    },
    xunit: {
      desc: "Unit-тестирование .NET: xUnit, NUnit, параметризация.",
      tags: ["xUnit", "NUnit", "Theory", "TestCase", "CI"],
      details: "<p>Unit-тестирование:</p><ul><li>xUnit: Fact, Theory, InlineData, ClassData</li><li>NUnit: TestCase, TestFixture, параметризация</li><li>Интеграция с CI для автоматического прогона</li><li>Покрытие кода: Coverlet, ReportGenerator</li></ul>"
    },
    moq: {
      desc: "Мокирование зависимостей для изолированных тестов.",
      tags: ["Moq", "NSubstitute", "Mocking", "Verify"],
      details: "<p>Мокирование:</p><ul><li>Moq: Setup, Returns, Verify, Callback</li><li>NSubstitute: более читаемый синтаксис</li><li>AutoMocker для автоматического создания моков</li><li>Верификация вызовов и аргументов</li></ul>"
    },
    selenium: {
      desc: "E2E-тестирование веб-приложений через браузер.",
      tags: ["Selenium", "WebDriver", "E2E", "Playwright"],
      details: "<p>E2E-тестирование:</p><ul><li>Selenium WebDriver для автоматизации браузера</li><li>Page Object Model для поддерживаемых тестов</li><li>Playwright как современная альтернатива</li></ul>"
    },
    postman: {
      desc: "Тестирование API: коллекции, переменные, автоматизация.",
      tags: ["Postman", "Collections", "Newman", "Pre-request Scripts"],
      details: "<p>Postman:</p><ul><li>Коллекции запросов с окружениями</li><li>Pre-request и Test скрипты</li><li>Newman для запуска в CI</li><li>Mock-серверы и документация</li></ul>"
    },
    windows: {
      desc: "Серверные роли, службы, настройка .NET окружений.",
      tags: ["Windows Server", "Services", "Active Directory", "IIS"],
      details: "<p>Windows:</p><ul><li>Windows Server: роли, службы, групповые политики</li><li>Active Directory для аутентификации</li><li>Настройка окружений для .NET и CI-агентов</li><li>Права, планировщик задач, Event Log</li></ul>"
    },
    linux: {
      desc: "Production-окружение для контейнеров, сервисов и мониторинга.",
      tags: ["Ubuntu", "CentOS", "systemd", "Networking", "Security"],
      details: "<p>Linux:</p><ul><li>Ubuntu/CentOS для production-серверов</li><li>systemd для управления сервисами</li><li>Сетевые настройки: firewalld/iptables, DNS</li><li>Безопасность: SSH hardening, fail2ban, обновления</li></ul>"
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

  // Клик по .skill-title → модалка
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

// Обфусцированные контакты — защита от спам-ботов
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
