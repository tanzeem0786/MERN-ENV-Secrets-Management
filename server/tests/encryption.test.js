import { describe, expect, it } from 'vitest';
import { decrypt, encrypt } from '../src/security/encryption.js';

describe('AES-256-GCM encryption', () => {
  it('round trips plaintext without exposing it as ciphertext', () => {
    const plaintext = 'test-only-secret-value';
    const encrypted = encrypt(plaintext);

    expect(encrypted.encryptedValue).not.toBe(plaintext);
    expect(decrypt(encrypted.encryptedValue, encrypted.iv, encrypted.authTag)).toBe(plaintext);
  });

  it('uses a unique IV for separate encryptions', () => {
    expect(encrypt('same-value').iv).not.toBe(encrypt('same-value').iv);
  });

  it('rejects modified ciphertext and authentication tags', () => {
    const encrypted = encrypt('integrity-protected-value');
    const modifiedCiphertext = `${encrypted.encryptedValue.slice(0, -2)}AA`;
    const modifiedTag = `${encrypted.authTag.slice(0, -2)}AA`;

    expect(() => decrypt(modifiedCiphertext, encrypted.iv, encrypted.authTag)).toThrow();
    expect(() => decrypt(encrypted.encryptedValue, encrypted.iv, modifiedTag)).toThrow();
  });

  it('rejects missing encryption parameters', () => {
    expect(() => decrypt('', 'iv', 'tag')).toThrow('Missing encryption parameters');
  });
});
