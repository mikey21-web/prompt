// Mock Convex API types for development
// In production, run: npx convex dev
import type { FunctionReference } from "convex/server";

// Generic mutation/query/action reference placeholders used until the real
// Convex codegen runs. These satisfy the FunctionReference constraint so that
// ConvexHttpClient.mutation/query/action calls type-check without `any` casts.
type AnyMutation = FunctionReference<"mutation", "public", any, any>;
type AnyQuery = FunctionReference<"query", "public", any, any>;
type AnyAction = FunctionReference<"action", "public", any, any>;

export const api = {
  users: {
    current: {} as AnyQuery,
    create: {} as AnyMutation,
    updatePlan: {} as AnyMutation,
    getByClerkId: {} as AnyQuery,
    getMe: {} as AnyQuery,
    generateApiKey: {} as AnyMutation,
  },
  prompts: {
    create: {} as AnyMutation,
    list: {} as AnyQuery,
    delete: {} as AnyMutation,
    update: {} as AnyMutation,
    deletePrompt: {} as AnyMutation,
    getHistory: {} as AnyQuery,
  },
  templates: {
    list: {} as AnyQuery,
    create: {} as AnyMutation,
    listMine: {} as AnyQuery,
    listPublic: {} as AnyQuery,
    voteTemplate: {} as AnyMutation,
  },
  workspaces: {
    create: {} as AnyMutation,
    getByUserId: {} as AnyQuery,
    getMyWorkspace: {} as AnyQuery,
    inviteMember: {} as AnyMutation,
  },
  usageLogs: {
    log: {} as AnyMutation,
    getStats: {} as AnyQuery,
  },
  optimize: {
    compress: {} as AnyAction,
    enhance: {} as AnyAction,
    optimizePrompt: {} as AnyAction,
  },
};

export const components = {};

// Mock hooks for development
export const useQuery = (fn: any, args?: any) => null;
export const useMutation = (fn: any) => [() => {}, { isLoading: false }] as const;
export const useConvexAuth = () => ({ isLoading: false, isAuthenticated: false, user: null });
