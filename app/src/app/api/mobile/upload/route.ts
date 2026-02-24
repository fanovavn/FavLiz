import { NextRequest } from "next/server";
import { getMobileUserId, corsResponse, corsError, handleCors } from "../helpers";
import sharp from "sharp";
import { createServerClient } from "@supabase/ssr";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const WEBP_QUALITY = 80;

async function compressImage(buffer: Buffer, mimeType: string) {
    try {
        let pipeline = sharp(buffer, { failOn: 'none' });
        const metadata = await pipeline.metadata();

        if (metadata.width && metadata.height) {
            if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
                pipeline = pipeline.resize(MAX_WIDTH, MAX_HEIGHT, {
                    fit: "inside",
                    withoutEnlargement: true,
                });
            }
        }

        if (mimeType === "image/gif") {
            const data = await pipeline.gif().toBuffer();
            return { data, contentType: "image/gif", ext: "gif" };
        }

        const data = await pipeline
            .webp({ quality: WEBP_QUALITY, effort: 4 })
            .toBuffer();

        return { data, contentType: "image/webp", ext: "webp" };
    } catch (err) {
        console.warn("[mobile/upload] Compression failed, using original:", (err as Error).message);
        const ext = mimeType === "image/png" ? "png" : mimeType === "image/gif" ? "gif" : "jpg";
        return { data: buffer, contentType: mimeType, ext };
    }
}

export async function OPTIONS() {
    return handleCors();
}

export async function POST(request: NextRequest) {
    const { userId, error: authError } = await getMobileUserId(request);
    if (!userId) return corsError(authError || "Unauthorized", 401);

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return corsError("No file provided", 400);
        }

        console.log("[mobile/upload] File:", file.name, file.type, file.size);

        if (!ALLOWED_TYPES.includes(file.type)) {
            return corsError("Định dạng không hợp lệ. Chỉ chấp nhận JPEG, PNG, WebP, GIF.", 400);
        }

        if (file.size > MAX_FILE_SIZE) {
            return corsError("File quá lớn. Tối đa 10MB.", 400);
        }

        const arrayBuffer = await file.arrayBuffer();
        const rawBuffer = Buffer.from(arrayBuffer);

        const { data: compressedBuffer, contentType, ext } = await compressImage(rawBuffer, file.type);
        console.log(`[mobile/upload] ${Math.round(rawBuffer.length / 1024)}KB → ${Math.round(compressedBuffer.length / 1024)}KB`);

        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        // Use user's token for supabase storage
        const authHeader = request.headers.get("Authorization") || "";
        const token = authHeader.replace("Bearer ", "");
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: { headers: { Authorization: `Bearer ${token}` } },
                cookies: { getAll() { return []; }, setAll() { } },
            }
        );

        const { data, error } = await supabase.storage
            .from("thumbnails")
            .upload(fileName, compressedBuffer, {
                cacheControl: "3600",
                upsert: false,
                contentType,
            });

        if (error) {
            console.error("[mobile/upload] Supabase error:", JSON.stringify(error));
            return corsError("Upload thất bại: " + error.message, 500);
        }

        const { data: { publicUrl } } = supabase.storage
            .from("thumbnails")
            .getPublicUrl(data.path);

        console.log("[mobile/upload] Success:", publicUrl);
        return corsResponse({ url: publicUrl });
    } catch (err) {
        console.error("[mobile/upload] Error:", err);
        return corsError("Có lỗi xảy ra khi upload: " + (err as Error).message, 500);
    }
}
