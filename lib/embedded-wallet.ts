"use client";

import { privateKeyToAccount } from "viem/accounts";

const STORAGE_KEY = "arc-one-embedded-wallet";
const WORDS = [
  "arc",
  "orbit",
  "nova",
  "vault",
  "signal",
  "pulse",
  "vector",
  "lumen",
  "cipher",
  "ledger",
  "prism",
  "atlas",
  "spark",
  "harbor",
  "vertex",
  "mint",
  "bridge",
  "quantum",
  "glide",
  "apex",
  "matrix",
  "anchor",
  "drift",
  "zenith"
];

export type EmbeddedWalletRecord = {
  address: `0x${string}`;
  encryptedPrivateKey: string;
  encryptedRecoveryPhrase: string;
  salt: string;
  iv: string;
  createdAt: string;
};

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string) {
  const cleanHex = hex.replace(/^0x/, "");
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(cleanHex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function makeRecoveryPhrase() {
  const random = new Uint8Array(12);
  crypto.getRandomValues(random);
  return Array.from(random, (byte) => WORDS[byte % WORDS.length]).join(" ");
}

async function deriveKey(passcode: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(passcode), "PBKDF2", false, ["deriveKey"]);
  const saltBuffer = salt.slice().buffer as ArrayBuffer;
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: saltBuffer, iterations: 210_000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptText(value: string, passcode: string, salt: Uint8Array, iv: Uint8Array) {
  const key = await deriveKey(passcode, salt);
  const ivBuffer = iv.slice().buffer as ArrayBuffer;
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: ivBuffer }, key, new TextEncoder().encode(value));
  return bytesToHex(new Uint8Array(encrypted));
}

async function decryptText(value: string, passcode: string, salt: Uint8Array, iv: Uint8Array) {
  const key = await deriveKey(passcode, salt);
  const ivBuffer = iv.slice().buffer as ArrayBuffer;
  const encryptedBuffer = hexToBytes(value).slice().buffer as ArrayBuffer;
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBuffer }, key, encryptedBuffer);
  return new TextDecoder().decode(decrypted);
}

export async function createEmbeddedWallet(passcode: string) {
  if (passcode.length < 6) {
    throw new Error("Use at least 6 digits or characters for the wallet passcode.");
  }

  const privateKeyBytes = new Uint8Array(32);
  crypto.getRandomValues(privateKeyBytes);
  const privateKey = `0x${bytesToHex(privateKeyBytes)}` as `0x${string}`;
  const recoveryPhrase = makeRecoveryPhrase();
  const account = privateKeyToAccount(privateKey);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const record: EmbeddedWalletRecord = {
    address: account.address,
    encryptedPrivateKey: await encryptText(privateKey, passcode, salt, iv),
    encryptedRecoveryPhrase: await encryptText(recoveryPhrase, passcode, salt, iv),
    salt: bytesToHex(salt),
    iv: bytesToHex(iv),
    createdAt: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  return { address: account.address, recoveryPhrase };
}

export function getEmbeddedWalletRecord(): EmbeddedWalletRecord | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as EmbeddedWalletRecord;
}

export async function unlockEmbeddedWallet(passcode: string) {
  const record = getEmbeddedWalletRecord();
  if (!record) {
    throw new Error("No embedded wallet found on this device.");
  }

  const salt = hexToBytes(record.salt);
  const iv = hexToBytes(record.iv);
  const privateKey = (await decryptText(record.encryptedPrivateKey, passcode, salt, iv)) as `0x${string}`;
  return {
    account: privateKeyToAccount(privateKey),
    privateKey
  };
}

export async function exportEmbeddedWallet(passcode: string) {
  const record = getEmbeddedWalletRecord();
  if (!record) {
    throw new Error("No embedded wallet found on this device.");
  }

  const salt = hexToBytes(record.salt);
  const iv = hexToBytes(record.iv);

  return {
    privateKey: await decryptText(record.encryptedPrivateKey, passcode, salt, iv),
    recoveryPhrase: await decryptText(record.encryptedRecoveryPhrase, passcode, salt, iv)
  };
}

export function removeEmbeddedWallet() {
  localStorage.removeItem(STORAGE_KEY);
}
