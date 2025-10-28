'use client'
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { GenericTable } from "@/shared/GenericTable"
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/auth/authApi'
import { blogApi } from '@/lib/blog/blogApi'
import BlogDetail from '@/app/user/profile/ProfileBlogDetail';

interface Blog {
  _id: string
  title: string
  mainImage?: string
  viewCount?: number
  createdAt?: string
  slug: string
  status: string
}

interface Props {
  data: Blog[]
  onDelete?: (id: string) => void
  showActions?: boolean
}

export function PostTable({ data, onDelete, showActions = true }: Props) {
  const router = useRouter()
  const [viewPendingBlog, setViewPendingBlog] = useState<Blog | null>(null);

  const columns = useMemo<ColumnDef<Blog>[]>(() => {
    const baseColumns: ColumnDef<Blog>[] = [
      {
        header: 'Bài đăng',
        accessorKey: 'title',
        cell: ({ row }) => {
          const post = row.original
          return (
            <span className="flex gap-3 items-center hover:text-blue-600">
              <img
                src={post.mainImage || '/images/default-cover.jpg'}
                alt={post.title}
                className="h-10 w-10 object-cover rounded-md shadow"
              />
              <h2 className="font-medium">{post.title}</h2>
            </span>
          )
        },
      },
      {
        header: 'Lượt tiếp cận',
        accessorKey: 'viewCount',
        cell: ({ getValue }) => {
          const value = getValue() as number
          return <span>{value ?? 0}</span>
        }
      },
      {
        header: 'Ngày đăng',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => {
          const date = getValue() as string
          return <span>{date ? new Date(date).toLocaleDateString('vi-VN') : ''}</span>
        }
      },
      {
        header: 'Trạng thái',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              value === 'pending' ? 'text-red-500 bg-red-50' : 'text-green-600 bg-green-50'
            }`}>
              {value === 'approved' ? 'Đã duyệt': 'Chưa duyệt'}
            </span>
          );
        },
      },
    ]

    if (showActions) {
      baseColumns.push({
        header: 'Action',
        id: 'actions',
        cell: ({ row }) => {
          const post = row.original
          return (
            <div className="flex gap-3 text-gray-600">
              <i
                className="ri-eye-line hover:text-blue-500 cursor-pointer"
                onClick={async() => {
                  if (post.status === "pending") {
                    try {
                      const fullBlog = await blogApi.getBlogByIdPending(post._id);
                      setViewPendingBlog(fullBlog);
                    } catch (error) {
                      console.error("Lỗi khi tải blog pending:", error);
                    }
                  } else if (post.status === "approved") {
                    try {
                      const fullBlog = await blogApi.getBlogById(post._id);
                      setViewPendingBlog(fullBlog);
                    } catch (error) {
                      console.error("Lỗi khi tải blog approved:", error);
                    }
                  } else {
                    console.warn("Trạng thái blog không hợp lệ:", post.status);
                  }
                   ///////               
                }}
              ></i>
              <i
                className="ri-pencil-line hover:text-green-500 cursor-pointer"
                title="Sửa"
                onClick={() => router.push(`/user/post-blog?id=${post._id}`)}
              ></i>

              <i
                className="ri-delete-bin-line hover:text-red-500 cursor-pointer"
                title="Xóa"
                onClick={async () => {
                  if (confirm("Bạn có chắc muốn xóa blog này?")) {
                    try {
                      await authApi.deleteBlog(post._id);
                      onDelete?.(post._id);
                    } catch (err) {
                      console.error("Lỗi xóa blog:", err);
                    }
                  }
                }}
              />
            </div>
          )
        }
      })
    }

    return baseColumns
  }, [router, onDelete, showActions])

  useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
    <div className="[&>div]:!border-0 [&>div]:!shadow-none [&>div]:!rounded-none">
      <GenericTable data={data} columns={columns} />
    </div>
    {viewPendingBlog && (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-auto">
      <div className="relative max-w-5xl mx-auto p-6 bg-white rounded-lg mt-12">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl font-bold"
          onClick={() => setViewPendingBlog(null)}
        >
          &times;
        </button>
        <div className="flex flex-col lg:flex-row gap-4 mt-6">
          <BlogDetail post={viewPendingBlog} />
        </div>
      </div>
    </div>
  )}
</>
  );
}
