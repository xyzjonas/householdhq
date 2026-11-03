# How-to

## Git

- each feature is to be started in a new clean feature branch
- new feature branches should always be based off of the master branch
- implement each change as a semantic commit, push the brancha and open a PR once it is ready

## UI/UX Design/implementation

- always stick to semantic HTML
- prefer UnoCSS stayling over CSS and prefer - if needed - CSS inside scoped <style scoped> inside Vue components, leverage Vue for style reusability rather then CSS itself.
- prefer plain CSS instead of SASS
- create vue components whenever there's a benefit in reusability or whenever the parent component grows too large
- prefer clean components instead of bloated ones - making use of Vue's composables whenever it makes sense

## Code quality

- before each push run `npm run format` (Prettier) and make sure `npm run lint` (ESLint) and `npx nuxt typecheck` pass with no errors or warnings
- fix every issue the linter/type checker raises, including warnings - don't silence them with `eslint-disable` or by relaxing rules
- `npm run lint:fix` autofixes what it can; `npm run format:check` verifies formatting (this is what CI runs)
