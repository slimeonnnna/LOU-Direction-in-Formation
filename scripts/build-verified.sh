#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Vercel needs the standard Next.js output rather than the Cloudflare/Vinext
# worker artifact used by ChatGPT Sites.
if [[ "${VERCEL:-}" == "1" ]]; then
  echo "Running standard Next.js build for Vercel..."
  exec "${PWD}/node_modules/.bin/next" build
fi

# Cloudflare Pages needs a static export in out/, not the Vinext Worker bundle
# used by ChatGPT Sites. CF_PAGES is provided by Pages; BUILD_TARGET keeps the
# same build reproducible locally and in other CI environments.
if [[ "${CF_PAGES:-}" == "1" || "${BUILD_TARGET:-}" == "cloudflare-pages" ]]; then
  echo "Running static Next.js export for Cloudflare Pages..."
  exec "${PWD}/node_modules/.bin/next" build
fi

if [[ "${SITES_ENV_READY:-}" != "1" ]]; then
  # Re-enter through bash explicitly. GitHub/Cloudflare checkouts may not
  # preserve executable bits on repository scripts.
  exec bash "${script_dir}/sites-env.sh" -- bash "${script_dir}/build-verified.sh" "$@"
fi

command -v timeout >/dev/null || {
  echo "build-verified.sh requires GNU timeout." >&2
  exit 69
}

vinext="${SITES_PROJECT_ROOT}/node_modules/.bin/vinext"
if [[ ! -x "${vinext}" ]]; then
  echo "vinext is unavailable. Run npm run install:ci and wait for it to finish before building." >&2
  exit 69
fi

echo "Running bounded vinext build..."
timeout \
  --signal=TERM \
  --kill-after="${SITES_BUILD_KILL_AFTER:-10s}" \
  "${SITES_BUILD_TIMEOUT:-3m}" \
  "${vinext}" build

bash "${script_dir}/validate-artifact.sh"
