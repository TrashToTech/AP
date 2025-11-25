import Image from 'next/image';

export default function LoginSplitPage() {
    return (
        <main className="min-h-screen flex bg-gray-50">
            {/* 왼쪽: 로그인 섹션 */}
            <section className="flex-1 flex items-center justify-center bg-white">
                <div className="w-full max-w-md px-4 py-10">
                    <div className="text-3xl mb-7"><strong>T T T</strong> 👋</div>
                    <p className="text-gray-700 mb-9">
                        Today is a new day. It's your day. You shape it.<br />
                        Sign in to start managing your projects.
                    </p>
                    <form className="w-full">
                        <label className="block text-sm mb-1 font-medium">Email</label>
                        <input
                            type="email"
                            placeholder="Example@email.com"
                            className="w-full border rounded-lg bg-blue-50 px-4 py-2 mb-4 text-gray-700 focus:outline-none focus:ring"
                        />
                        <label className="block text-sm mb-1 font-medium">Password</label>
                        <input
                            type="password"
                            placeholder="at least 8 characters"
                            className="w-full border rounded-lg bg-blue-50 px-4 py-2 mb-4 text-gray-700 focus:outline-none focus:ring"
                        />
                        <div className="flex justify-end mb-4">
                            <a href="#" className="text-xs text-blue-600 hover:underline">Forgot Password?</a>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold text-base"
                        >
                            Sign in
                        </button>
                    </form>
                    <div className="flex items-center my-10 w-full">
                        <hr className="flex-grow border-gray-200" />
                        <span className="mx-2 text-gray-400 text-sm">Or</span>
                        <hr className="flex-grow border-gray-200" />
                    </div>
                    <div className="w-full space-y-3">
                        <button className="w-full flex items-center justify-center gap-3 bg-cyan-50 rounded-lg py-2 hover:bg-gray-200 text-gray-700 font-semibold">
                            <img src="/google.svg" alt="Google" className="w-6 h-6" />
                            Sign in with Google
                        </button>
                    </div>
                    <p className="mt-8 text-center text-sm text-gray-600">
                        Don't you have an account? <a href="#" className="text-blue-600 hover:underline">Sign up</a>
                    </p>
                </div>
            </section>

            {/* 오른쪽: 이미지 섹션 */}
            <section className="flex-1 relative hidden md:block">
                <Image
                    src="/universal.jpg" // public 폴더에 이미지 저장
                    alt="Login Visual"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-none"
                    priority
                />
            </section>
        </main>
    );
}
