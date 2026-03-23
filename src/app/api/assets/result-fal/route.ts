// src/app/api/assets/result-fal/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { fal } from "@fal-ai/client";
import axios from "axios";
// import { saveFileToS3 } from "@/features/site-assets";
import path from 'path';
import fs from "fs";

const FAL_API_KEY = process.env.FAL_API_KEY;

const uploadPath = process.env.UPLOAD_PATH || '';   // Physical path (e.g. "/public/uploads/")
const uploadUrl = process.env.UPLOAD_URL || '';     // URL base (e.g. "/uploads/")
const localSave = true;

interface CustomData {
    folderPath?: string;
    [key: string]: unknown; // allow additional fields
}

type OutputType =
  | { entries: { url: string; file_url: string }[] }
  | string
  | unknown; // covers result.data.output or other dynamic values

interface PostRequestBody {
    request_id: string;
    model: string;
    customData?: CustomData;
}

export async function POST(req: NextRequest) {

    const falApiKey = FAL_API_KEY;
    if (!falApiKey) return NextResponse.json({ error: 'FAL API 키를 찾을 수 없습니다.' }, { status: 403 });

    // Configure FAL client with the dynamic key
    fal.config({
        credentials: falApiKey
    });
    
    const { request_id, model, customData }: PostRequestBody = await req.json();

    const folderPath = customData?.folderPath ?? '';

    try {
        const result = await fal.queue.result(model, { 
            requestId: request_id,
            // logs: true
        });

        let output: OutputType;

        if (result.data.images) {
            const entries: { url: string; file_url: string }[] = [];

            for (const item of result.data.images) {
                const file_url = item.url;
                let extension: string;
                let filename: string;
                let new_file_url: string;

                if (file_url.includes("base64")) {
                    extension = item.content_type === "image/jpeg" ? "jpg" : "png";
                    filename = `${generateRandomFileName()}.${extension}`;

                    const imageData = file_url.split(",")[1];

                    if(localSave) {

                        const filePath = path.join(process.cwd(), uploadPath, folderPath, filename);
                        fs.writeFileSync(filePath, imageData);
                        new_file_url = uploadUrl + path.posix.join(folderPath, filename);

                    } else {

                        // do nothing for S3
                        // new_file_url = await saveFileToS3(folderPath, filename, imageData);
                        new_file_url = '';

                    }
                } else {
                    extension = getFileExtension(file_url);
                    filename = `${generateRandomFileName()}.${extension}`;

                    const response = await axios.get(file_url, { responseType: "arraybuffer" });

                    if(localSave) {

                        const fileData = Buffer.from(response.data);

                        const filePath = path.join(process.cwd(), uploadPath, folderPath, filename);
                        fs.writeFileSync(filePath, fileData);
                        new_file_url = uploadUrl + path.posix.join(folderPath, filename);
                        
                    } else {

                        // do nothing for S3
                        // new_file_url = await saveFileToS3(folderPath, filename, response.data);
                        new_file_url = '';

                    }
                }

                entries.push({
                    url: new_file_url,
                    file_url,
                });
            }

            output = { entries };

        } else if (result.data.image || result.data.audio || result.data.audio_file || result.data.video) {
            let file_url = "";
            if (result.data.image) file_url = result.data.image.url;
            // if (result.data.audio) file_url = result.data.audio.url;
            if (result.data.audio) {
                if (Array.isArray(result.data.audio)) {
                    file_url = result.data.audio[0].url; // take first item
                } else {
                    file_url = result.data.audio.url;
                }
            }
            if (result.data.audio_file) file_url = result.data.audio_file.url;
            if (result.data.video) file_url = result.data.video.url;

            let filename = file_url.split("/").pop() || "file";
            filename = shortName(filename);

            const response = await axios.get(file_url, { responseType: "arraybuffer" });

            let new_file_url: string;

            if(localSave) {

                const fileData = Buffer.from(response.data);

                const filePath = path.join(process.cwd(), uploadPath, folderPath, filename);
                fs.writeFileSync(filePath, fileData);
                new_file_url = uploadUrl + path.posix.join(folderPath, filename);
                
            } else {

                // do nothing for S3
                // new_file_url = await saveFileToS3(folderPath, filename, response.data);
                new_file_url = '';
            }

            const entries = [{ 
                url: new_file_url, 
                file_url 
            }];
            output = { entries };

        } else if (result.data.output) {
            output = result.data.output;
        } else {
            output = Object.values(result.data)[0] || "";
        }

        return NextResponse.json({ ok: true, data: output, result }, { status: 200 });

    } catch (err: unknown) {
        return NextResponse.json(
            { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
            { status: 500 }
        );
    }
}

function shortName(filename: string): string {
    const extension = filename.split(".").pop()?.toLowerCase() || "dat";
    const randomName = generateRandomFileName();
    return `${randomName}.${extension}`;
}

function getFileExtension(url: string): string {
    const pathname = new URL(url).pathname;
    return pathname.split(".").pop()?.toLowerCase() || "dat";
}

function generateRandomString(length: number): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () =>
        characters[Math.floor(Math.random() * characters.length)]
    ).join("");
}

function generateRandomFileName(s?: string): string {
    return s ? `${s}-${generateRandomString(5)}` : `ai-${generateRandomString(5)}`;
}

