// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-gray-50 dark:bg-gray-900 text-center">
      <main className="flex flex-col gap-6 max-w-xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          ContentBuilder.js Demo
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          This is a demo of <strong>ContentBuilder.js</strong> — a visual editor for
          creating elegant, editorial-style web content with ease. You can try editing and saving your own content.
        </p>
        
        <div className="flex justify-center mt-6">
          <Link
            href="/edit"
            className="inline-flex items-center justify-center rounded-full bg-black text-white px-6 py-3 font-medium text-lg shadow-md hover:bg-gray-800 transition-colors"
          >
            Start Editing
          </Link>
        </div>
      </main>
      
      <footer className="mt-12 text-sm text-gray-500 dark:text-gray-400">
        Built with Next.js & ContentBuilder.js
      </footer>
    </div>
  );
}
