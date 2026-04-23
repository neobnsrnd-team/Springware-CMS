import { contentBuilderErrorResponse } from '@/lib/api-response';

export async function POST() {
    return contentBuilderErrorResponse('이미지 업로드는 cms/files에서 승인된 이미지를 선택해 주세요.');
}
