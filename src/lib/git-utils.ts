// src/lib/git-utils.ts
// 페이지 저장 후 git add → commit → push 자동 수행 유틸 (서버 전용)
// GIT_AUTO_COMMIT=false(기본)이면 즉시 종료 — 로컬 개발 환경에서 git 호출 없음

import { execFile as execFileCb } from 'child_process';
import { promisify } from 'util';

import { GIT_AUTO_COMMIT, GIT_BRANCH, GIT_USER_EMAIL, GIT_USER_NAME } from '@/lib/env';

const execFile = promisify(execFileCb);

/** git CLI를 실행하고 stdout을 반환하는 내부 헬퍼 */
async function runGit(args: string[], cwd: string): Promise<string> {
    const { stdout } = await execFile('git', args, {
        cwd,
        env: {
            ...process.env,
            GIT_AUTHOR_NAME: GIT_USER_NAME,
            GIT_AUTHOR_EMAIL: GIT_USER_EMAIL,
            GIT_COMMITTER_NAME: GIT_USER_NAME,
            GIT_COMMITTER_EMAIL: GIT_USER_EMAIL,
        },
    });
    return stdout.trim();
}

// 허용 경로 패턴: public/uploads/pages/ 하위 파일만 허용
// pageId는 isValidBankId(/^[a-z0-9-]{1,64}$/)를 통과한 값이지만 이중 방어
const ALLOWED_PATH_RE = /^public\/uploads\/pages\/[a-z0-9/_-]+\.(html|jpg)$/;

interface GitCommitOptions {
    /** git add 대상 경로 배열 (CWD 기준 상대경로) */
    filePaths: string[];
    /** 커밋 메시지에 포함할 pageId */
    pageId: string;
    /** 커밋 메시지에 포함할 저장자 userId */
    userId: string;
}

/**
 * 지정된 파일을 git add → commit → push 한다.
 * GIT_AUTO_COMMIT이 'true'가 아니면 아무 작업도 하지 않는다.
 * 스테이징 변경이 없으면 커밋을 건너뛴다.
 */
export async function commitAndPushPage({ filePaths, pageId, userId }: GitCommitOptions): Promise<void> {
    if (GIT_AUTO_COMMIT !== 'true') return;

    // 허용된 경로 패턴만 통과 — 경로 조작 방지
    const safePaths = filePaths.filter((p) => ALLOWED_PATH_RE.test(p));
    if (safePaths.length === 0) return;

    const cwd = process.cwd();

    // 스테이징
    await runGit(['add', ...safePaths], cwd);

    // 변경 없으면 커밋 불필요 (exit 0 = 변경 없음)
    try {
        await runGit(['diff', '--cached', '--quiet'], cwd);
        // exit 0 → 스테이징 변경 없음 → 커밋 불필요
        return;
    } catch {
        // exit 1 → 스테이징 변경 있음 → 커밋 진행
    }

    const message = `[CMS] 페이지 저장: pageId=${pageId}, userId=${userId}`;
    await runGit(['commit', '-m', message], cwd);
    // remote(origin)와 branch를 명시하여 환경별 push.default 설정에 무관하게 동작
    await runGit(['push', 'origin', GIT_BRANCH], cwd);
}
