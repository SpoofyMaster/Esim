import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/** AES-256-GCM for eSIM activation material at rest. Key: 32 bytes, base64 in ESIM_ENC_KEY. */
export function makeSealer(keyB64: string) {
  const key = Buffer.from(keyB64, "base64");
  if (key.length !== 32) throw new Error("ESIM_ENC_KEY must be 32 bytes (base64)");
  return {
    seal(plain: string) {
      const iv = randomBytes(12);
      const c = createCipheriv("aes-256-gcm", key, iv);
      const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
      return ["v1", iv.toString("base64"), c.getAuthTag().toString("base64"), enc.toString("base64")].join(".");
    },
    open(sealed: string) {
      const [v, iv, tag, enc] = sealed.split(".");
      if (v !== "v1" || !iv || !tag || !enc) throw new Error("bad sealed value");
      const d = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64"));
      d.setAuthTag(Buffer.from(tag, "base64"));
      return Buffer.concat([d.update(Buffer.from(enc, "base64")), d.final()]).toString("utf8");
    },
  };
}
export type Sealer = ReturnType<typeof makeSealer>;

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
export const token = (bytes = 24) => randomBytes(bytes).toString("base64url");

export function hmac(secret: string, body: string) { return createHmac("sha256", secret).update(body).digest("hex"); }
export function verifyHmac(secret: string, body: string, signature: string | undefined) {
  if (!signature) return false;
  const a = Buffer.from(hmac(secret, body)), b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
