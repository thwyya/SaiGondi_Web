'use client'
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo } from 'react'
import Link from 'next/link'
import { GenericTable } from "@/shared/GenericTable"

interface Blog {
  title: string
  mainImage?: string
  viewCount?: number
  createdAt?: string
  slug: string
}

interface Props {
  data: Blog[]
}

export function PostTable({ data }: Props) {
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
  ], [])

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
