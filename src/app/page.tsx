"use client";

import { useEffect } from "react";

export default function RootPage() {
  useEffect(() => {
    window.location.href = "/zh/";
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-slate-400">Redirecting...</div>
    </div>
  );
}
