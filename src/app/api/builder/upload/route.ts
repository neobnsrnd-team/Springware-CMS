// src/app/api/upload/route.ts

import path from "path";
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    // Demo only: saving uploaded files to the public folder.
    // In production, you would typically use a more robust storage solution:
    // - a dedicated directory outside the app managed by your server,
    // - or an S3-compatible storage service (e.g. Amazon S3, DigitalOcean Spaces).

    const uploadPath = process.env.UPLOAD_PATH;   // Physical path (e.g. "/public/uploads/")
    const uploadUrl = process.env.UPLOAD_URL;     // URL base (e.g. "/uploads/")

    if (!uploadPath || !uploadUrl) {
        return NextResponse.json(
            { ok: false, error: "UPLOAD_PATH or UPLOAD_URL is not defined." },
            { status: 500 }
        );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
        return NextResponse.json(
            { ok: false, error: "No files received." },
            { status: 400 }
        );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name.replaceAll(" ", "_");

    try {
        await writeFile(
            path.join(process.cwd(), uploadPath, filename),
            buffer
        );

        return NextResponse.json(
            { ok: true, url: path.join(uploadUrl, filename) },
            { status: 201 }
        );
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { ok: false, error: "Something went wrong while saving the file." },
            { status: 500 }
        );
    }
}
