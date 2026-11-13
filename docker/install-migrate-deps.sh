#!/bin/sh
# Installs a minimal `prisma` CLI (just enough for `prisma migrate deploy`) into
# ./node_modules of the current directory. Used by the `migrate-deps` stage of
# the Dockerfile; expects the app's package-lock.json as ./lock.json.
#
# `prisma` drags in the studio UI, a local dev server and other DB drivers
# (~100 MB with transitive deps) that migrate never runs. So we repack the
# package without them and let npm resolve the (much smaller) tree:
#   - mysql2, postgres: dropped (only loaded lazily by other commands)
#   - @prisma/studio-core, @prisma/dev: the CLI `require`s a few of their entry
#     points at startup, so keep the packages but strip the UI bundle / runtime
#     assets and the dependencies only those parts need
set -eu

lock() { node -p "require('./lock.json').packages['node_modules/$1'].version"; }

# repack <name@version> <dir> <js statement editing package.json as `p`> [<paths to delete>]
repack() {
  npm pack --silent "$1" >/dev/null
  mkdir "$2" && tar -xzf ./*.tgz -C "$2" --strip-components=1 && rm ./*.tgz
  node -e "const f='$2/package.json',p=require('./'+f);$3;require('fs').writeFileSync(f,JSON.stringify(p))"
  # shellcheck disable=SC2086
  (cd "$2" && rm -rf ${4:-} && npm pack --silent >/dev/null)
}

repack "@prisma/studio-core@$(lock @prisma/studio-core)" studio \
  "delete p.dependencies;delete p.peerDependencies;delete p.peerDependenciesMeta" \
  "dist/ui dist/metafile-*.json"

# only `@prisma/dev/internal/state` is loaded: it needs these few small deps
repack "@prisma/dev@$(lock @prisma/dev)" dev \
  "p.dependencies=Object.fromEntries(['get-port-please','pathe','proper-lockfile','remeda','std-env','valibot','zeptomatch'].map(d=>[d,p.dependencies[d]]));delete p.peerDependencies;delete p.peerDependenciesMeta" \
  "dist/runtime-assets"

repack "prisma@$(lock prisma)" cli \
  "for (const d of ['mysql2','postgres']) delete p.dependencies[d]"

npm init -y >/dev/null
npm i --omit=dev --no-audit --no-fund ./cli/prisma-*.tgz ./studio/*.tgz ./dev/*.tgz
npm cache clean --force

cd node_modules
# type declarations / source maps are never read at runtime; `migrate deploy`
# on MySQL only loads the mysql wasm (not the other databases' ones)
find . \( -name '*.d.ts' -o -name '*.d.mts' -o -name '*.d.cts' -o -name '*.map' \) -delete
rm -f prisma/build/studio.js prisma/build/*postgresql* prisma/build/*cockroachdb* \
  prisma/build/*sqlserver* prisma/build/*sqlite*

# the schema-engine matching the (glibc) runtime image must have been downloaded
test -x @prisma/engines/schema-engine-debian-openssl-3.0.x
# smoke test: fail the build if pruning broke CLI startup (eager requires)
node prisma/build/index.js --help >/dev/null
