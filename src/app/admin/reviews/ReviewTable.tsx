'use client'
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { GenericTable } from "@/shared/GenericTable"
import { useRouter } from "next/navigation";
import { Review } from '@/types/review';


interface Props {
    data: Review[]    
  }

export function ReviewTable({ data}: Props) {

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    const toggleSelect = (_id: string) => {
        setSelectedIds(prev => {
          const newSet = new Set(prev)
          if (newSet.has(_id)) newSet.delete(_id)
          else newSet.add(_id)
          return newSet
        })
      }    
      const toggleSelectAll = () => {
        if (selectedIds.size === data.length) setSelectedIds(new Set())
        else setSelectedIds(new Set(data.map(d => d._id)))
      }

    const columns = useMemo<ColumnDef<Review>[]>(() => [
        {
          id: 'select',
          header: () => (
            <input
              type="checkbox"
              checked={selectedIds.size === data.length && data.length > 0}
              onChange={toggleSelectAll}
            />
          ),
          cell: ({ row }) => (
            <input
              type="checkbox"
              checked={selectedIds.has(row.original._id)}
              onChange={() => toggleSelect(row.original._id)}
            />
          ),
        },
        {
            header: 'Tên Tác giả',
            accessorKey: 'username',
            cell: ({row}) => {
                const post = row.original;
                return (
                    <div className="flex gap-2 mr-6">
                        <img src={post.userId.avatar} alt="" className='h-6 w-6 object-cover rounded-full'/>
                        <div className="flex flex-col">
                          <h2 className='clamp-1'>{post.userId.name}</h2>
                          {/* <h4>{post.badge}</h4> Removed as badge is not in Review type */}
                        </div>
                    </div>
                )
            },
        },
        {
          header: 'Địa điểm',
          accessorKey: 'destinationId',
          cell: ({ getValue }) => {
              const value = getValue() as string;
              return <span className='clamp-1'>{value}</span>;
            }
        },
        {
            header: 'Nội dung',
            accessorKey: 'comment',
            cell: ({ getValue }) => {
                const value = getValue() as string;
                return <span className='clamp-1'>{value}</span>;
              }
          },
      
        {
          header: 'Trạng thái',
          accessorKey: 'status01',
          cell: ({ getValue }) => {
            type Status = "approved" | "deleted";
            const value = getValue() as Status;
            const statusMap: Record<
              Status,
              { label: string; className: string }
            > = {
              approved: {
                label: "Đã duyệt",
                className: "px-2 py-1 bg-[#E7F4EE] text-[#0D894F] rounded-xl font-bold"
              },
              deleted: {
                label: "Đã xoá",
                className: "px-2 py-1 bg-[#F0F1F3] text-[#667085] rounded-xl font-bold"
              },  
            };

            const status = statusMap[value] ?? {
              label: "Không xác định",
              className: "px-2 py-1 bg-gray-200 text-gray-600 rounded-xl font-bold"
            };

            return <span className={status.className}>{status.label}</span>;
          },
        },
        {
          header: 'Ngày đăng',
          accessorKey: 'createdAt',
          cell: ({ getValue }) => {
            const date = new Date(getValue() as string)
            return <span className='text-[#667085]'>{date.toLocaleDateString('vi-VN')}</span>
          },
        },  
        {
          header: "Action",
          accessorKey: 'action',
          cell: () => {
            return (
              <div className="flex gap-2">
                <button className="text-[#667085]"><i className="ri-eye-line"></i></button>
                <button className="text-[#667085]"><i className="ri-pencil-line"></i></button>
                <button className="text-[#667085]"><i className="ri-delete-bin-6-line"></i></button>
              </div>
            );
          },
        },
        ], [selectedIds, data])

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