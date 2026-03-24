// src/app/view/loading.tsx

export default function ViewLoading() {
    return (
        <div className="min-h-screen bg-[#dde1e7] pt-10 pb-20">
            <div className="is-container mx-auto flex min-h-[700px] w-full max-w-[390px] items-center justify-center bg-white p-0 shadow-[0_8px_48px_rgba(0,70,164,0.10)]">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
                    <p className="mt-4 text-gray-500">미리보기 로딩 중...</p>
                </div>
            </div>
        </div>
    );
}
