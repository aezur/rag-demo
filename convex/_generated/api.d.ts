/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as common_schemas from "../common/schemas.js";
import type * as common_utils from "../common/utils.js";
import type * as http from "../http.js";
import type * as semanticCache_schemas from "../semanticCache/schemas.js";
import type * as starwarsDialog_mutations from "../starwarsDialog/mutations.js";
import type * as starwarsDialog_schemas from "../starwarsDialog/schemas.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "common/schemas": typeof common_schemas;
  "common/utils": typeof common_utils;
  http: typeof http;
  "semanticCache/schemas": typeof semanticCache_schemas;
  "starwarsDialog/mutations": typeof starwarsDialog_mutations;
  "starwarsDialog/schemas": typeof starwarsDialog_schemas;
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
