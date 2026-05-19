"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@promptforge/convex/convex/_generated/api";
import { TemplateCard } from "@promptforge/ui";
import { useState } from "react";
import Link from "next/link";

const MODE_LABELS: Record<string, string> = {
  compress: "⚡ Compress",
  enhance: "✨ Enhance",
  rewrite: "✏️ Rewrite",
  tone: "🎭 Tone",
  qa: "💬 Q&A",
  template: "📋 Template",
  api: "⚙️ API",
};

export default function TemplatesPage() {
  const templates = useQuery(api.templates.listMine);
  const { mutate: voteTemplate } = useMutation(api.templates.voteTemplate);
  const [selectedTemplate, setSelectedTemplate] = useState<{
    title: string;
    content: string;
  } | null>(null);

  const handleUseTemplate = (template: any) => {
    setSelectedTemplate({
      title: template.title,
      content: template.content,
    });
    // Navigate to optimize page with template data
    // This would typically be handled via router.push with state
  };

  const handleVote = async (templateId: string) => {
    try {
      await voteTemplate({ templateId });
    } catch (error) {
      console.error("Vote failed:", error);
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
        <Link
          href="/dashboard"
          className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 text-sm font-medium transition-colors"
        >
          + New Template
        </Link>
      </div>

      {templates?.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed">
          <p className="text-gray-500 mb-4">No templates yet.</p>
          <p className="text-sm text-gray-400 mb-6">
            Save optimized prompts as templates to reuse them later.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 text-sm font-medium transition-colors"
          >
            Create First Template
          </Link>
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
              onUse={handleUseTemplate}
              onVote={handleVote}
              hasVoted={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
