'use client'
import * as React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {TablePagination } from "@/shared/TablePagination"


interface GenericTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  initialPageSize?: number
}

export function GenericTable<T>({ data, columns, initialPageSize = 10 }: GenericTableProps<T>) {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: initialPageSize
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), 
  })

  return (
    <div className="rounded-md overflow-x-auto">
      <div className="min-w-[640px] md:min-w-full">
        <Table>
        <TableHeader className='border-1 border-gray-300 bg-gray-100'>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id} className={(header.column.columnDef as any).meta?.className}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className='border-1 border-gray-300'>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id} className='border-1 border-gray-300 hover:bg-gray-100'>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id} className={(cell.column.columnDef as any).meta?.className}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </div>

      <TablePagination table={table} />

    </div>
  )
}
