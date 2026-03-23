// src/app/api/assets/delete/route.ts
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { rm } from 'fs/promises';

const UPLOAD_PATH = process.env.UPLOAD_PATH || 'public/uploads/';

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { files } = body;

        if (!files || !Array.isArray(files) || files.length === 0) {
            return Response.json({ error: 'No files provided' }, { status: 400 });
        }

        // Security: prevent directory traversal
        for (const file of files) {
            if (file.includes('..')) {
                return Response.json({ error: 'Invalid file path' }, { status: 400 });
            }
        }

        let deletedCount = 0;
        let failedCount = 0;
        const errors: string[] = [];

        for (const file of files) {
            try {
                const absolutePath = path.join(process.cwd(), UPLOAD_PATH, file);

                // Check if file/directory exists
                if (!fs.existsSync(absolutePath)) {
                    errors.push(`${file}: Not found`);
                    failedCount++;
                    continue;
                }

                const stats = fs.statSync(absolutePath);

                // Delete file or directory
                if (stats.isDirectory()) {
                    // Delete directory recursively
                    await rm(absolutePath, { recursive: true, force: true });
                } else {
                    // Delete file
                    await rm(absolutePath);
                }

                deletedCount++;
            } catch (err) {
                console.error(`파일 삭제 실패 - ${file}:`, err);
                errors.push(`${file}: ${err instanceof Error ? err.message : 'Delete failed'}`);
                failedCount++;
            }
        }

        // Return results
        if (failedCount === 0) {
            return Response.json({
                success: true,
                deleted: deletedCount,
                message: `Successfully deleted ${deletedCount} item(s)`
            });
        } else if (deletedCount === 0) {
            return Response.json({
                error: 'Failed to delete all items',
                deleted: 0,
                failed: failedCount,
                errors
            }, { status: 500 });
        } else {
            return Response.json({
                success: true,
                deleted: deletedCount,
                failed: failedCount,
                message: `Deleted ${deletedCount} item(s), ${failedCount} failed`,
                errors
            });
        }
    } catch (error) {
        console.error('삭제 오류:', error);
        return Response.json({ error: 'Failed to delete files' }, { status: 500 });
    }
}