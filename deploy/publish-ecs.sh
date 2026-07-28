#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
deploy_host="${EIX_DEPLOY_HOST:-ecs-user@8.160.176.104}"
deploy_key="${EIX_DEPLOY_KEY:-/Users/muyuyang/Downloads/audi-chatbi-poc.pem}"
release_id="$(date '+%Y%m%d-%H%M%S')"
staging_path="/tmp/eix-release-${release_id}"
release_path="/opt/eix/releases/${release_id}"

if [[ ! -f "${deploy_key}" ]]; then
  echo "Deploy key not found: ${deploy_key}" >&2
  exit 1
fi

ssh_options=(
  -i "${deploy_key}"
  -o BatchMode=yes
  -o IdentitiesOnly=yes
  -o StrictHostKeyChecking=accept-new
  -o ConnectTimeout=10
)

required_files=(
  index.html
  specimen.html
  app.js
  styles.css
  design-system/tokens.generated.css
  design-system/reference.css
  src/catalog.js
  vendor/marked.umd.js
)

ssh "${ssh_options[@]}" "${deploy_host}" \
  "test ! -e '${staging_path}' && mkdir '${staging_path}'"

tar \
  --no-xattrs \
  --no-mac-metadata \
  --exclude='./.git' \
  --exclude='./verification' \
  --exclude='./deploy' \
  --exclude='./scripts' \
  --exclude='./.DS_Store' \
  --exclude='*/__pycache__' \
  -C "${project_root}" \
  -czf - . |
  ssh "${ssh_options[@]}" "${deploy_host}" "tar -xzf - -C '${staging_path}'"

for required_file in "${required_files[@]}"; do
  ssh "${ssh_options[@]}" "${deploy_host}" \
    "test -s '${staging_path}/${required_file}'"
done

ssh "${ssh_options[@]}" "${deploy_host}" "
  set -eu
  printf '%s\n' '${release_id}' > '${staging_path}/REVISION.txt'
  sudo nginx -t
  sudo mkdir -p /opt/eix/releases
  sudo mv '${staging_path}' '${release_path}'
  sudo chown -R root:root '${release_path}'
  previous_release=\"\$(readlink -f /opt/eix/current)\"
  sudo ln -sfn '${release_path}' /opt/eix/current.next
  sudo mv -Tf /opt/eix/current.next /opt/eix/current
  if ! test \"\$(curl -fsS -o /dev/null -w '%{http_code}' http://127.0.0.1/eix/)\" = '200'; then
    sudo ln -sfn \"\${previous_release}\" /opt/eix/current.next
    sudo mv -Tf /opt/eix/current.next /opt/eix/current
    echo 'Health check failed; previous release restored.' >&2
    exit 1
  fi
  readlink -f /opt/eix/current
"

echo "Published EIX release ${release_id} to http://8.160.176.104/eix/"
