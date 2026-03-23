// src/app/api/assets/upload/route.ts
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

const UPLOAD_PATH = process.env.UPLOAD_PATH || 'public/uploads/';
const UPLOAD_URL = normalizeUploadUrl(process.env.UPLOAD_URL || "uploads/");
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const targetPath = formData.get('path') as string || '';

        if (!file) {
            return Response.json({ error: 'No file provided' }, { status: 400 });
        }

        // Security: prevent directory traversal
        if (targetPath.includes('..')) {
            return Response.json({ error: 'Invalid path' }, { status: 400 });
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return Response.json({ 
                error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` 
            }, { status: 400 });
        }

        // Sanitize filename
        const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        
        // Build full path
        const uploadDir = path.join(process.cwd(), UPLOAD_PATH, targetPath);
        const filePath = path.join(uploadDir, filename);

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Check if file already exists
        if (fs.existsSync(filePath)) {
            return Response.json({ 
                error: 'File already exists' 
            }, { status: 409 });
        }

        // Convert file to buffer and write
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        const urlPath = targetPath ? `${targetPath}/${filename}` : filename;
        
        return Response.json({ 
            success: true,
            file: {
                name: filename,
                url: `${UPLOAD_URL}${urlPath}`,
                size: file.size,
            }
        });
    } catch (error) {
        console.error('업로드 오류:', error);
        return Response.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}

function normalizeUploadUrl(url: string): string {
    let safe = url.trim();

    // Case 1: Absolute URL (http/https)
    if (/^https?:\/\//i.test(safe)) {
        return safe.endsWith("/") ? safe : safe + "/";
    }

    // Case 2: Relative server path
    if (!safe.startsWith("/")) {
        safe = "/" + safe;
    }

    if (!safe.endsWith("/")) {
        safe += "/";
    }

    // Collapse duplicate slashes (but keep // in http://)
    safe = safe.replace(/([^:]\/)\/+/g, "$1");

    return safe;
}