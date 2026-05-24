/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as http from "../http.js";
import type * as optimize from "../optimize.js";
import type * as promptforge from "../promptforge.js";
import type * as promptforge_mutations from "../promptforge_mutations.js";
import type * as prompts from "../prompts.js";
import type * as seedLibrary from "../seedLibrary.js";
import type * as shares from "../shares.js";
import type * as templates from "../templates.js";
import type * as usageLogs from "../usageLogs.js";
import type * as users from "../users.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  http: typeof http;
  optimize: typeof optimize;
  promptforge: typeof promptforge;
  promptforge_mutations: typeof promptforge_mutations;
  prompts: typeof prompts;
  seedLibrary: typeof seedLibrary;
  shares: typeof shares;
  templates: typeof templates;
  usageLogs: typeof usageLogs;
  users: typeof users;
  workspaces: typeof workspaces;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
