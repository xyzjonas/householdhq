// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user?: import("#lib/server/core/types.ts").PublicUser;
    }
    interface PageData {
      user?: import("#lib/server/core/types.ts").PublicUser;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
