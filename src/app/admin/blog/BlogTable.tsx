'use client'
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState, useEffect } from 'react'
import { GenericTable } from "@/shared/GenericTable"
import { useRouter } from "next/navigation";
import { Blog } from '@/types/blog';

interface Props {
  data: Blog[]
  onDelete?: (ids: string[]) => void | Promise<void>
}

export function BlogTable({ data, onDelete }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setSelectedIds(new Set());
  }, [data]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(data.map(d => d._id)))
    }
  }

  const handleDelete = async () => {
    if (selectedIds.size === 0) return

    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa ${selectedIds.size} bài viết đã chọn?`
    )

    if (!confirmDelete) return

    setIsDeleting(true)
    try {
      if (onDelete) {
        await onDelete(Array.from(selectedIds))
      }
      setSelectedIds(new Set())
    } catch (error) {
      console.error('Lỗi khi xóa:', error)
      alert('Có lỗi xảy ra khi xóa bài viết')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = useMemo<ColumnDef<Blog>[]>(() => [
    {
      id: 'select',
      header: () => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={data.length > 0 && selectedIds.size === data.length}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedIds.has(row.original._id)}
            onChange={() => toggleSelect(row.original._id)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
        </div>
      ),
    },
    {
      header: 'Tác giả',
      accessorKey: 'authorId',
      cell: ({ row }) => {
        const post = row.original;
        return (
          <div className="flex items-center gap-3 py-2">
            <img
              src={post.authorId.avatar}
              alt={post.authorId.fullName}
              className='h-10 w-10 object-cover rounded-full border-2 border-gray-100 shadow-sm'
            />
            <div className="flex flex-col min-w-0">
              <h2 className='font-medium text-gray-900 clamp-1 text-sm'>{post.authorId.fullName}</h2>
              <p className='text-xs text-gray-500 clamp-1'>{post.authorId.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      header: 'Tiêu đề',
      accessorKey: 'title',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <div className="max-w-md py-2">
            <span className='text-sm text-gray-800 leading-relaxed line-clamp-3'>{value}</span>
          </div>
        );
      }
    },
    {
      header: 'Trạng thái',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        type Status = "approved" | "rejected" | "pending" | "deleted";
        const value = getValue() as Status;
        const statusMap: Record<
          Status,
          { label: string; className: string; icon: string }
        > = {
          approved: {
            label: "Đã duyệt",
            className: "px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-medium text-xs inline-flex items-center gap-1.5",
            icon: "ri-checkbox-circle-fill"
          },
          rejected: {
            label: "Đã từ chối",
            className: "px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-medium text-xs inline-flex items-center gap-1.5",
            icon: "ri-close-circle-fill"
          },
          pending: {
            label: "Chờ duyệt",
            className: "px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium text-xs inline-flex items-center gap-1.5",
            icon: "ri-time-fill"
          },
          deleted: {
            label: "Đã xóa",
            className: "px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg font-medium text-xs inline-flex items-center gap-1.5",
            icon: "ri-delete-bin-fill"
          }
        };

        const status = statusMap[value] ?? {
          label: "Không xác định",
          className: "px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg font-medium text-xs inline-flex items-center gap-1.5",
          icon: "ri-question-fill"
        };

        return (
          <span className={status.className}>
            <i className={status.icon}></i>
            {status.label}
          </span>
        );
      },
    },
    {
      header: 'Ngày đăng',
      accessorKey: 'createdAt',
      cell: ({ getValue }) => {
        const date = new Date(getValue() as string)
        return (
          <div className="flex flex-col">
            <span className='text-sm text-gray-700 font-medium'>
              {date.toLocaleDateString('vi-VN')}
            </span>
            <span className='text-xs text-gray-500'>
              {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )
      },
    },
    {
      header: "Thao tác",
      accessorKey: 'action',
      cell: ({ row }) => {
        const post = row.original
        return (
          <div className="flex items-center justify-center">
            <button
              onClick={() => router.push(`blog/${post._id}`)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="Xem chi tiết"
            >
              <i className="ri-eye-line text-lg"></i>
            </button>
          </div>
        );
      },
    },
  ], [selectedIds, data, router])

  return (
    <div className="space-y-4">
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-end gap-3 p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 font-medium">
              Đã chọn <span className="text-blue-600 font-bold">{selectedIds.size}</span> bài viết
            </div>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium text-sm inline-flex items-center gap-2 hover:bg-red-700 active:scale-95 disabled:bg-red-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <i className={`${isDeleting ? 'ri-loader-4-line animate-spin' : 'ri-delete-bin-line'} text-base`}></i>
              {isDeleting ? 'Đang xóa...' : 'Xóa đã chọn'}
            </button>
          </div>
        )}

      <div className="bg-white rounded-lg shadow-sm border-gray-200">
        <GenericTable data={data} columns={columns} />
      </div>

      {data.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-200">
          <i className="ri-inbox-line text-6xl text-gray-300 mb-3"></i>
          <p className="text-gray-600 font-semibold text-lg">Không có bài viết nào</p>
          <p className="text-gray-400 text-sm mt-1.5">
            Không có bài viết nào phù hợp với tiêu chí lọc.
          </p>
        </div>
      )}
    </div>
  )
}
