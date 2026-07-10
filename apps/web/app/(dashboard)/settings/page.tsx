'use client';

import { useQuery, useMutation } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@promptforge/convex/convex/_generated/api';

export default function SettingsPage() {
  const { user } = useUser();
  const convexUser = useQuery(api.users.getMe);
  const updatePreferences = useMutation(api.users.updatePreferences);

  const handleEmailToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await updatePreferences({ emailNotifications: e.target.checked });
  };

  if (convexUser === undefined) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Settings</h1>

      <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <h2 className="mb-4 text-lg font-semibold">Account</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {user?.primaryEmailAddress?.emailAddress || 'No email found'}
        </p>
      </div>

      <div className="mt-6 rounded-lg border p-6" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <h2 className="mb-4 text-lg font-semibold">Preferences</h2>
        <label htmlFor="email-notifications" className="flex items-center gap-2">
          <input
            id="email-notifications"
            type="checkbox"
            defaultChecked={convexUser?.preferences?.emailNotifications ?? true}
            onChange={handleEmailToggle}
            className="rounded"
            style={{ borderColor: 'var(--border)' }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>Email notifications</span>
        </label>
      </div>
    </div>
  );
}
