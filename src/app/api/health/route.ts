import { NextResponse } from 'next/server';
import { 커넥션획득 } from '@/db/connection';

export async function GET() {
  let conn;
  try {
    conn = await 커넥션획득();
    const result = await conn.execute('SELECT 1 FROM DUAL');
    return NextResponse.json({ db: '연결 성공', result: result.rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return NextResponse.json({ db: '연결 실패', error: message }, { status: 500 });
  } finally {
    if (conn) await conn.close();
  }
}
