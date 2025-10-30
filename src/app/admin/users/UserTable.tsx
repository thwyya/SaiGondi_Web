"use client"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useEffect } from 'react'
import { GenericTable } from '@/shared/GenericTable'
import axiosInstance from '@/lib/axiosInstance'
import { User } from '@/types/user'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Props {
  data: User[]
  onDeleteSuccess?: (deletedId: string) => void
  selectedIds?: Set<string>
  onSelect?: (id: string) => void
  onSelectAll?: () => void
}

export function UserTable({ data, onDeleteSuccess, selectedIds: propSelectedIds, onSelect: propOnSelect, onSelectAll: propOnSelectAll }: Props) {
  const router = useRouter()

  const [localSelectedIds, setLocalSelectedIds] = useState<Set<string>>(new Set())
  const selectedIds = propSelectedIds ?? localSelectedIds
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [rows, setRows] = useState<any[]>(data)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [pendingEditUser, setPendingEditUser] = useState<any | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  
  useEffect(() => {
    setRows(data)
  }, [data])

  const handleClickDelete = async (id: string) => {
    try {
      setIsDeleting(true)
      await axiosInstance.delete(`/admin/users/${id}`)
      toast.success('Xoá người dùng thành công')
      setRows(prev => prev.filter(r => (r._id || r.id) !== id))
      if (!propSelectedIds) {
        setLocalSelectedIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }
      onDeleteSuccess?.(id)
    } catch (err) {
      console.error('Failed to delete user', err)
      toast.error('Xoá người dùng thất bại')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleSelect = (id: string) => {
    if (propOnSelect) {
      propOnSelect(id)
      return
    }
    setLocalSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const handleToggleSelectAll = () => {
    if (propOnSelectAll) {
      propOnSelectAll()
      return
    }
    if (selectedIds.size === rows.length) setLocalSelectedIds(new Set())
    else setLocalSelectedIds(new Set(rows.map(d => d._id || d.id)))
  }

  const confirmDelete = async () => {
    if (!pendingDeleteId) return
    await handleClickDelete(pendingDeleteId)
    setDialogOpen(false)
    setPendingDeleteId(null)
  }

  const handleToggleBan = async () => {
    if (!pendingEditUser) return
    const userId = pendingEditUser._id || pendingEditUser.id
    const currentBannedStatus = pendingEditUser.banned ?? pendingEditUser.isBanned ?? false
    
    try {
      setIsUpdating(true)
      await axiosInstance.patch(`/admin/users/${userId}`, {
        banned: !currentBannedStatus
      })
      
      toast.success(currentBannedStatus ? 'Mở khóa tài khoản thành công' : 'Khóa tài khoản thành công')
      
      setRows(prev => prev.map(r => {
        if ((r._id || r.id) === userId) {
          return { ...r, banned: !currentBannedStatus, isBanned: !currentBannedStatus }
        }
        return r
      }))
      
      setEditDialogOpen(false)
      setPendingEditUser(null)
    } catch (err) {
      console.error('Failed to update user', err)
      toast.error('Cập nhật trạng thái thất bại')
    } finally {
      setIsUpdating(false)
    }
  }

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          checked={selectedIds.size === rows.length && rows.length > 0}
          onChange={handleToggleSelectAll}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.original._id || row.original.id)}
          onChange={() => handleToggleSelect(row.original._id || row.original.id)}
        />
      ),
    },
    {
      header: 'Tên',
      accessorFn: row => row.username || `${row.firstName || ''} ${row.lastName || ''}`.trim(),
      cell: ({ row, getValue }) => {
        const user = row.original
        const displayName = getValue() as string
        return (
          <div className="flex gap-2 items-center">
            <img src={user?.avatar || 'https://i.pinimg.com/1200x/e1/1e/07/e11e07774f7fc24da8e03e769a0f0573.jpg'} alt="" className='h-6 w-6 object-cover rounded-full' />
            <h2 className='clamp-1'>{displayName || (user.firstName || '') + ' ' + (user.lastName || '')}</h2>
          </div>
        )
      },
    },
    {
      header: 'Email',
      accessorFn: row => row.email,
      cell: ({ getValue }) => {
        const value = getValue() as string
        return <span className='clamp-1'>{value}</span>
      }
    },
    {
      header: 'Số bài viết',
      accessorFn: row => row.totalBlogs ?? 0,
      cell: ({ getValue }) => <span>{getValue() as number}</span>
    },
    {
      header: 'Trạng thái',
      accessorFn: row => row.banned ?? row.isBanned ?? false,
      cell: ({ getValue }) => {
        const value = getValue() as boolean
        return <span className={!value ? "px-2 py-1 bg-[#E7F4EE] text-[#0D894F] rounded-xl font-bold" : " px-2 py-1 bg-[#FBF0DC] text-[#FFC968] rounded-xl font-bold"}>{!value ? "Hoạt động" : "Bị khoá"}</span>
      }
    },
    {
      header: 'Ngày tạo',
      accessorFn: row => row.createdAt,
      cell: ({ getValue }) => {
        const date = new Date(getValue() as string)
        return <span className='text-[#667085]'>{isNaN(date.getTime()) ? '-' : date.toLocaleDateString('vi-VN')}</span>
      }
    },
    {
      header: "",
      accessorKey: 'action',
      cell: ({ row }) => {
        const user = row.original
        const isBanned = user.banned ?? user.isBanned ?? false
        
        const handleViewUser = () => {
          if (isBanned) {
            toast.warning('Tài khoản này đã bị khóa')
            return
          }
          router.push(`/admin/users/${user._id || user.id}`)
        }
        
        return (
          <div className="flex gap-2">
            <button onClick={handleViewUser} className="text-[#667085]"><i className=" hover:text-green-700 ri-eye-line cursor-pointer"></i></button>
            <button onClick={() => { setPendingEditUser(user); setEditDialogOpen(true); }} className="text-[#667085]">
              {isBanned ? (
              <i className='ri-user-heart-line hover:text-blue-700 cursor-pointer'></i>
              ) : (
              <i className='ri-user-forbid-line hover:text-blue-700 cursor-pointer'></i>
              )}
              </button>
            <button onClick={() => { setPendingDeleteId(user._id || user.id); setDialogOpen(true); }} className="text-[#667085]"><i className="ri-delete-bin-6-line hover:text-red-700 cursor-pointer"></i></button>
          </div>
        )
      }
    }
  ], [selectedIds, rows, router])

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <div className="[&>div]:!border-0 [&>div]:!shadow-none [&>div]:!rounded-none border border-gray-300 rounded-md shadow-sm">
          <GenericTable data={rows} columns={columns} />
        </div>

        <AlertDialogContent className='bg-white text-black'>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xoá?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Vui lòng xác nhận để tiếp tục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setDialogOpen(false); setPendingDeleteId(null); }}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="px-3 py-1 text-white rounded-md">
              {isDeleting ? 'Đang xoá...' : 'Xác nhận'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent className='bg-white text-black'>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingEditUser?.banned || pendingEditUser?.isBanned ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn {pendingEditUser?.banned || pendingEditUser?.isBanned ? 'mở khóa' : 'khóa'} tài khoản{' '}
              <strong>{pendingEditUser?.username || pendingEditUser?.email}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setEditDialogOpen(false); setPendingEditUser(null); }}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleBan} disabled={isUpdating} className="px-3 py-1 text-white rounded-md">
              {isUpdating ? 'Đang cập nhật...' : 'Xác nhận'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
         