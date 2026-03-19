// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-gray-50 dark:bg-gray-900 text-center">
      <main className="flex flex-col gap-6 max-w-xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Springware CMS
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          금융권 특화 비주얼 웹 콘텐츠 빌더입니다.<br />
          드래그 앤 드롭으로 금융 모바일 앱 화면을 쉽고 빠르게 만들어 보세요.
        </p>

        <div className="flex justify-center mt-6">
          <Link
            href="/edit"
            className="inline-flex items-center justify-center rounded-xl bg-[#0046A4] text-white px-6 py-3 font-medium text-lg shadow-md hover:bg-[#003399] transition-colors"
          >
            에디터 시작
          </Link>
        </div>
      </main>

      <footer className="mt-12 text-sm text-gray-500 dark:text-gray-400">
        Powered by Springware &amp; ContentBuilder.js
      </footer>
    </div>
  );
}
