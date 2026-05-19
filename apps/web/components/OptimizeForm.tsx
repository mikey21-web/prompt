'use client';

import { useState } from 'react';
import { ModeButton } from '@promptforge/ui';
import type { Mode, TargetModel } from '@promptforge/core';

interface OptimizeFormProps {
  onSubmit: (prompt: string, mode: Mode, targetModel: TargetModel) => Promise<void>;
  loading: boolean;
}

export function OptimizeForm({ onSubmit, loading }: OptimizeFormProps) {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<Mode>('compress');
  const [targetModel, setTargetModel] = useState<TargetModel>('gpt-4o-mini');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await onSubmit(prompt, mode, targetModel);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Your Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter the prompt you want to optimize..."
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          rows={6}
          disabled={loading}
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
        <label className="block text-sm font-medium text-gray-700">
          Target Model
        </label>
        <select
          value={targetModel}
          onChange={(e) => setTargetModel(e.target.value as TargetModel)}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          disabled={loading}
        >
          <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cheap)</option>
          <option value="gpt-4o">GPT-4o (More Capable)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading || !prompt.trim()}
        className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:bg-gray-300"
      >
        {loading ? 'Optimizing...' : 'Optimize'}
      </button>
    </form>
  );
}
