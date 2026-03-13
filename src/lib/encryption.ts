// Magic bytes to verify correct password on decryption
const MAGIC = new Uint8Array([0x53, 0x45, 0x43, 0x55]); // "SECU"
const HASH_LEN = 32;

function hashPassword(password: string): Uint8Array {
  const encoder = new TextEncoder();
  const passBytes = encoder.encode(password);
  const hash = new Uint8Array(HASH_LEN);
  for (let i = 0; i < HASH_LEN; i++) {
    hash[i] = passBytes[i % passBytes.length] ^ ((i * 31 + 17) & 0xff);
  }
  return hash;
}

// XOR-based encryption with password — prepends magic + password hash for verification
export function xorEncrypt(data: Uint8Array, password: string): Uint8Array {
  const key = new TextEncoder().encode(password);
  const hash = hashPassword(password);
  // Layout: [MAGIC (4)] [HASH (32)] [encrypted data]
  const result = new Uint8Array(MAGIC.length + HASH_LEN + data.length);
  result.set(MAGIC, 0);
  result.set(hash, MAGIC.length);
  for (let i = 0; i < data.length; i++) {
    result[MAGIC.length + HASH_LEN + i] = data[i] ^ key[i % key.length];
  }
  return result;
}

export function xorDecrypt(data: Uint8Array, password: string): Uint8Array {
  // Verify magic bytes
  for (let i = 0; i < MAGIC.length; i++) {
    if (data[i] !== MAGIC[i]) throw new Error('Not a valid encrypted file');
  }
  // Verify password hash
  const storedHash = data.slice(MAGIC.length, MAGIC.length + HASH_LEN);
  const expectedHash = hashPassword(password);
  for (let i = 0; i < HASH_LEN; i++) {
    if (storedHash[i] !== expectedHash[i]) throw new Error('Incorrect password');
  }
  // Decrypt payload
  const key = new TextEncoder().encode(password);
  const payload = data.slice(MAGIC.length + HASH_LEN);
  const result = new Uint8Array(payload.length);
  for (let i = 0; i < payload.length; i++) {
    result[i] = payload[i] ^ key[i % key.length];
  }
  return result;
}

export function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
