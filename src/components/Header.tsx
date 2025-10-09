'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaChevronDown } from 'react-icons/fa6';
import Button from '@/components/ui/Button';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import useUser from '@/hooks/useUser'; 
import AccountSetting from '@/app/user/profile/AccountSetting';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector((state: any) => state.auth);

  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);

  // Derive state from the hook
  const isLoggedIn = !isLoading && isAuthenticated;
  const firstName = useMemo(() => {
    if (!user?.fullName) return '';
    return user.fullName.trim().split(' ')[0] || '';
  }, [user?.fullName]);
  const avatarUrl = user?.avatar || '/Image.svg';

  const handleLogout = () => {
    dispatch(logout());
    router.push('/auth/login');
  };

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const navItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Bài viết', href: '/user/blog' },
    { label: 'Địa điểm', href: '/user/destination' },
    { label: 'Hành trình', href: '/user/map' },
  ];

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/' || pathname === '/user/home'
      : pathname === href;

  return (
    <header className="bg-[var(--background)]/90 shadow-sm relative w-full z-50">
      <div className="w-full max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-14 py-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/Logo.svg" alt="Logo" width={150} height={100} />
        </Link>
        <nav className="hidden md:flex flex-1 justify-center space-x-6 text-base">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition text-[var(--primary)] ${
                isActive(item.href) ? 'font-bold' : 'font-medium'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 ml-auto">
          {!isLoggedIn && !isLoading && (
            <div className="hidden md:block">
              <Link href="/auth/login">
                <Button variant="outline-primary">Đăng nhập / Đăng ký</Button>
              </Link>
            </div>
          )}

          {isLoggedIn && (
            <>
              <Link href="/user/post-blog" className="hidden md:block">
                <Button
                  variant="primary"
                  className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 h-fit rounded-none"
                >
                  Đăng bài
                </Button>
              </Link>

              <div
                className="relative hidden md:flex items-center gap-2 cursor-pointer"
                ref={avatarRef}
                onClick={() => setAvatarOpen((v) => !v)}
              >
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  width={30}
                  height={30}
                  className="rounded-xl object-cover"
                />
                <span className="text-[var(--foreground)] font-inter">{firstName}</span>
                <FaChevronDown className="text-gray-500" size={14} />
                {avatarOpen && (
                  <div className="absolute right-0 top-[110%] w-44 bg-white rounded-xl shadow-lg py-1 border border-gray-100">
                    <Link
                      href="/user/profile"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAvatarOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-m text-[var(--primary)] hover:bg-gray-50 rounded-xl"
                    >
                      Trang cá nhân
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAccountModal(true);
                        setAvatarOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-m text-[var(--primary)] hover:bg-gray-50 rounded-xl"
                    >
                      Cài đặt tài khoản
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogout();
                        setAvatarOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-m text-[var(--primary)] hover:bg-gray-50 rounded-xl"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="relative md:hidden" ref={mobileMenuRef}>
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Mở menu"
              className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-full"
            >
              <HiOutlineDotsHorizontal size={20} className="text-gray-600" />
            </button>

            {mobileMenuOpen && (
              <div className="fixed top-[68px] left-0 w-full bg-white border-t border-gray-200 shadow-lg z-50">
                <div className="flex flex-col py-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 hover:bg-gray-100 ${
                        isActive(item.href)
                          ? 'text-[var(--primary)] font-semibold'
                          : 'text-[var(--primary)]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {isLoggedIn && (
                    <Link
                      href="/user/post-blog"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 hover:bg-gray-100 text-[var(--primary)]"
                    >
                      Đăng bài
                    </Link>
                  )}

                  <div className="border-t border-gray-200 my-2" />

                            {!isLoggedIn && !isLoading ? (
                              <Link
                                href="/auth/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-4 py-3"
                              >
                                <Button variant="outline-primary" className="w-full">
                                  Đăng nhập / Đăng ký
                                </Button>
                              </Link>
                            ) : isLoggedIn && (                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-3 text-[var(--primary)] hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <AccountSetting
        open={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </header>
  );
}