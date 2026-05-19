"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@promptforge/convex/convex/_generated/api";
import { TemplateCard, type Template } from "@promptforge/ui";
import { useState } from "react";

export default function LibraryPage() {
  const [tab, setTab] = useState<"community" | "mine">("community");
  const [tagFilter, setTagFilter] = useState("");

  const community = useQuery(api.templates.listPublic, {
    tag: tagFilter || undefined,
    limit: 50,
  });
  const mine = useQuery(api.templates.listMine);
  const vote = useMutation(api.templates.voteTemplate);

  const templates = (tab === "community" ? community : mine) ?? [];

  function handleUse(t: Template) {
    void navigator.clipboard.writeText("");
    void navigator.clipboard.writeText((t as Template & { content?: string }).content ?? "");
    alert("Template copied to clipboard!");
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Template Library</h1>
        <button className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700">
          + New Template
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex border rounded-lg overflow-hidden">
          {(["community", "mine"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-violet-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t === "community" ? "Community" : "My Templates"}
            </button>
          ))}
        </div>
        {tab === "community" && (
          <input
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            placeholder="Filter by tag..."
            className="border rounded-lg px-3 py-2 text-sm text-gray-700 w-48"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <TemplateCard
            key={template._id}
            template={template as unknown as Template}
            onUse={handleUse}
            onVote={(id) => vote({ templateId: id as never })}
          />
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          {tab === "community"
            ? "No community templates yet. Be the first!"
            : "No templates yet. Create your first template above."}
        </div>
      )}
    </div>
  );
}
