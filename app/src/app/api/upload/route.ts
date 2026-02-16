import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import sharp from "sharp";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (before compression)
const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];

// Compression settings
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const WEBP_QUALITY = 80;

async function compressImage(buffer: Buffer, mimeType: string): Promise<{ data: Buffer; contentType: string; ext: string }> {
    let pipeline = sharp(buffer);

    // Get metadata to check dimensions
    const metadata = await pipeline.metadata();

    // Resize if larger than max dimensions (maintain aspect ratio)
    if (metadata.width && metadata.height) {
        if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
            pipeline = pipeline.resize(MAX_WIDTH, MAX_HEIGHT, {
                fit: "inside",
                withoutEnlargement: true,
            });
        }
    }

    // GIFs: keep as-is to preserve animation (just resize if needed)
    if (mimeType === "image/gif") {
        const data = await pipeline.gif().toBuffer();
        return { data, contentType: "image/gif", ext: "gif" };
    }

    // Convert everything else to WebP for best compression
    const data = await pipeline
        .webp({ quality: WEBP_QUALITY, effort: 4 })
        .toBuffer();

    return { data, contentType: "image/webp", ext: "webp" };
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check auth
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                {
                    error: "Định dạng không hợp lệ. Chỉ chấp nhận JPEG, PNG, WebP, GIF.",
                },
                { status: 400 }
            );
        }

        // Validate size (before compression)
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File quá lớn. Tối đa 10MB." },
                { status: 400 }
            );
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const rawBuffer = Buffer.from(arrayBuffer);

        // Compress image
        const { data: compressedBuffer, contentType, ext } = await compressImage(rawBuffer, file.type);

        const originalKB = Math.round(rawBuffer.length / 1024);
        const compressedKB = Math.round(compressedBuffer.length / 1024);
        console.log(`Image compressed: ${originalKB}KB → ${compressedKB}KB (${Math.round((1 - compressedBuffer.length / rawBuffer.length) * 100)}% saved)`);

        // Generate unique filename (always .webp except GIF)
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        // Upload compressed image to Supabase Storage
        const { data, error } = await supabase.storage
            .from("thumbnails")
            .upload(fileName, compressedBuffer, {
                cacheControl: "3600",
                upsert: false,
                contentType,
            });

        if (error) {
            console.error("Upload error:", error);
            return NextResponse.json(
                { error: "Upload thất bại: " + error.message },
                { status: 500 }
            );
        }

        // Get public URL
        const {
            data: { publicUrl },
        } = supabase.storage.from("thumbnails").getPublicUrl(data.path);

        return NextResponse.json({ url: publicUrl });
    } catch (err) {
        console.error("Upload error:", err);
        return NextResponse.json(
            { error: "Có lỗi xảy ra khi upload." },
            { status: 500 }
        );
    }
}
