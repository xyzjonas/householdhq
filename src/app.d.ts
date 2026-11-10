// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user?: import("#lib/server/core/types.ts").PublicUser;
      /** Every household the signed-in user belongs to. */
      households: import("#lib/server/core/types.ts").Household[];
      /** The household the user is working in (one of `households`). */
      household?: import("#lib/server/core/types.ts").Household;
      /** The data of `household`; undefined when the user belongs to none. */
      hq?: import("#lib/server/core/index.ts").HouseholdCore;
    }
    interface PageData {
      user?: import("#lib/server/core/types.ts").PublicUser;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
