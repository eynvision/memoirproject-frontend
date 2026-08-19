import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/logo.jpeg"
      alt="Memoir Logo"
      width={150}
      height={25}
      priority
      className="h-22 w-auto object-contain"
    />
  );
}