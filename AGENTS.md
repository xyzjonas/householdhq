# How-to

## Git

- each feature is to be started in a worktree and a  new clean feature branch
- new feature branches should always be based off of the main branch - always freshly fetched
- implement each change as a semantic commit, push the brancha and open a PR once it is ready

## UI/UX Design/implementation

- always stick to semantic HTML
- absolutely prefer skeleton UI components if applicable, cusom components using svelte and tailwind when necessary - CSS inside scoped <style scoped> inside components, leverage Svelte for style reusability rather then CSS itself.
- prefer plain CSS instead of SASS
- create svelte components whenever there's a benefit in reusability or whenever the parent component grows too large

## Code quality

- before each push run `npm run format` (Prettier) and make sure `npm run lint` (ESLint) and TS typecheck pass with no errors or warnings
- fix every issue the linter/type checker raises, including warnings - don't silence them with `eslint-disable` or by relaxing rules
- `npm run lint:fix` autofixes what it can; `npm run format:check` verifies formatting (this is what CI runs)
