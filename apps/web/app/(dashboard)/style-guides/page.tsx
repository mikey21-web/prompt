'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@promptforge/convex/convex/_generated/api';
import { MODELS, ALL_MODEL_IDS, type ModelId } from '@promptforge/core';
import type { Id } from '@promptforge/convex/convex/_generated/dataModel';
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  BookOpen,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface GuideDoc {
  _id: Id<'customStyleGuides'>;
  targetModel: string;
  name: string;
  rules: string[];
  avoid: string[];
  formatOverride?: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

function TagInput({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed || items.includes(trimmed)) return;
    onChange([...items, trimmed]);
    setDraft('');
  };

  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Add
        </button>
      </div>
      {items.length > 0 && (
        <ul className="mt-2 space-y-1">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-md bg-gray-50 px-3 py-1.5 text-xs text-gray-700"
            >
              <span className="flex-1">{item}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-gray-400 hover:text-red-500 mt-0.5"
                aria-label="Remove"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GuideForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<GuideDoc>;
  onSave: (data: {
    targetModel: string;
    name: string;
    rules: string[];
    avoid: string[];
    formatOverride?: string;
    active: boolean;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [targetModel, setTargetModel] = useState(
    initial?.targetModel ?? 'claude-sonnet-4.5'
  );
  const [name, setName] = useState(initial?.name ?? '');
  const [rules, setRules] = useState<string[]>(initial?.rules ?? []);
  const [avoid, setAvoid] = useState<string[]>(initial?.avoid ?? []);
  const [formatOverride, setFormatOverride] = useState(
    initial?.formatOverride ?? ''
  );
  const [active, setActive] = useState(initial?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Give this guide a name.');
      return;
    }
    if (rules.length === 0 && avoid.length === 0 && !formatOverride.trim()) {
      setError('Add at least one rule, anti-pattern, or format override.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        targetModel,
        name: name.trim(),
        rules,
        avoid,
        formatOverride: formatOverride.trim() || undefined,
        active,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50 p-6 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Target model
          </label>
          <select
            value={targetModel}
            onChange={(e) => setTargetModel(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          >
            {ALL_MODEL_IDS.map((id) => (
              <option key={id} value={id}>
                {MODELS[id].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Guide name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My Claude rules"
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
        </div>
      </div>

      <TagInput
        label="Additional rules (appended to built-in guide)"
        items={rules}
        onChange={setRules}
        placeholder="Always respond in bullet points"
      />

      <TagInput
        label="Anti-patterns (appended to built-in avoid list)"
        items={avoid}
        onChange={setAvoid}
        placeholder="Never use passive voice"
      />

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Format override{' '}
          <span className="font-normal text-gray-400">
            (optional — replaces the built-in format skeleton entirely)
          </span>
        </label>
        <textarea
          value={formatOverride}
          onChange={(e) => setFormatOverride(e.target.value)}
          rows={4}
          placeholder="Paste your custom format skeleton here…"
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm font-mono focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActive(!active)}
          className="text-gray-500 hover:text-violet-600"
          aria-label="Toggle active"
        >
          {active ? (
            <ToggleRight className="h-5 w-5 text-violet-600" />
          ) : (
            <ToggleLeft className="h-5 w-5" />
          )}
        </button>
        <span className="text-sm text-gray-700">
          {active ? 'Active — will be applied on next forge' : 'Inactive'}
        </span>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          <Check className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save guide'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function StyleGuidesPage() {
  const guides = useQuery(api.styleGuides.listMyGuides);
  const createGuide = useMutation(api.styleGuides.createGuide);
  const updateGuide = useMutation(api.styleGuides.updateGuide);
  const deleteGuide = useMutation(api.styleGuides.deleteGuide);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<'customStyleGuides'> | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<Id<'customStyleGuides'> | null>(
    null
  );

  const handleCreate = async (data: Parameters<typeof createGuide>[0]) => {
    await createGuide(data);
    setShowForm(false);
  };

  const handleUpdate = async (
    id: Id<'customStyleGuides'>,
    data: {
      name?: string;
      rules?: string[];
      avoid?: string[];
      formatOverride?: string;
      active?: boolean;
    }
  ) => {
    await updateGuide({ guideId: id, ...data });
    setEditingId(null);
  };

  const handleDelete = async (id: Id<'customStyleGuides'>) => {
    setDeletingId(id);
    try {
      await deleteGuide({ guideId: id });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (guide: GuideDoc) => {
    await updateGuide({ guideId: guide._id, active: !guide.active });
  };

  if (guides === undefined) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded bg-gray-200" />
        <div className="h-4 w-2/3 rounded bg-gray-200" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Style Guides</h1>
          <p className="mt-2 text-gray-600">
            Customize how PromptForge formats prompts for each model. Your rules
            are merged with the built-in style guide at forge time.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            New guide
          </button>
        )}
      </div>

      {showForm && (
        <GuideForm
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {guides.length === 0 && !showForm ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-3 text-sm text-gray-600">
            No custom style guides yet. Create one to override or extend the
            built-in formatting rules for any model.
          </p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            Create first guide
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {(guides as GuideDoc[]).map((guide) =>
            editingId === guide._id ? (
              <GuideForm
                key={guide._id}
                initial={guide}
                onSave={(data) => handleUpdate(guide._id, data)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                key={guide._id}
                className={`rounded-lg border bg-white p-5 shadow-sm transition ${
                  guide.active
                    ? 'border-violet-200'
                    : 'border-gray-200 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {guide.name}
                      </h3>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                        {MODELS[guide.targetModel as ModelId]?.label ??
                          guide.targetModel}
                      </span>
                      {guide.active && (
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
                      {guide.rules.length > 0 && (
                        <div>
                          <p className="font-medium text-gray-700 mb-1">
                            Rules ({guide.rules.length})
                          </p>
                          <ul className="space-y-0.5 list-disc list-inside">
                            {guide.rules.slice(0, 3).map((r, i) => (
                              <li key={i} className="truncate">
                                {r}
                              </li>
                            ))}
                            {guide.rules.length > 3 && (
                              <li className="text-gray-400">
                                +{guide.rules.length - 3} more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                      {guide.avoid.length > 0 && (
                        <div>
                          <p className="font-medium text-gray-700 mb-1">
                            Avoid ({guide.avoid.length})
                          </p>
                          <ul className="space-y-0.5 list-disc list-inside">
                            {guide.avoid.slice(0, 3).map((a, i) => (
                              <li key={i} className="truncate">
                                {a}
                              </li>
                            ))}
                            {guide.avoid.length > 3 && (
                              <li className="text-gray-400">
                                +{guide.avoid.length - 3} more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    {guide.formatOverride && (
                      <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
                        Custom format override active
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(guide)}
                      title={guide.active ? 'Deactivate' : 'Activate'}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-violet-600"
                    >
                      {guide.active ? (
                        <ToggleRight className="h-4 w-4 text-violet-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(guide._id)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(guide._id)}
                      disabled={deletingId === guide._id}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Built-in guides reference */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">
          Built-in style guides
        </h2>
        <p className="text-xs text-gray-600 mb-3">
          These are the system defaults. Your custom guides are merged on top —
          they don&apos;t replace the built-in ones unless you use a format override.
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_MODEL_IDS.map((id) => (
            <span
              key={id}
              className="rounded-full bg-white border border-gray-200 px-2.5 py-0.5 text-xs text-gray-700"
            >
              {MODELS[id].label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
