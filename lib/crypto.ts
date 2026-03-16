import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const hex = process.env.TOKEN_ENCRYPTION_KEY;
  if (!hex) throw new Error("TOKEN_ENCRYPTION_KEY environment variable is not set");
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) throw new Error("TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  return key;
}

/**
 * Encrypts plaintext using AES-256-GCM.
 * Returns a hex string: iv (24 chars) + authTag (32 chars) + ciphertext (variable).
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("hex");
}

/**
 * Decrypts a hex-encoded string produced by `encrypt`.
 */
export function decrypt(encryptedHex: string): string {
  const key = getKey();
  const data = Buffer.from(encryptedHex, "hex");

  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
