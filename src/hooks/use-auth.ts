"use client";

import { useEffect, useState, useCallback } from "react";
import { isLoggedIn, getSession, login as doLogin, logout as doLogout, initAdminAccount } from "@/lib/admin/store";

const AUTH_EVENT = "aipmbull-auth-change";

export function useAuth() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [session, setSession] = useState<{ username: string; role: string } | null>(null);
  const [checked, setChecked] = useState(false);

  const sync = useCallback(() => {
    setLoggedIn(isLoggedIn());
    setSession(getSession());
    setChecked(true);
  }, []);

  useEffect(() => {
    initAdminAccount();
    sync();
    window.addEventListener(AUTH_EVENT, sync);
    return () => window.removeEventListener(AUTH_EVENT, sync);
  }, [sync]);

  const login = (username: string, password: string): boolean => {
    const success = doLogin(username, password);
    if (success) {
      window.dispatchEvent(new Event(AUTH_EVENT));
    }
    return success;
  };

  const logout = () => {
    doLogout();
    window.dispatchEvent(new Event(AUTH_EVENT));
  };

  return { loggedIn, session, checked, login, logout };
}
