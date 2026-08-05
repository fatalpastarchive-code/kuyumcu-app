/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as cleanup from "../cleanup.js";
import type * as customers from "../customers.js";
import type * as logs from "../logs.js";
import type * as notificationSettings from "../notificationSettings.js";
import type * as payments from "../payments.js";
import type * as pushSubscriptions from "../pushSubscriptions.js";
import type * as settings from "../settings.js";
import type * as shops from "../shops.js";
import type * as transactions from "../transactions.js";
import type * as units from "../units.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  cleanup: typeof cleanup;
  customers: typeof customers;
  logs: typeof logs;
  notificationSettings: typeof notificationSettings;
  payments: typeof payments;
  pushSubscriptions: typeof pushSubscriptions;
  settings: typeof settings;
  shops: typeof shops;
  transactions: typeof transactions;
  units: typeof units;
  users: typeof users;
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
