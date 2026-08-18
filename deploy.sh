#!/usr/bin/env bash
# 一键部署两个站点:
#   1) https://thebaby9.github.io/thing/   (gh-pages 分支)
#   2) https://thebaby9.github.io/         (root-site 仓库,APK 全屏版用)
set -e
cd "$(dirname "$0")/project"
npm run deploy                      # -> /thing/
npx vite build --base=/             # 根站点版本构建
cd /home/tt/code/root-site
git rm -rq .
cp -a /home/tt/code/thing/project/dist/. .
git add -A
git commit -qm "deploy: $(date '+%F %H:%M')"
git push -q
echo "✓ 两个站点均已部署"
