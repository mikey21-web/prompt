export interface Template {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  targetModel: string;
  votes: number;
  usageCount: number;
}

interface TemplateCardProps {
  template: Template;
  onUse: (template: Template) => void;
  onVote?: (templateId: string) => void;
  hasVoted?: boolean;
}

export function TemplateCard({
  template,
  onUse,
  onVote,
  hasVoted,
}: TemplateCardProps) {
  return (
    <div className="border rounded-xl p-4 hover:border-violet-300 transition-colors bg-white">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-sm text-gray-900 leading-tight">
          {template.title}
        </h3>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded shrink-0">
          {template.targetModel}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
        {template.description}
      </p>
      <div className="flex flex-wrap gap-1 mb-3">
        {template.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <button
            onClick={() => onVote?.(template._id)}
            className={`flex items-center gap-1 hover:text-violet-600 transition-colors ${hasVoted ? "text-violet-600" : ""}`}
          >
            ▲ {template.votes}
          </button>
          <span>· {template.usageCount} uses</span>
        </div>
        <button
          onClick={() => onUse(template)}
          className="text-xs bg-violet-600 text-white px-3 py-1 rounded-lg hover:bg-violet-700 transition-colors"
        >
          Use
        </button>
      </div>
    </div>
  );
}
