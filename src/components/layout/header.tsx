import { useState } from 'react';
import { LogOutIcon, MenuIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/features/auth/hooks';
import { getErrorMessage, getInitials } from '@/lib/utils';

import { Breadcrumb } from './breadcrumb';
import { Sidebar } from './sidebar';

/** Thanh trên cùng: mở sidebar trên mobile, breadcrumb, đổi theme, menu người dùng. */
export function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Mở menu">
            <MenuIcon className="size-5" aria-hidden />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Điều hướng</SheetTitle>
          <Sidebar onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1">
        <Breadcrumb />
      </div>

      <ThemeToggle />
      <UserMenu />
    </header>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
    >
      {isDark ? (
        <SunIcon className="size-4" aria-hidden />
      ) : (
        <MoonIcon className="size-4" aria-hidden />
      )}
    </Button>
  );
}

function UserMenu() {
  const { user, profile, logout, isLoggingOut } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.full_name ?? user?.email ?? 'Người dùng';
  const roleLabel = profile?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên';

  async function onLogout() {
    try {
      await logout();
      void navigate('/dang-nhap', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Menu người dùng">
          <Avatar className="size-7">
            <AvatarFallback className="text-xs">{getInitials(displayName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="space-y-0.5">
          <p className="truncate text-sm font-medium">{displayName}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">
            {user?.email} · {roleLabel}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} disabled={isLoggingOut} variant="destructive">
          <LogOutIcon className="size-4" aria-hidden />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
