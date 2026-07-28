import { createClient as createBrowserSupabaseClient } from "@lib/supabase/client";

export interface StorageOptions {
  contentType?: string;
  cacheControl?: string;
  isPublic?: boolean;
}

export interface UploadResult {
  path: string;
  url: string;
  provider: "supabase" | "cloudflare_r2";
}

/**
 * StorageService Abstract Interface
 * Decouples application domain logic from underlying storage implementation (Supabase Storage vs Cloudflare R2).
 */
export interface StorageService {
  upload(
    bucket: string,
    path: string,
    file: File | Blob | Buffer | ArrayBuffer,
    options?: StorageOptions
  ): Promise<UploadResult>;

  download(bucket: string, path: string): Promise<Blob>;

  delete(bucket: string, paths: string[]): Promise<boolean>;

  getSignedUrl(
    bucket: string,
    path: string,
    expiresInSeconds?: number
  ): Promise<string>;
}

/**
 * Sanitizes object key paths to ensure compatibility with Supabase Storage and S3 rules.
 * Replaces non-ASCII characters, Spanish accents, quotes, spaces, and special symbols.
 */
export function sanitizeStoragePath(path: string): string {
  if (!path) return "";
  return path
    .split("/")
    .map((segment) => {
      const normalized = segment.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const safe = normalized.replace(/[^a-zA-Z0-9._-]/g, "_");
      return safe.replace(/_+/g, "_");
    })
    .join("/");
}

/**
 * Supabase Storage Implementation
 */
export class SupabaseStorageAdapter implements StorageService {
  private getClient() {
    return createBrowserSupabaseClient();
  }

  async upload(
    bucket: string,
    path: string,
    file: File | Blob | Buffer | ArrayBuffer,
    options?: StorageOptions
  ): Promise<UploadResult> {
    const supabase = this.getClient();
    const safePath = sanitizeStoragePath(path);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(safePath, file, {
        contentType: options?.contentType,
        cacheControl: options?.cacheControl || "3600",
        upsert: true,
      });

    if (error) {
      throw new Error(`[SupabaseStorageAdapter] Upload failed: ${error.message}`);
    }

    const publicUrlData = supabase.storage.from(bucket).getPublicUrl(data.path);

    return {
      path: data.path,
      url: publicUrlData.data.publicUrl,
      provider: "supabase",
    };
  }

  async download(bucket: string, path: string): Promise<Blob> {
    const supabase = this.getClient();
    const { data, error } = await supabase.storage.from(bucket).download(path);

    if (error || !data) {
      throw new Error(`[SupabaseStorageAdapter] Download failed: ${error?.message || "No data"}`);
    }

    return data;
  }

  async delete(bucket: string, paths: string[]): Promise<boolean> {
    const supabase = this.getClient();
    const { error } = await supabase.storage.from(bucket).remove(paths);

    if (error) {
      throw new Error(`[SupabaseStorageAdapter] Delete failed: ${error.message}`);
    }

    return true;
  }

  async getSignedUrl(
    bucket: string,
    path: string,
    expiresInSeconds = 3600
  ): Promise<string> {
    const supabase = this.getClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data) {
      throw new Error(`[SupabaseStorageAdapter] Signed URL failed: ${error?.message || "No data"}`);
    }

    return data.signedUrl;
  }
}

/**
 * Cloudflare R2 Storage Adapter (Prepared for future seamless migration)
 */
export class CloudflareR2StorageAdapter implements StorageService {
  async upload(
    _bucket: string,
    _path: string,
    _file: File | Blob | Buffer | ArrayBuffer,
    _options?: StorageOptions
  ): Promise<UploadResult> {
    throw new Error("[CloudflareR2StorageAdapter] R2 Storage is prepared for future Phase migration.");
  }

  async download(_bucket: string, _path: string): Promise<Blob> {
    throw new Error("[CloudflareR2StorageAdapter] R2 Storage is prepared for future Phase migration.");
  }

  async delete(_bucket: string, _paths: string[]): Promise<boolean> {
    throw new Error("[CloudflareR2StorageAdapter] R2 Storage is prepared for future Phase migration.");
  }

  async getSignedUrl(_bucket: string, _path: string, _expiresIn = 3600): Promise<string> {
    throw new Error("[CloudflareR2StorageAdapter] R2 Storage is prepared for future Phase migration.");
  }
}

/**
 * Storage Factory
 * Selects active storage adapter based on STORAGE_PROVIDER env var.
 */
export function getStorageService(): StorageService {
  const provider = process.env.STORAGE_PROVIDER || "supabase";

  if (provider === "cloudflare_r2") {
    return new CloudflareR2StorageAdapter();
  }

  return new SupabaseStorageAdapter();
}
