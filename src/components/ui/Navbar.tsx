import Logo from "./Logo";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 md:px-16 py-2 bg-[#FAF8F5] border-b border-[#E6E2D8]">

      <Logo />

      <ul className="flex items-center gap-8 text-sm md:text-base font-medium text-[#381c24] tracking-[0.2px]">
        <li>
          <Link href="/" className="hover:text-[#B7A79A] transition">
            Home
          </Link>
        </li>
        <li>
          Plans
        </li>
        <li>
          Our Story
        </li>
        <li>
          FAQs
        </li>
        <Link href="/login" className="hover:text-[#B7A79A] transition">
          Login
        </Link>
      </ul>

    </nav>
  );
}