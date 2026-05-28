"use client";

const ITERATIONS = 120000;
const KEY_LENGTH = 256;

function bytesToBase64(bytes: Uint8Array) {
  if (typeof btoa === "undefined") {
    throw new Error("Base64 indisponivel neste ambiente.");
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(value: string) {
  if (typeof atob === "undefined") {
    throw new Error("Base64 indisponivel neste ambiente.");
  }
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

async function deriveHash(password: string, saltBytes: Uint8Array) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto API indisponivel.");
  }
  const encoder = new TextEncoder();
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await globalThis.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBytes as BufferSource,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LENGTH,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<{ salt: string; hash: string }> {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("Web Crypto API indisponivel.");
  }
  const saltBytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const hashBytes = await deriveHash(password, saltBytes);
  return {
    salt: bytesToBase64(saltBytes),
    hash: bytesToBase64(hashBytes),
  };
}

export async function verifyPassword(password: string, salt: string, hash: string): Promise<boolean> {
  try {
    const saltBytes = base64ToBytes(salt);
    const expectedHashBytes = base64ToBytes(hash);
    const computedHashBytes = await deriveHash(password, saltBytes);
    return timingSafeEqual(expectedHashBytes, computedHashBytes);
  } catch {
    return false;
  }
}
