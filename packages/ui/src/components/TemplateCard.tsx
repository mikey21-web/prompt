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
    <div
      className="border rounded-xl p-4 transition-colors"
      style={{
        backgroundColor: 'var(--surface-raised)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>
          {template.title}
        </h3>
        <span
          className="text-xs px-2 py-0.5 rounded shrink-0"
          style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)' }}
        >
          {template.targetModel}
        </span>
      </div>
      <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
        {template.description}
      </p>
      <div className="flex flex-wrap gap-1 mb-3">
        {template.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-0.5 rounded"
            style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)' }}
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <button
            onClick={() => onVote?.(template._id)}
            className="flex items-center gap-1 transition-colors"
            style={{ color: hasVoted ? 'var(--accent)' : 'inherit' }}
          >
            ▲ {template.votes}
          </button>
          <span>· {template.usageCount} uses</span>
        </div>
        <button
          onClick={() => onUse(template)}
          className="text-xs text-white px-3 py-1 rounded-lg transition-colors"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Use
        </button>
      </div>
    </div>
  );
}
