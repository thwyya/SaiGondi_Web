'use client';
import Link from 'next/link';
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { GenericTable } from '@/shared/GenericTable';
import { Category } from '@/types/category';

interface Props {
  data: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onSelectAll: () => void;
}

export function CategoryTable({ data, onEdit, onDelete, selectedIds, onSelect, onSelectAll }: Props) {

  const columns = useMemo<ColumnDef<Category>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={selectedIds.size === data.length && data.length > 0}
              onChange={onSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={selectedIds.has(row.original.id)}
              onChange={() => onSelect(row.original.id)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
          </div>
        ),
        size: 50,
      },
      {
        header: 'Danh mục',
        accessorKey: 'category',
        cell: ({ row }) => {
          const category = row.original;
          return (
            <div className="flex flex-col gap-1 py-2">
              <h2 className="font-semibold text-gray-900 text-sm">
                {category.name}
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                {category.description}
              </p>
            </div>
          );
        },
      },
      {
        header: () => <div className="text-center">Loại</div>,
        accessorKey: 'type',
        cell: ({ row }) => {
          const type = row.original.type;
          const isPlace = type === 'place';
          return (
            <div className="flex items-center justify-center">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isPlace
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
                  }`}
              >
                {isPlace ? 'Địa điểm' : 'Bài viết'}
              </span>
            </div>
          );
        },
      },
      {
        header: () => <div className="text-center">Số lượng</div>,
        accessorKey: 'quantity',
        cell: ({ row }) => {
          const category = row.original as any;
          let count = 0;

          if (category.type === 'place') {
            count = category.placeCount || 0;
          } else if (category.type === 'blog') {
            count = category.blogCount || 0;
          }

          return (
            <div className="flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-900">
                {count}
              </span>
            </div>
          );
        },
      },
      {
        header: () => <div className="text-center">Thao tác</div>,
        accessorKey: 'action',
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-center gap-1">
              <Link href={`/admin/categories/${row.original.id}`}>
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
                  title="Xem"
                >
                  <i className="ri-eye-line text-base"></i>
                </button>
              </Link>
              <button
                onClick={() => onEdit(row.original)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-green-600"
                title="Chỉnh sửa"
              >
                <i className="ri-pencil-line text-base"></i>
              </button>
              <button
                onClick={() => onDelete(row.original.id)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                title="Xóa"
              >
                <i className="ri-delete-bin-line text-base"></i>
              </button>
            </div>
          );
        },
      },
    ],
    [selectedIds, data, onEdit, onDelete, onSelect, onSelectAll]
  );

  return (
    <div className="bg-white rounded-lg shadow-sm  border-gray-200">
      <GenericTable data={data} columns={columns} />
    </div>
  );
}