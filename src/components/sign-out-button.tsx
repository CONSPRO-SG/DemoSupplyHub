"use client";

import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";

export function SignOutButton() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  async function onSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button className="btn btn-secondary" onClick={onSignOut}>
      Sign Out
    </button>
  );
}
