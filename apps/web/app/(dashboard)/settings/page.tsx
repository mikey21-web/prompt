"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function SettingsPage() {
  const { user } = useUser();
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900">Account</h3>
        <p className="mt-4 text-sm text-gray-600">
          {user?.primaryEmailAddress?.emailAddress || 'No email found'}
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Preferences</h3>
        <label className="flex items-center">
          <input
            id="email-notifications"
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="email-notifications" className="ml-2 text-gray-700">Email notifications</label>
        </label>
      </div>
    </div>
  );
}
