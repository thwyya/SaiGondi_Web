import Link from 'next/link'
import React from 'react'

interface NavLink {
  display: string
  path: string
  icon: React.ReactNode
}

const navLinks: NavLink[] = [
  { display: 'Dashboard', path: '/admin/dashboard', icon: <i className="ri-pie-chart-line h-8 w-8 content-center pl-2"></i> },
  { display: 'Địa điểm', path: '/admin/destination', icon: <i className="ri-shopping-bag-4-line h-8 w-8 content-center  pl-2"></i> },
  { display: 'Danh mục', path: '/admin/categories', icon: <i className="ri-folder-6-line h-8 w-8 content-center  pl-2 "></i> },
  { display: 'Đánh giá', path: '/admin/reviews', icon: <i className="ri-chat-smile-ai-line h-8 w-8 content-center pl-2" /> },
  { display: 'Người dùng', path: '/admin/users', icon: <i className="ri-id-card-line h-8 w-8 content-center pl-2 "></i> },
  { display: 'Blog', path: '/admin/blog', icon: <i className="ri-news-line h-8 w-8 content-center pl-2"></i> },
]

const SideBar = () => {
  return (
    <div className="flex flex-col h-full px-4 py-6">
      <img src="/logo.svg" alt="Logo" className="w-[80%] mx-auto" />

      <nav className="mt-6 flex flex-col">
        {navLinks.map(({ display, path, icon }) => (
          <Link
            key={path}
            href={path}
            className="flex items-center gap-2 rounded-3xl px-3 py-2 text-sm lg:text-xl hover:bg-white/10 transition"
          >
            {icon}
            {display}
          </Link>
        ))}
      </nav>
    </div>
  )
}


export default SideBar
