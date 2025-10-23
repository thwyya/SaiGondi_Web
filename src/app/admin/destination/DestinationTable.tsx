'use client'
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState, useEffect } from 'react'
import { GenericTable } from "@/shared/GenericTable"
// import {Destination, destinations} from "../../assets/data/destinations";
import { Destination } from '@/types/destination';
import { getDestinationById, getReviewsByPlaceId } from '@/lib/place/destinationApi';
import DestinationPreviewModal from './DestinationPreviewModal';
import { deleteDestination } from '@/services/destinationService';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import EditDestinationForm from './EditDestinationForm';


interface Props {
  data: Destination[]
  onDeleteSuccess?: (deletedId: string) => void
  onUpdateSuccess?: (updated: Destination) => void
}


export function DestinationTable({ data, onDeleteSuccess, onUpdateSuccess }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  // Modal / preview state
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedPreviewId, setSelectedPreviewId] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [destination, setDestination] = useState<any | null>(null)
  const [id, setId] = useState<string>('')
  // keep local rows so we can update table optimistically without requiring parent refresh
  const [rows, setRows] = useState<Destination[]>(data)

  useEffect(() => {
    setRows(data)
  }, [data])

  const handleClickDelete = async (id: string) => {
    try {
      setIsDeleting(true)
      await deleteDestination(id)
      toast.success("Xoá địa điểm thành công")
      setSelectedIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
      onDeleteSuccess?.(id)
    } catch (err) {
      console.error('Failed to delete destination', err)
      toast.error('Xoá địa điểm thất bại')
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === rows.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(rows.map(d => d.id)))
  }


  const columns = useMemo<ColumnDef<Destination>[]>(() => [
    {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          checked={selectedIds.size === rows.length && rows.length > 0}
          onChange={toggleSelectAll}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.original.id)}
          onChange={() => toggleSelect(row.original.id)}
        />
      ),
    },
    {
      header: 'Địa điểm',
      accessorKey: 'name',
      cell: ({ row }) => {
        const destination = row.original;
        return (
          <div className="flex gap-3">
            {/* <img src={destination.images} alt="" className='h-10 w-10 object-cover rounded-md'/> */}
            <h2 className='clamp-1'>{destination.name}</h2>
          </div>
        )
      },
    },
    {
      header: 'Danh mục',
      accessorKey: 'categories',
      cell: ({ getValue }) => {
        const value = getValue() as any[] | undefined;
        if (!value || value.length === 0) return <span className='clamp-1'>—</span>;
        const names = value.map(v => typeof v === 'string' ? v : v?.name ?? '');
        return <span className='clamp-1'>{names.filter(Boolean).join(', ') || '—'}</span>;
      }
    },
    {
      header: 'Toạ độ',
      accessorKey: 'location',
      meta: { className: 'hidden sm:table-cell' },
      cell: ({ getValue }) => {
        const value = getValue() as { type: string; coordinates: number[] };
        const coordStr = `${value.coordinates[1].toFixed(4)}, ${value.coordinates[0].toFixed(4)}`; // lat, lng
        return <span className='clamp-1'>{coordStr}</span>;
      },
    },
    {
      header: 'Trạng thái',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        type Status = "approved" | "deleted" | "pending";
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
            className: "px-2 py-1 bg-[#FBF0DC] text-[#FFC968] rounded-xl font-bold"
          },
          pending: {
            label: "Chờ duyệt",
            className: "px-2 py-1 bg-[#E5E9F2] text-[#3B82F6] rounded-xl font-bold "
          }
        };

        const status = statusMap[value] ?? {
          label: "Không xác định",
          className: "px-2 py-1 bg-gray-200 text-gray-600 rounded-xl font-bold"
        };

        return <span className={status.className}>{status.label}</span>;
        // return <span className={value? "px-2 py-1 bg-[#E7F4EE] text-[#0D894F] rounded-xl font-bold":" px-2 py-1 bg-[#FBF0DC] text-[#FFC968] rounded-xl font-bold"}>{value? "Hoạt động": "Bị khoá"}</span> 
      },
    },
    {
      header: "",
      accessorKey: 'action',
      cell: ({ row }) => {
        const destination = row.original;
        return (
          <div className="flex gap-2">
            <button
              className="text-[#667085]"
              onClick={() => {
                setSelectedPreviewId(destination.id)
                setPreviewOpen(true)
              }}
            >
              <i className="hover:text-green-700 ri-eye-line"></i>
            </button>
            <button onClick={() => { setDestination(destination); setId(destination.id); setEditOpen(true) }} className="text-[#667085]"><i className="hover:text-blue-700 ri-pencil-line"></i></button>
            <button onClick={() => { setPendingDeleteId(destination.id); setDialogOpen(true); }} className="text-[#667085]"><i className="hover:text-red-700 ri-delete-bin-6-line"></i></button>
          </div>
        );
      },
    },
  ], [selectedIds, rows])

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })


  const confirmDelete = async () => {
    if (!pendingDeleteId) return
    await handleClickDelete(pendingDeleteId)
    setDialogOpen(false)
    setPendingDeleteId(null)
  }

  return (

    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <div className="[&>div]:!border-0 [&>div]:!shadow-none [&>div]:!rounded-none border border-gray-300 rounded-md shadow-sm">
        <GenericTable data={rows} columns={columns} />
      </div>

      {/* Edit dialog */}
      <AlertDialog open={editOpen} onOpenChange={(v: boolean) => { if (!v) setEditOpen(false) }}>
        <AlertDialogContent className="max-w-3xl w-full max-h-[90vh] overflow-auto bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center justify-between'>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Chỉnh sửa địa điểm</span>
                <i className="ri-pencil-line"></i>
              </div>
              <i
                className="ri-close-line cursor-pointer text-lg"
                onClick={() => setEditOpen(false)}
              ></i>
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="p-4">
            <EditDestinationForm id={id} initialValues={destination} onSaved={(updated) => {
              if (updated) {
                const updatedRecord = updated.data || updated.place || updated
                setDestination(updatedRecord)
                onUpdateSuccess?.(updatedRecord)
              }
              setEditOpen(false)
            }} />
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialogContent className='bg-white text-black'>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn xoá?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Vui lòng xác nhận để tiếp tục.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => { setDialogOpen(false); setPendingDeleteId(null); }}>Cancel</AlertDialogCancel>
          <AlertDialogAction>
            <button disabled={isDeleting} onClick={confirmDelete} className="px-3 py-1 text-white rounded-md">
              {isDeleting ? 'Đang xoá...' : 'Continue'}
            </button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
      {/* Preview Modal */}
      <DestinationPreviewModal
        id={selectedPreviewId ?? ''}
        open={previewOpen && !!selectedPreviewId}
        onClose={() => { setPreviewOpen(false); setSelectedPreviewId(null); }}
        onUpdateSuccess={(updatedRecord: any) => {
          const updatedId = updatedRecord?.id || updatedRecord?._id
          if (updatedId) {
            setRows(prev => prev.map(r => (r.id === updatedId || (r as any)._id === updatedId ? { ...r, ...updatedRecord } : r)))
          }
          onUpdateSuccess?.(updatedRecord)
        }}
      />
    </AlertDialog>

  )

}