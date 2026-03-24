// src/app/api/health/route.ts

import { NextResponse } from 'next/server';
import { getConnection } from '@/db/connection';
import { errorResponse, getErrorMessage } from '@/lib/api-response';

export async function GET() {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute('SELECT 1 FROM DUAL');
        return NextResponse.json({ db: '연결 성공', result: result.rows });
    } catch (err: unknown) {
        return errorResponse(getErrorMessage(err));
    } finally {
        if (conn) await conn.close();
    }
}
