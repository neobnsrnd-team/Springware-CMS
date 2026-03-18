import oracledb from 'oracledb';

// Thin 모드 사용 (Oracle Client 설치 불필요)
oracledb.initOracleClient();

let 풀초기화완료 = false;

// 커넥션 풀 설정
async function 풀초기화(): Promise<void> {
  if (풀초기화완료) return;

  await oracledb.createPool({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE}`,
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1,
  });

  풀초기화완료 = true;
  console.log('Oracle 커넥션 풀 초기화 완료');
}

// 커넥션 획득 (최초 호출 시 풀 자동 초기화)
export async function 커넥션획득(): Promise<oracledb.Connection> {
  await 풀초기화();
  return await oracledb.getConnection();
}

// 커넥션 풀 종료
export async function 커넥션풀종료(): Promise<void> {
  if (!풀초기화완료) return;
  await oracledb.getPool().close(10);
  풀초기화완료 = false;
  console.log('Oracle 커넥션 풀 종료 완료');
}
