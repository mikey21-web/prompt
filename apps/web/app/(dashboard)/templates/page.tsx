"use client";

import { useQuery } from "convex/react";
import { api } from "@promptforge/convex/convex/_generated/api";
import { TemplateCard } from "@promptforge/ui";
import Link from "next/link";

export default function TemplatesPage() {
  const templates = useQuery(api.templates.listMine);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
        <Link
          href="/dashboard"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
        >
          + New Template
        </Link>
      </div>

      {templates?.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          No templates yet. Save a prompt to create one!
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates?.map((template) => (
            <TemplateCard
              key={template._id}
              template={{
                _id: template._id,
                title: template.title,
                description: template.description,
                tags: template.tags,
                targetModel: template.targetModel,
                votes: template.votes,
                usageCount: template.usageCount,
              }}
              onUse={() => {}}
              hasVoted={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
