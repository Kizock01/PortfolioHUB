"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type LocalUser = {
  id: string;
  name: string;
  email: string;
  salt?: string;
  passwordHash?: string;
  password?: string;
};

type SessionUser = { id: string; name: string; email: string };

type AuthContextValue = {
  user: SessionUser | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  logout: () => void;
  getSession: () => Promise<SessionUser | null>;
};

const USERS_KEY = "studyquest:localUsers";
const CURRENT_KEY = "studyquest:currentUser";
const LEGACY_USERS_KEY = "studyquest:auth:users";
const LEGACY_CURRENT_KEY = "studyquest:auth:currentUser";
const AuthContext = createContext<AuthContextValue | null>(null);
const MIN_PASSWORD_LENGTH = 8;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mapLocalUser(user: LocalUser): SessionUser {
  return { id: user.id, name: user.name, email: user.email };
}

function readUsers(): LocalUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY) ?? window.localStorage.getItem(LEGACY_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: LocalUser[]) {
  if (typeof window === "undefined") return;
  const sanitized = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: normalizeEmail(user.email),
    salt: user.salt,
    passwordHash: user.passwordHash,
  }));
  window.localStorage.setItem(USERS_KEY, JSON.stringify(sanitized));
  window.localStorage.removeItem(LEGACY_USERS_KEY);
}

function readCurrentUserId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CURRENT_KEY) ?? window.localStorage.getItem(LEGACY_CURRENT_KEY);
}

function writeCurrentUserId(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CURRENT_KEY, id);
  window.localStorage.removeItem(LEGACY_CURRENT_KEY);
}

function clearCurrentUserId() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CURRENT_KEY);
  window.localStorage.removeItem(LEGACY_CURRENT_KEY);
}

function readCurrentLocalUser() {
  const users = readUsers();
  const currentId = readCurrentUserId();
  if (!currentId) return null;
  const current = users.find((item) => item.id === currentId);
  return current ? mapLocalUser(current) : null;
}

function findLocalUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const users = readUsers();
  const index = users.findIndex((item) => normalizeEmail(item.email) === normalizedEmail);
  return { users, index };
}

async function migrateLegacyUsers() {
  const users = readUsers();
  if (!users.length) return;
  let changed = false;
  const nextUsers: LocalUser[] = [];

  for (const user of users) {
    if (user.passwordHash && user.salt) {
      if (user.password) changed = true;
      nextUsers.push({ ...user, password: undefined });
      continue;
    }

    if (!user.password) {
      nextUsers.push(user);
      continue;
    }

    try {
      const { salt, hash } = await hashPassword(user.password);
      nextUsers.push({
        id: user.id,
        name: user.name,
        email: normalizeEmail(user.email),
        salt,
        passwordHash: hash,
      });
      changed = true;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[StudyQuest][auth] migrate local user", error);
      }
      nextUsers.push(user);
    }
  }

  if (changed) {
    writeUsers(nextUsers);
  }
}

async function upsertLocalMirror(name: string, email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const { users, index } = findLocalUserByEmail(normalizedEmail);
  if (index >= 0) {
    const existing = users[index];
    if (existing.passwordHash && existing.salt) {
      if (existing.name !== name.trim() && name.trim()) {
        const nextUsers = [...users];
        nextUsers[index] = { ...existing, name: name.trim() };
        writeUsers(nextUsers);
      }
      return existing;
    }
    const hashed = await hashPassword(password);
    const upgraded: LocalUser = {
      id: existing.id,
      name: name.trim() || existing.name,
      email: normalizedEmail,
      salt: hashed.salt,
      passwordHash: hashed.hash,
    };
    const nextUsers = [...users];
    nextUsers[index] = upgraded;
    writeUsers(nextUsers);
    return upgraded;
  }

  const hashed = await hashPassword(password);
  const created: LocalUser = {
    id: `u_${Date.now()}`,
    name: name.trim() || normalizedEmail.split("@")[0] || "Aluno",
    email: normalizedEmail,
    salt: hashed.salt,
    passwordHash: hashed.hash,
  };
  writeUsers([...users, created]);
  return created;
}

async function verifyLocalLogin(email: string, password: string): Promise<LocalUser | null> {
  const normalizedEmail = normalizeEmail(email);
  const { users, index } = findLocalUserByEmail(normalizedEmail);
  if (index < 0) return null;

  const found = users[index];
  if (found.passwordHash && found.salt) {
    const valid = await verifyPassword(password, found.salt, found.passwordHash);
    return valid ? found : null;
  }

  if (!found.password || found.password !== password) return null;

  try {
    const { salt, hash } = await hashPassword(password);
    const upgraded: LocalUser = {
      id: found.id,
      name: found.name,
      email: normalizedEmail,
      salt,
      passwordHash: hash,
    };
    const nextUsers = [...users];
    nextUsers[index] = upgraded;
    writeUsers(nextUsers);
    return upgraded;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[StudyQuest][auth] upgrade local password", error);
    }
    return found;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const rawSupabase = getSupabaseBrowserClient();
  const isLocalHost = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const supabase = isLocalHost ? null : rawSupabase;
  const [user, setUser] = useState<SessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setUser(readCurrentLocalUser());
      setHydrated(true);
    }, 0);
    void migrateLegacyUsers();
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (error && process.env.NODE_ENV === "development") {
        console.warn("[StudyQuest][auth] getSession", error.message);
      }
      const next = data.session?.user;
      if (next) {
        setUser({
          id: next.id,
          name: (next.user_metadata?.name as string) ?? next.email?.split("@")[0] ?? "Aluno",
          email: next.email ?? "",
        });
        return;
      }
      setUser((current) => current ?? readCurrentLocalUser());
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = session?.user;
      if (next) {
        setUser({
          id: next.id,
          name: (next.user_metadata?.name as string) ?? next.email?.split("@")[0] ?? "Aluno",
          email: next.email ?? "",
        });
        return;
      }
      setUser(readCurrentLocalUser());
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      hydrated,
      login: async (email, password) => {
        const normalizedEmail = normalizeEmail(email);
        if (!isValidEmail(normalizedEmail) || !password) {
          return { ok: false, message: "Email ou senha invalidos." };
        }
        if (supabase) {
          let signInError: unknown = null;
          let signInUser: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null = null;
          try {
            const { error, data } = await supabase.auth.signInWithPassword({
              email: normalizedEmail,
              password,
            });
            signInError = error;
            signInUser = data.user;
          } catch (error) {
            signInError = error;
          }
          if (!signInError && signInUser) {
            try {
              await upsertLocalMirror(
                (signInUser.user_metadata?.name as string) ?? signInUser.email?.split("@")[0] ?? "Aluno",
                normalizedEmail,
                password,
              );
            } catch (mirrorError) {
              if (process.env.NODE_ENV === "development") {
                console.warn("[StudyQuest][auth] local mirror login", mirrorError);
              }
            }
            return { ok: true, message: "Login realizado com sucesso." };
          }
          if (process.env.NODE_ENV === "development") {
            console.warn("[StudyQuest][auth] signInWithPassword fallback local", signInError);
          }
          const found = await verifyLocalLogin(normalizedEmail, password);
          if (!found) {
            return { ok: false, message: "Email ou senha invalidos." };
          }
          writeCurrentUserId(found.id);
          setUser(mapLocalUser(found));
          return { ok: true, message: "Nao foi possivel entrar agora. Usando modo local." };
        }

        const found = await verifyLocalLogin(normalizedEmail, password);
        if (!found) {
          return { ok: false, message: "Email ou senha invalidos." };
        }
        writeCurrentUserId(found.id);
        setUser(mapLocalUser(found));
        return { ok: true, message: "Login realizado com sucesso." };
      },
      register: async (name, email, password) => {
        const normalizedEmail = normalizeEmail(email);
        if (!name.trim()) {
          return { ok: false, message: "Informe seu nome para criar a conta." };
        }
        if (!isValidEmail(normalizedEmail)) {
          return { ok: false, message: "Informe um email valido." };
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
          return { ok: false, message: "Use uma senha com pelo menos 8 caracteres." };
        }
        const localUsers = readUsers();
        const existsLocal = localUsers.some((item) => normalizeEmail(item.email) === normalizedEmail);
        if (existsLocal && !supabase) {
          return { ok: false, message: "Este email ja possui cadastro." };
        }

        if (supabase) {
          let signUpError: unknown = null;
          let signUpData: Awaited<ReturnType<typeof supabase.auth.signUp>>["data"] | null = null;
          try {
            const { error, data } = await supabase.auth.signUp({
              email: normalizedEmail,
              password,
              options: { data: { name: name.trim() } },
            });
            signUpError = error;
            signUpData = data;
          } catch (error) {
            signUpError = error;
          }

          if (!signUpError && signUpData) {
            try {
              const localUser = await upsertLocalMirror(name, normalizedEmail, password);
              writeCurrentUserId(localUser.id);
            } catch (mirrorError) {
              if (process.env.NODE_ENV === "development") {
                console.warn("[StudyQuest][auth] local mirror register", mirrorError);
              }
            }
            if (signUpData.user) {
              setUser({
                id: signUpData.user.id,
                name: ((signUpData.user.user_metadata?.name as string) ?? name.trim()) || "Aluno",
                email: signUpData.user.email ?? normalizedEmail,
              });
            } else {
              const localUser = readCurrentLocalUser();
              setUser(localUser);
            }
            if (!signUpData.session) {
              return { ok: true, message: "Cadastro criado. Verifique seu email para confirmar a conta." };
            }
            return { ok: true, message: "Conta criada com sucesso." };
          }

          if (process.env.NODE_ENV === "development") {
            console.warn("[StudyQuest][auth] signUp fallback local", signUpError);
          }
          try {
            const localUser = await upsertLocalMirror(name, normalizedEmail, password);
            writeCurrentUserId(localUser.id);
            setUser(mapLocalUser(localUser));
            return { ok: true, message: "Conta criada no modo local." };
          } catch (localError) {
            if (process.env.NODE_ENV === "development") {
              console.warn("[StudyQuest][auth] local register failed", localError);
            }
            return { ok: false, message: "Nao foi possivel criar a conta agora. Tente novamente." };
          }
        }

        if (existsLocal) {
          return { ok: false, message: "Este email ja possui cadastro." };
        }
        try {
          const localUser = await upsertLocalMirror(name, normalizedEmail, password);
          writeCurrentUserId(localUser.id);
          setUser(mapLocalUser(localUser));
          return { ok: true, message: "Conta criada no modo local." };
        } catch (localError) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[StudyQuest][auth] local register failed", localError);
          }
          return { ok: false, message: "Nao foi possivel criar a conta agora. Tente novamente." };
        }
      },
      logout: () => {
        if (supabase) {
          void supabase.auth.signOut();
        }
        clearCurrentUserId();
        setUser(null);
      },
      getSession: async () => {
        if (supabase) {
          const { data, error } = await supabase.auth.getSession();
          if (error && process.env.NODE_ENV === "development") {
            console.warn("[StudyQuest][auth] getSession", error.message);
          }
          const next = data.session?.user;
          if (next) {
            return {
              id: next.id,
              name: (next.user_metadata?.name as string) ?? next.email?.split("@")[0] ?? "Aluno",
              email: next.email ?? "",
            };
          }
        }
        return user;
      },
    }),
    [hydrated, supabase, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
