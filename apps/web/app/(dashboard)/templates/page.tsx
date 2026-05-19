"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@promptforge/convex/convex/_generated/api";
import { useState } from "react";
import Link from "next/link";

export default function TemplatesPage() {
  const workspace = useQuery(api.workspaces.getMyWorkspace);
  const invite = useMutation(api.workspaces.inviteMember);
  const [email, setEmail] = useState("");

  async function handleInvite() {
    if (!email.trim()) return;
    try {
      await invite({ email });
      setEmail("");
      alert(`Invited ${email}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Invite failed");
    }
  }

  if (workspace === undefined)
    return <div className="animate-pulse">Loading workspace...</div>;

  if (workspace === null) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <div className="bg-white border rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">👥</div>
          <h2 className="font-bold text-lg text-gray-900 mb-2">
            No workspace yet
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Workspaces require a Team plan ($25/seat/mo). Get team analytics,
            shared templates, and admin controls.
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-violet-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700"
          >
            Upgrade to Team →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {workspace.name}
        </h1>
        <span className="text-sm text-gray-500">
          {workspace.members.length}/{workspace.seats} seats
        </span>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Invite Member</h2>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@company.com"
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={handleInvite}
            className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700"
          >
            Invite
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Members</h2>
        <div className="space-y-2">
          {workspace.members.map((m) => (
            <div
              key={m._id}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div>
                <p className="font-medium text-sm">{m.email}</p>
                <p className="text-xs text-gray-400 capitalize">{m.role}</p>
              </div>
              <span className="text-xs text-gray-400">
                {m.dailyUsage}/500 today
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
