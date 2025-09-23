'use client'
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo } from 'react'
import Link from 'next/link'
import { GenericTable } from "@/shared/GenericTable"
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/auth/authApi'

interface Blog {
  _id: string
  title: string
  mainImage?: string
  viewCount?: number
  createdAt?: string
  slug: string
}

interface Props {
  data: Blog[]
  onDelete?: (id: string) => void
}

export function PostTable({ data, onDelete }: Props) {
  const router = useRouter()

  const columns = useMemo<ColumnDef<Blog>[]>(() => [
    {
      header: 'Bài đăng',
      accessorKey: 'title',
      cell: ({ row }) => {
        const post = row.original
        return (
          <Link href={`/user/blog/${post.slug}`} className="flex gap-3 items-center hover:text-blue-600">
            <img
              src={post.mainImage || '/images/default-cover.jpg'}
              alt={post.title}
              className="h-10 w-10 object-cover rounded-md shadow"
            />
            <h2 className="font-medium">{post.title}</h2>
          </Link>
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
      header: 'Action',
      id: 'actions',
      cell: ({ row }) => {
        const post = row.original
        return (
          <div className="flex gap-3 text-gray-600">
            <Link href={`/user/blog/${post.slug}`} title="Xem">
              <i className="ri-eye-line hover:text-blue-500 cursor-pointer"></i>
            </Link>

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
    }
  ], [router, onDelete])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="[&>div]:!border-0 [&>div]:!shadow-none [&>div]:!rounded-none">
      <GenericTable data={data} columns={columns} />
    </div>
  )
}
