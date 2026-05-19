import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createWorkspace = mutation({
  args: { name: v.string(), seats: v.number() },
  handler: async (ctx, { name, seats }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");
    if (user.plan !== "team") throw new Error("Team plan required");

    const workspaceId = await ctx.db.insert("workspaces", {
      name,
      ownerId: user._id,
      seats,
      createdAt: Date.now(),
    });

    await ctx.db.insert("workspaceMembers", {
      workspaceId,
      userId: user._id,
      role: "owner",
    });

    await ctx.db.patch(user._id, { workspaceId });

    return workspaceId;
  },
});

export const getMyWorkspace = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || !user.workspaceId) return null;

    const workspace = await ctx.db.get(user.workspaceId);
    if (!workspace) return null;

    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .collect();

    const memberUsers = await Promise.all(
      members.map(async (m) => {
        const u = await ctx.db.get(m.userId);
        return u ? { ...u, role: m.role } : null;
      })
    );

    return {
      ...workspace,
      members: memberUsers.filter((m) => m !== null),
    };
  },
});

export const inviteMember = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const owner = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!owner || !owner.workspaceId)
      throw new Error("No workspace");

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", owner._id))
      .first();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new Error("Admin/owner only");
    }

    const invitee = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .unique();

    if (!invitee) throw new Error("User must sign up first to be invited");

    const existing = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", invitee._id))
      .first();

    if (existing) throw new Error("User already in a workspace");

    await ctx.db.insert("workspaceMembers", {
      workspaceId: owner.workspaceId,
      userId: invitee._id,
      role: "member",
    });

    await ctx.db.patch(invitee._id, {
      workspaceId: owner.workspaceId,
      plan: "team",
    });
  },
});
