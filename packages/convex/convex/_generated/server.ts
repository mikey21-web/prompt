// Stub of the Convex generated server module. Replaced with real codegen
// output by `npx convex dev` / `convex codegen`. The CLI generates a file
// that wraps the generic helpers below with schema-aware types. Until then
// we re-export the generic helpers under their canonical names so existing
// imports of `./_generated/server` keep type-checking.

import {
  queryGeneric,
  mutationGeneric,
  actionGeneric,
  internalQueryGeneric,
  internalMutationGeneric,
  internalActionGeneric,
  httpActionGeneric,
} from "convex/server";

export const query = queryGeneric;
export const mutation = mutationGeneric;
export const action = actionGeneric;
export const internalQuery = internalQueryGeneric;
export const internalMutation = internalMutationGeneric;
export const internalAction = internalActionGeneric;
export const httpAction = httpActionGeneric;
