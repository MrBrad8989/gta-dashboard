"use client";

import { signIn } from "next-auth/react";
import { FaDiscord } from "react-icons/fa";

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn("discord")}
      className="group w-full max-w-md mx-auto inline-flex items-center justify-center gap-3 sm:gap-4 bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:from-[#4752C4] hover:to-[#3c45a5] text-white px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 rounded-2xl sm:rounded-3xl text-lg sm:text-xl md:text-2xl font-bold transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 hover:scale-105 active:scale-95"
    >
      <FaDiscord className="text-3xl sm:text-4xl md:text-5xl group-hover:rotate-12 transition-transform duration-300 flex-shrink-0" />
      <span className="whitespace-nowrap">Conectar con Discord</span>
    </button>
  );
}
