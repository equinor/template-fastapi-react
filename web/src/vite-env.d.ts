/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_AUTH?: string
  readonly VITE_TELEMETRY?: string
  readonly VITE_REPO_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
