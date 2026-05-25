"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@promptforge/convex/convex/_generated/api";

/**
 * Ensures a Convex user row exists for the signed-in Clerk user.
 *
 * Without this, `api.users.getMe` returns null forever after sign-in
 * because nothing creates the row. The dashboard then appears stuck on
 * "loading" or "setting up your account".
 *
 * Runs once per session; idempotent on the server side via upsertUser.
 */
export function UserSync() {
  const { user, isLoaded, isSignedIn } = useUser();
  const upsertUser = useMutation(api.users.upsertUser);
  const ranRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || ranRef.current) return;
    ranRef.current = true;
    const email = user.primaryEmailAddress?.emailAddress ?? "";
    if (!email) return;
    upsertUser({ clerkId: user.id, email }).catch(() => {
      // swallow — next page that calls getMe will retry implicitly
      ranRef.current = false;
    });
  }, [isLoaded, isSignedIn, user, upsertUser]);

  return null;
}
