import { useState, useEffect, useRef } from "react";
import { hasSupabaseConfig, supabase } from "../lib/supabaseClient";
import { authFetch } from "../lib/authFetch";

const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || "http://127.0.0.1:8000").replace(/\/$/, "");
const API_BASE_URL = `${API_ORIGIN}/api`;
const PERMISSION_SELECT =
  "manage_products, delete_products, manage_collections, manage_inventory, " +
  "manage_metafields, manage_upload, manage_export, use_ai, manage_stores, " +
  "manage_users, view_analytics";

/**
 * useAuth hook - Centralized authentication state
 * Fetches user info, role, and permissions from Supabase
 * Returns: { user, role, permissions, loading, signOut, can }
 * - can(permission) - Check if user has a specific permission
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const fetchInProgressRef = useRef(false);
  const lastUserIdRef = useRef(null);
  const onboardingAttemptedRef = useRef(new Set());

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      console.error(
        "[useAuth] Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
      );
      setUser(null);
      setRole(null);
      setPermissions({});
      setLoading(false);
      return;
    }

    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserDataOnce(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          fetchUserDataOnce(session.user);
        } else {
          setRole(null);
          setPermissions({});
          setLoading(false);
          lastUserIdRef.current = null;
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  async function maybeApplySignupRole(authUser, userData) {
    if (!supabase) return false;

    const desiredRole = String(authUser?.user_metadata?.desired_role || "")
      .trim()
      .toLowerCase();
    const adminEmail = String(authUser?.user_metadata?.admin_email || "").trim();

    if (!desiredRole || !["admin", "manager", "junior"].includes(desiredRole)) {
      return false;
    }

    const needsApply =
      userData?.role !== desiredRole ||
      ((desiredRole === "manager" || desiredRole === "junior") && !userData?.created_by);

    if (!needsApply) {
      return false;
    }

    if (onboardingAttemptedRef.current.has(authUser.id)) {
      return false;
    }
    onboardingAttemptedRef.current.add(authUser.id);

    const res = await authFetch(`${API_BASE_URL}/users/me/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: desiredRole,
        admin_email: adminEmail || null,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.message || "Failed to apply signup role");
    }
    return true;
  }

  async function fetchUserDataOnce(authUser) {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const userId = authUser?.id;
    if (!userId) return;

    // Don't fetch if already fetching or if we already fetched this user
    if (fetchInProgressRef.current || lastUserIdRef.current === userId) {
      return;
    }

    fetchInProgressRef.current = true;
    lastUserIdRef.current = userId;

    try {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        setRole(null);
        setPermissions({});
        return;
      }

      const userRes = await authFetch(`${API_BASE_URL}/users/me`);
      if (!userRes.ok) {
        const err = await userRes.json().catch(() => ({}));
        throw new Error(err.detail || err.message || `HTTP ${userRes.status}`);
      }

      let userData = await userRes.json();
      if (!userData || !userData.id) {
        console.error("No user data returned");
        setRole(null);
        setPermissions({});
        setLoading(false);
        return;
      }

      const onboardingApplied = await maybeApplySignupRole(authUser, userData);
      if (onboardingApplied) {
        const refreshedRes = await authFetch(`${API_BASE_URL}/users/me`);
        if (!refreshedRes.ok) {
          const err = await refreshedRes.json().catch(() => ({}));
          throw new Error(err.detail || err.message || `HTTP ${refreshedRes.status}`);
        }
        userData = await refreshedRes.json();
      }

      const permData = userData.permissions || {};

      setPermissions(permData || {});
      setRole(userData.role || null);
    } catch (err) {
      console.error("Auth fetch error:", err);
      setRole(null);
      setPermissions({});
    } finally {
      setLoading(false);
      fetchInProgressRef.current = false;
    }
  }

  async function signOut() {
    if (!supabase) {
      setUser(null);
      setRole(null);
      setPermissions({});
      lastUserIdRef.current = null;
      fetchInProgressRef.current = false;
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setPermissions({});
    lastUserIdRef.current = null;
    fetchInProgressRef.current = false;
  }

  function can(permission) {
    // Admin has all permissions
    if (role === "admin") return true;
    // Check specific permission
    return permissions[permission] === true;
  }

  return {
    user,
    role,
    permissions,
    loading,
    signOut,
    can,
  };
}
