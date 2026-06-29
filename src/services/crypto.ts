/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Encodes a buffer as a hex string.
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Decodes a hex string into a Uint8Array.
 */
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Hashes a password using PBKDF2 with SHA-256 and a random salt.
 * Returns a serialized format: "pbkdf2:iterations:saltHex:hashHex"
 */
export async function hashPassword(password: string): Promise<string> {
  const iterations = 10000;
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const derivedKeyBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256'
    },
    baseKey,
    256 // 32 bytes (256 bits) output key size
  );
  
  const saltHex = bufferToHex(salt.buffer);
  const hashHex = bufferToHex(derivedKeyBits);
  
  return `pbkdf2:${iterations}:${saltHex}:${hashHex}`;
}

/**
 * Verifies a password against an already hashed password string.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
      return false;
    }
    
    const iterations = parseInt(parts[1], 10);
    const saltHex = parts[2];
    const hashHex = parts[3];
    
    const salt = hexToBuffer(saltHex);
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const derivedKeyBits = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256'
      },
      baseKey,
      256
    );
    
    const calculatedHashHex = bufferToHex(derivedKeyBits);
    return calculatedHashHex === hashHex;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}
