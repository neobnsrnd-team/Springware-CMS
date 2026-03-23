// src/app/api/manage/folders/route.ts
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPLOAD_PATH = process.env.UPLOAD_PATH || 'public/uploads/';
const UPLOAD_URL = normalizeUploadUrl(process.env.UPLOAD_URL || "uploads/");

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, path: relativePath = '' } = body;

        // Validation
        if (!name || typeof name !== 'string') {
            return Response.json({ error: 'Folder name is required' }, { status: 400 });
        }

        // Sanitize: remove leading/trailing whitespace
        const sanitizedName = name.trim();
        if (!sanitizedName) {
            return Response.json({ error: 'Folder name cannot be empty' }, { status: 400 });
        }

        // Block dangerous names
        if (sanitizedName.includes('/') || sanitizedName.includes('\\') || sanitizedName === '..' || sanitizedName === '.') {
            return Response.json({ error: 'Invalid folder name' }, { status: 400 });
        }

        // Security: prevent directory traversal in path
        if (relativePath.includes('..')) {
            return Response.json({ error: 'Invalid path' }, { status: 400 });
        }

        const absoluteBasePath = path.join(process.cwd(), UPLOAD_PATH);
        const absoluteFolderPath = path.join(absoluteBasePath, relativePath, sanitizedName);

        // Prevent creating outside uploads dir
        if (!absoluteFolderPath.startsWith(absoluteBasePath)) {
            return Response.json({ error: 'Invalid path' }, { status: 400 });
        }

        // Check if folder already exists
        if (fs.existsSync(absoluteFolderPath)) {
            return Response.json({ error: 'Folder already exists' }, { status: 409 });
        }

        // Create directory (recursive)
        fs.mkdirSync(absoluteFolderPath, { recursive: true });

        return Response.json({ 
            success: true, 
            folder: {
                name: sanitizedName,
                url: `${UPLOAD_URL}${relativePath ? `${relativePath}/${sanitizedName}` : sanitizedName}`,
                isDirectory: true,
                size: 0
            }
        });
    } catch (error) {
        console.error('폴더 생성 오류:', error);
        return Response.json({ error: 'Failed to create folder' }, { status: 500 });
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