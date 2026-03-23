// src/app/api/health/route.ts

import { NextResponse } from 'next/server';
import { getConnection } from '@/db/connection';

export async function GET() {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute('SELECT 1 FROM DUAL');
        console.log('test');
        return NextResponse.json({ db: '연결 성공', result: result.rows });
    } catch (error) {
        const message = error instanceof Error ? error.message : '알 수 없는 오류';
        return NextResponse.json({ db: '연결 실패', error: message }, { status: 500 });
    } finally {
        if (conn) await conn.close();
    }
}
