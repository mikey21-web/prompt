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

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Account</h2>
        <p className="text-gray-600">
          {user?.primaryEmailAddress?.emailAddress || 'No email found'}
        </p>
      </div>

      <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Preferences</h2>
        <label htmlFor="email-notifications" className="flex items-center gap-2">
          <input
            id="email-notifications"
            type="checkbox"
            defaultChecked={convexUser?.preferences?.emailNotifications ?? true}
            onChange={handleEmailToggle}
            className="rounded border-gray-300"
          />
          <span className="text-gray-700">Email notifications</span>
        </label>
      </div>
    </div>
  );
}
