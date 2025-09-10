'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next-intl/client';
import { useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const onSelectChange = (nextLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <Select value={locale} onValueChange={onSelectChange} disabled={isPending}>
      <SelectTrigger className="w-auto gap-2">
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline"><SelectValue /></span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="de">Deutsch</SelectItem>
      </SelectContent>
    </Select>
  );
}
