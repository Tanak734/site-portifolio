// Catálogo do seletor de ícones do admin: só logos de tecnologia/dev (slugs do simple-icons).
// Marcas sem relação (bancos, companhias aéreas, jogos, lojas, montadoras…) ficam de fora.
// Para liberar ou remover um ícone, edite as listas abaixo. Slugs: https://simpleicons.org
//
// "java" é um ícone extra definido em tech-icons.ts (não existe no simple-icons).
// O grupo "especificos" reúne ícones de nicho — revise e apague os que não fizerem sentido.

export const CATEGORIAS_ICONES = {
  linguagens: {
    nome: 'Linguagens',
    slugs: [
      'javascript', 'typescript', 'python', 'java', 'php', 'go', 'rust', 'kotlin', 'swift', 'dart', 'ruby', 'openjdk',
      'dotnet', 'c', 'cplusplus', 'scala', 'elixir', 'erlang', 'haskell', 'clojure', 'lua', 'perl', 'r', 'zig',
      'fsharp', 'apachegroovy', 'gnubash', 'html5', 'css', 'sass', 'less', 'stylus', 'markdown', 'mdx', 'json',
      'yaml', 'toml', 'xml', 'graphql', 'webassembly', 'latex', 'pug', 'ejs', 'handlebarsdotjs', 'jinja',
      'nunjucks', 'thymeleaf', 'solidity',
    ],
  },
  frontend: {
    nome: 'Frontend',
    slugs: [
      'react', 'nextdotjs', 'vuedotjs', 'nuxt', 'angular', 'svelte', 'solid', 'preact', 'qwik', 'astro', 'remix',
      'gatsby', 'emberdotjs', 'alpinedotjs', 'htmx', 'lit', 'stencil', 'jquery', 'hotwire', 'stimulus', 'inertia',
      'livewire', 'eleventy', 'hugo', 'jekyll', 'vitepress', 'docusaurus', 'nextra', 'redwoodjs',
      // CSS & UI
      'tailwindcss', 'bootstrap', 'bulma', 'mui', 'chakraui', 'antdesign', 'mantine', 'radixui', 'shadcnui',
      'headlessui', 'daisyui', 'heroui', 'primereact', 'primevue', 'primeng', 'vuetify', 'quasar', 'materialdesign',
      'styledcomponents', 'cssmodules', 'vanillaextract', 'unocss', 'postcss', 'autoprefixer', 'normalizedotcss',
      'reactbootstrap', 'semanticui', 'fontawesome', 'lucide', 'iconify',
      // Estado, dados e utilitários
      'redux', 'mobx', 'recoil', 'pinia', 'ngrx', 'reactquery', 'tanstack', 'reactrouter', 'reacthookform',
      'formik', 'zod', 'xstate', 'swr', 'immer', 'axios', 'lodash', 'datefns', 'trpc', 'apollographql', 'i18next',
      'vueuse',
      // Gráficos, animação e mapas
      'threedotjs', 'd3', 'chartdotjs', 'apacheecharts', 'plotly', 'greensock', 'lottiefiles', 'swiper', 'leaflet',
      'mapbox', 'openlayers', 'maplibre', 'xyflow',
      // Plataforma web
      'pwa', 'webgl', 'webgpu', 'webrtc', 'svg', 'webcomponentsdotorg', 'mdnwebdocs',
    ],
  },
  backend: {
    nome: 'Backend & APIs',
    slugs: [
      'nodedotjs', 'deno', 'bun', 'express', 'fastify', 'nestjs', 'koa', 'hono', 'adonisjs', 'django', 'flask',
      'fastapi', 'pydantic', 'celery', 'gunicorn', 'laravel', 'symfony', 'codeigniter', 'cakephp', 'composer',
      'rubyonrails', 'phoenixframework', 'spring', 'springboot', 'springsecurity', 'quarkus', 'ktor', 'gin',
      'actix', 'tokio', 'blazor', 'apachetomcat', 'nginx', 'caddy', 'traefikproxy', 'haproxy', 'rabbitmq',
      'apachekafka', 'natsdotio', 'mqtt', 'socketdotio', 'swagger', 'openapiinitiative', 'postman', 'insomnia',
      'hoppscotch', 'bruno', 'jsonwebtokens', 'auth0', 'clerk', 'okta', 'keycloak', 'betterauth', 'passport',
      'supabase', 'firebase', 'appwrite', 'pocketbase', 'hasura', 'convex', 'prisma', 'drizzle', 'typeorm',
      'sequelize', 'mongoose', 'knexdotjs', 'sqlalchemy', 'hibernate', 'doctrine', 'flyway', 'liquibase',
      'temporal', 'stripe', 'mercadopago', 'paypal', 'pagseguro', 'pix', 'resend', 'mailgun', 'pusher',
      'meilisearch', 'algolia', 'elasticsearch', 'tsnode', 'nodemon', 'pm2',
    ],
  },
  dados: {
    nome: 'Bancos & dados',
    slugs: [
      'postgresql', 'mysql', 'mariadb', 'sqlite', 'mongodb', 'redis', 'apachecassandra', 'couchbase', 'neo4j',
      'surrealdb', 'cockroachlabs', 'planetscale', 'neon', 'turso', 'upstash', 'influxdb', 'timescale',
      'clickhouse', 'duckdb', 'snowflake', 'databricks', 'googlebigquery', 'apachespark', 'apacheairflow',
      'opensearch', 'qdrant', 'milvus', 'dbeaver', 'datagrip', 'beekeeperstudio', 'studio3t', 'phpmyadmin',
      'adminer', 'metabase', 'apachesuperset', 'pandas', 'numpy', 'polars', 'airbyte',
    ],
  },
  devops: {
    nome: 'DevOps & cloud',
    slugs: [
      'docker', 'podman', 'kubernetes', 'helm', 'k3s', 'rancher', 'argo', 'terraform', 'opentofu', 'pulumi',
      'ansible', 'vagrant', 'packer', 'vault', 'consul', 'hashicorp', 'jenkins', 'githubactions', 'gitlab',
      'circleci', 'travisci', 'buildkite', 'teamcity', 'cloudflare', 'cloudflarepages', 'cloudflareworkers',
      'vercel', 'netlify', 'render', 'railway', 'flydotio', 'digitalocean', 'googlecloud', 'hetzner', 'ovh',
      'vultr', 'hostinger', 'coolify', 'portainer', 'prometheus', 'grafana', 'datadog', 'newrelic', 'sentry',
      'opentelemetry', 'elasticstack', 'kibana', 'betterstack', 'uptimekuma', 'pagerduty', 'letsencrypt',
      'ngrok', 'tailscale', 'wireguard', 'nginxproxymanager', 'proxmox', 'vmware', 'virtualbox', 'minio',
      'dependabot', 'renovate', 'snyk', 'sonarqubecloud', 'trivy', 'owasp', 'serverless', 'kong',
    ],
  },
  ferramentas: {
    nome: 'Ferramentas & testes',
    slugs: [
      'git', 'github', 'bitbucket', 'gitea', 'codeberg', 'npm', 'pnpm', 'yarn', 'vite', 'webpack',
      'rollupdotjs', 'esbuild', 'swc', 'babel', 'turborepo', 'nx', 'biome', 'eslint', 'prettier', 'stylelint',
      'commitlint', 'lefthook', 'precommit', 'semanticrelease', 'conventionalcommits', 'jest', 'vitest', 'mocha',
      'cypress', 'puppeteer', 'selenium', 'testinglibrary', 'storybook', 'pytest', 'junit5', 'cucumber', 'k6',
      'mockserviceworker', 'codecov', 'lighthouse', 'pagespeedinsights', 'homebrew', 'nvm', 'poetry', 'uv',
      'ruff', 'pypi', 'gradle', 'apachemaven', 'cmake', 'curl', 'httpie', 'wireshark', 'jupyter', 'replit',
      'codesandbox', 'stackblitz', 'githubcopilot', 'gitkraken', 'zsh', 'tmux', 'mermaid', 'readthedocs',
      // Editores & IDEs
      'neovim', 'vim', 'sublimetext', 'intellijidea', 'webstorm', 'pycharm', 'phpstorm', 'goland', 'rider',
      'androidstudio', 'xcode', 'eclipseide', 'jetbrains', 'cursor', 'windsurf', 'vscodium', 'zedindustries',
      'notepadplusplus', 'warp', 'iterm2',
      // Gestão & comunicação
      'jira', 'confluence', 'trello', 'linear', 'clickup', 'asana', 'notion', 'obsidian', 'discord',
      'mattermost', 'stackoverflow', 'devdotto', 'leetcode',
    ],
  },
  ia: {
    nome: 'IA & dados científicos',
    slugs: [
      'tensorflow', 'pytorch', 'keras', 'scikitlearn', 'huggingface', 'langchain', 'ollama', 'anthropic',
      'claude', 'mistralai', 'googlegemini', 'deepseek', 'perplexity', 'openrouter', 'replicate', 'kaggle',
      'googlecolab', 'mlflow', 'weightsandbiases', 'opencv', 'onnx', 'spacy', 'streamlit', 'gradio', 'n8n',
      'modelcontextprotocol', 'scipy',
    ],
  },
  mobile: {
    nome: 'Mobile & desktop',
    slugs: [
      'android', 'ios', 'flutter', 'expo', 'ionic', 'capacitor', 'apachecordova', 'nativescript',
      'jetpackcompose', 'electron', 'tauri', 'qt', 'googleplay', 'appstore',
    ],
  },
  sistemas: {
    nome: 'Sistemas operacionais',
    slugs: [
      'linux', 'ubuntu', 'debian', 'fedora', 'archlinux', 'manjaro', 'linuxmint', 'popos', 'redhat',
      'rockylinux', 'almalinux', 'alpinelinux', 'opensuse', 'nixos', 'kalilinux', 'freebsd', 'macos', 'apple',
    ],
  },
  design: {
    nome: 'Design & mídia',
    slugs: [
      'figma', 'sketch', 'penpot', 'framer', 'blender', 'gimp', 'inkscape', 'krita', 'miro', 'excalidraw',
      'diagramsdotnet', 'dribbble', 'behance', 'rive', 'davinciresolve', 'obsstudio', 'googlefonts', 'unsplash',
    ],
  },
  cms: {
    nome: 'CMS & e-commerce',
    slugs: [
      'wordpress', 'woocommerce', 'shopify', 'drupal', 'joomla', 'ghost', 'strapi', 'sanity', 'contentful',
      'payloadcms', 'directus', 'storyblok', 'prismic', 'datocms', 'decapcms', 'craftcms', 'statamic',
      'prestashop', 'vtex', 'medusa', 'webflow', 'wix', 'squarespace', 'elementor', 'googleanalytics',
      'googletagmanager', 'googlesearchconsole', 'hotjar', 'posthog', 'plausibleanalytics', 'umami', 'matomo',
      'mixpanel', 'zapier', 'make',
    ],
  },
  especificos: {
    nome: 'Específicos',
    slugs: [
      // Linguagens de nicho / acadêmicas
      'ada', 'fortran', 'commonlisp', 'racket', 'ocaml', 'nim', 'odin', 'purescript', 'reason', 'rescript',
      'haxe', 'vala', 'd', 'crystal', 'gleam', 'julia', 'coffeescript', 'elm', 'delphi', 'v',
      // Front/back legados ou pouco usados
      'backbonedotjs', 'aurelia', 'marko', 'meteor', 'polymerproject', 'gridsome', 'hexo', 'bower', 'gulp',
      'grunt', 'lerna', 'sailsdotjs', 'loopback', 'moleculer', 'sanic', 'aiohttp', 'rubysinatra', 'yii',
      'vaadin', 'vapor', 'leptos', 'rocket',
      // Bancos e big data especializados
      'apachecouchdb', 'arangodb', 'dgraph', 'scylladb', 'tidb', 'cratedb', 'rocksdb', 'h2database', 'fauna',
      'apachehadoop', 'apacheflink', 'apachepulsar', 'apachehive', 'apachehbase', 'apachenifi', 'apachedruid',
      'apachesolr', 'apacheparquet', 'apachearrow', 'dask', 'redash',
      // Cloud/infra de nicho
      'googlebigtable', 'googlecloudspanner', 'googlepubsub', 'alibabacloud', 'scaleway', 'contabo', 'koyeb',
      'caprover', 'denodeploy', 'sst', 'istio', 'linkerd', 'cilium', 'knative', 'openfaas', 'nomad', 'chef',
      'puppet', 'saltproject', 'drone', 'codemagic', 'bitrise', 'fastlane', 'jaeger', 'logstash', 'fluentd',
      'splunk', 'dynatrace', 'containerd', 'etcd', 'ceph', 'harbor', 'jfrog', 'qemu',
      // Testes e build menos comuns
      'jasmine', 'webdriverio', 'testcafe', 'locust', 'apachejmeter', 'chromatic', 'percy', 'coveralls',
      'codacy', 'bazel', 'conan', 'chocolatey', 'oxc', 'rolldown',
      // Terminais e editores alternativos
      'alacritty', 'wezterm', 'ghostty', 'hyper', 'gnuemacs', 'clion', 'rubymine', 'fishshell',
      // IA / ML especializados
      'ultralytics', 'vllm', 'lmstudio', 'dify', 'langflow', 'crewai', 'metaai', 'qwen', 'tinygrad', 'sympy',
      // Mobile/desktop alternativos
      'wails', 'gtk', 'avaloniaui',
      // Hardware, IoT e embarcados
      'arduino', 'raspberrypi', 'espressif', 'micropython', 'platformio', 'homeassistant',
      // Games e 3D
      'unity', 'unrealengine', 'godotengine', 'babylondotjs', 'p5dotjs',
      // Blockchain / web3
      'ethereum', 'web3dotjs', 'ethers', 'wagmi',
      // CMS e lojas menos comuns
      'umbraco', 'tina', 'shopware', 'bigcommerce', 'gentoo', 'centos', 'openbsd',
    ],
  },
} as const;

export type CategoriaIcone = keyof typeof CATEGORIAS_ICONES;
