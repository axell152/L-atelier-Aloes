'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SectionSubNav({ title, items }) {
  const pathname = usePathname();
  return (
    <div className="max-w-5xl mx-auto px-4 mb-8 flex flex-wrap items-center gap-3">
      <span className="font-serif font-bold text-[#4A3B32] mr-2">{title}</span>
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`text-sm font-medium px-4 py-1.5 rounded-full border transition ${
              active
                ? 'bg-[#5A3E36] text-white border-[#5A3E36]'
                : 'bg-white text-[#4A3B32] border-[#EFECE6] hover:border-[#5A3E36]'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
