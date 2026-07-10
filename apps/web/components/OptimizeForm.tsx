'use client';

import { useState } from 'react';
import { ModeButton } from '@promptforge/ui';
import type { Mode, TargetModel } from '@promptforge/core';

interface OptimizeFormProps {
  onSubmit: (prompt: string, mode: Mode, targetModel: TargetModel) => Promise<void>;
  loading: boolean;
}

const validModels = ['gpt-4o-mini', 'gpt-4o'] as const;

export function OptimizeForm({ onSubmit, loading }: OptimizeFormProps) {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<Mode>('compress');
  const [targetModel, setTargetModel] = useState<TargetModel>('gpt-4o-mini');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await onSubmit(prompt, mode, targetModel);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedModel = e.target.value as typeof validModels[number];
    if (!validModels.includes(selectedModel)) return;
    setTargetModel(selectedModel as TargetModel);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="prompt-input" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Your Prompt
        </label>
        <textarea
          id="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter the prompt you want to optimize..."
          className="mt-1 block w-full rounded border px-3 py-2 shadow-sm focus:outline-none focus:ring-1"
          style={{ borderColor: 'var(--border)' }}
          rows={6}
          disabled={loading}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <ModeButton
          mode="compress"
          active={mode === 'compress'}
          onClick={() => setMode('compress')}
        />
        <ModeButton
          mode="enhance"
          active={mode === 'enhance'}
          onClick={() => setMode('enhance')}
        />
        <ModeButton
          mode="rewrite"
          active={mode === 'rewrite'}
          onClick={() => setMode('rewrite')}
        />
      </div>

      <div>
        <label htmlFor="model-select" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Target Model
        </label>
        <select
          id="model-select"
          value={targetModel}
          onChange={handleModelChange}
          className="mt-1 block w-full rounded border px-3 py-2 shadow-sm focus:outline-none focus:ring-1"
          style={{ borderColor: 'var(--border)' }}
          disabled={loading}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <option value="gpt-4o-mini">GPT-4o Mini (Fast &amp; Cheap)</option>
          <option value="gpt-4o">GPT-4o (More Capable)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading || !prompt.trim()}
        aria-label="Optimize prompt with selected mode"
        className="w-full rounded px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
        onMouseEnter={(e) => {
          if (!loading && prompt.trim()) e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent)';
        }}
      >
        {loading ? 'Optimizing...' : 'Optimize'}
      </button>
    </form>
  );
}
