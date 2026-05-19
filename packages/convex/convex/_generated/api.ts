// Mock Convex API types for development
// In production, run: npx convex dev

export const api = {
  users: {
    current: {},
    create: {},
    updatePlan: {},
    getByClerkId: {},
    getMe: {},
    generateApiKey: {},
  },
  prompts: {
    create: {},
    list: {},
    delete: {},
    update: {},
    deletePrompt: {},
    getHistory: {},
  },
  templates: {
    list: {},
    create: {},
    listMine: {},
    listPublic: {},
    voteTemplate: {},
  },
  workspaces: {
    create: {},
    getByUserId: {},
    getMyWorkspace: {},
    inviteMember: {},
  },
  usageLogs: {
    log: {},
    getStats: {},
  },
  optimize: {
    compress: {},
    enhance: {},
    optimizePrompt: {},
  },
};

export const components = {};

// Mock hooks for development
export const useQuery = (fn: any, args?: any) => null;
export const useMutation = (fn: any) => [() => {}, { isLoading: false }] as const;
export const useConvexAuth = () => ({ isLoading: false, isAuthenticated: false, user: null });
