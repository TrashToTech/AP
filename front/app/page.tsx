import Link from "next/link";
import SelectBox from "./components/SelectBox";
import DropdownMenu from "./components/DropdownMenu";

// pages/index.tsx
export default function Home() {
  return (
    <main className="bg-white min-h-screen font-sans">
      {/* Top Nav */}
      <nav className="flex justify-between items-center px-8 py-4 text-sm">
        <div className="flex gap-4 items-center">
          <DropdownMenu label="English" items={["English", "Korean", "Japanese"]} />
          <Link href={""} className="text-gray-500">Support</Link>
        </div>
        <div className="flex gap-8 font-bold text-lg items-center">
          <span className="text-blue-700">✦ TTT</span>
          <Link href={""} className="text-gray-700">요금제</Link>
          <Link href={""} className="text-gray-700">사용 가이드</Link>
          <Link href={""} className="text-gray-700">새로운 기능</Link>
        </div>
        <DropdownMenu label="About us" items={["About us", "Contact", "Careers"]} />
      </nav>

      {/* Main section */}
      <section className="flex flex-col items-center mt-16 mb-12">
        <div className="bg-blue-50 px-4 py-2 rounded-full text-blue-700 font-medium text-xs mb-6">
          ✦ AI가 문서를 이해하고, 발표 대본과 음성으로 전달합니다.
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-center">
          대본부터, 발표까지 한 번에 해결하세요!
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          발표 준비 시간을 절반으로 줄이는 AI 발표 도우미
        </p>
        <Link href={"/member/login"} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold text-base">
          무료로 시작하기
        </Link>
      </section>

      <section className="w-full flex justify-center">
        <div className="relative bg-blue-500 rounded-2xl w-[90vw] max-w-4xl h-72 flex items-center justify-center overflow-hidden">
          <svg className="absolute w-full h-full" viewBox="0 0 600 200" fill="none">
            <rect width="600" height="200" fill="#3B82F6" fillOpacity="0.3" />
            <circle cx="100" cy="60" r="45" fill="#60A5FA" fillOpacity="0.15" />
            <circle cx="450" cy="120" r="25" fill="#2563EB" fillOpacity="0.13" />
            <path d="M 0 40 H 600 M 0 80 H 600 M 0 120 H 600 M 0 160 H 600 M 150 0 V 200 M 300 0 V 200 M 450 0 V 200" stroke="#fff" strokeOpacity="0.08" />
          </svg>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/3">
            <div className="bg-white rounded-full px-6 py-3 shadow text-sm font-bold text-gray-700">
              실제 활용 영상 무한 반복 재생
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
