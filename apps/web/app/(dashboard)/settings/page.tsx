"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function SettingsPage() {
  const { user } = useUser();
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900">Account</h3>
        <p className="mt-4 text-sm text-gray-600">
          {user?.primaryEmailAddress?.emailAddress}
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Preferences</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            defaultChecked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="ml-2 text-gray-700">Email notifications</span>
        </label>
      </div>
    </div>
  );
}
