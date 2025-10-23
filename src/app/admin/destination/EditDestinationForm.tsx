"use client"

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Image from 'next/image'
import { IoCloseOutline } from 'react-icons/io5'
import { getCategories, updateDestination, getServices } from '@/lib/place/destinationApi'
import { toast } from 'sonner'
const schema = z.object({
    name: z.string().min(1, 'Tên không được để trống'),
    slug: z.string().optional(),
    address: z.string().optional(),
    description: z.string().optional(),
    categories: z.string().optional(),
    services: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    existingImages: z.array(z.string()).optional(),
    status: z.enum(['approved', 'pending', 'deleted']),
})

type FormSchema = z.infer<typeof schema>

type Props = {
    id: string
    initialValues: any
    onSaved?: (updated: any) => void
}

export default function EditDestinationForm({ id, initialValues, onSaved }: Props) {
    const initialCategoryId = Array.isArray(initialValues?.categories) && initialValues.categories.length > 0
        ? initialValues.categories[0]._id : null
    const initialCategoryLabel = Array.isArray(initialValues?.categories) && initialValues.categories.length > 0
        ? initialValues.categories[0].name : null
    const initialServiceIds = Array.isArray(initialValues?.services)
        ? initialValues.services.map((s: any) => s?._id || s?.id || s) : []

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<FormSchema>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: initialValues?.name || '',
            slug: initialValues?.slug || '',
            address: initialValues?.address || '',
            description: initialValues?.description || '',
            services: initialServiceIds,
            images: Array.isArray(initialValues?.images) ? initialValues.images : [],
            status: initialValues?.status || 'pending',
            categories: initialCategoryId ?? '',
        }
    })

    const [existingImages, setExistingImages] = useState<string[]>(Array.isArray(initialValues?.images) ? initialValues.images : [])
    const [fileList, setFileList] = useState<Array<{ file: File; preview: string }>>([])
    const fileInputRef = React.useRef<HTMLInputElement | null>(null)
    const [categoriesOptions, setCategoriesOptions] = useState<Array<{ label: string; value: string }>>([])
    const [servicesOptions, setServicesOptions] = useState<Array<{ label: string; value: string }>>([])
    const [categoryChanged, setCategoryChanged] = useState<string | null>(initialCategoryLabel)
    useEffect(() => {
        return () => {
            fileList.forEach(f => {
                try { URL.revokeObjectURL(f.preview) } catch (e) { /* ignore */ }
            })
        }
    }, [fileList])

    useEffect(() => {
        let mounted = true
        const load = async () => {
            try {
                const cats = await getCategories({ type: 'place' })
                if (!mounted) return
                if (Array.isArray(cats)) {
                    setCategoriesOptions(cats.map((c: any) => ({ label: c.name, value: c._id })))
                } else if (Array.isArray(cats?.data)) {
                    setCategoriesOptions(cats.data.map((c: any) => ({ label: c.name, value: c._id })))
                }
                

                const svs = await getServices()
                if (!mounted) return
                if (Array.isArray(svs)) {
                    setServicesOptions(svs.map((s: any) => ({ label: s.name || s.title || s._id, value: s._id })))
                } else if (Array.isArray(svs?.data)) {
                    setServicesOptions(svs.data.map((s: any) => ({ label: s.name || s.title || s._id, value: s._id })))
                }
            } catch (e) {
                // ignore fetch errors for now
                console.warn('Failed to load categories/services', e)
            }
        }
        load()
        return () => { mounted = false }
    }, [])

    const watchedServices = watch('services') || []
    useEffect(() => {
        if (!initialValues) return
        reset({
            name: initialValues?.name || '',
            slug: initialValues?.slug || '',
            address: initialValues?.address || '',
            description: initialValues?.description || '',
            services: Array.isArray(initialValues?.services) ? initialValues.services.map((s: any) => s?._id || s?.id || s) : [],
            images: Array.isArray(initialValues?.images) ? initialValues.images : [],
            status: initialValues?.status || 'pending',
            categories: initialCategoryId ?? '',
        })
        setValue('categories', initialCategoryId ?? '')
        setCategoryChanged(initialCategoryLabel)
        if (Array.isArray(initialValues?.images)) {
            setExistingImages(initialValues.images)
        }
    }, [initialValues, reset])

    const onSubmit = async (data: FormSchema) => {
        try {
            const formData = new FormData()
            formData.append('name', data.name)
            if (data.slug) formData.append('slug', data.slug)
            if (data.address) formData.append('address', data.address)
            if (data.description) formData.append('description', data.description)
            if (data.status) formData.append('status', data.status)
            if (data.categories) formData.append('categories', data.categories)
            if (Array.isArray(data.services)) {
                data.services.forEach((s) => {
                    const item: any = s as any
                    const svc = typeof item === 'string' ? item : (item?._id || item?.id || String(item))
                    formData.append('services', svc)
                })
            }
            existingImages.forEach((src) => formData.append('existingImages', src))
            fileList.forEach(({ file }) => formData.append('images', file))

            const res = await updateDestination(id, formData)
            toast.success('Cập nhật địa điểm thành công')
            const updatedRecord = res?.data || res?.place || res
            onSaved?.(updatedRecord)
            reset({
                name: updatedRecord?.name || data.name,
                slug: updatedRecord?.slug || data.slug || '',
                address: updatedRecord?.address || data.address || '',
                description: updatedRecord?.description || data.description || '',
                categories: updatedRecord?.categories || data.categories,
                status: updatedRecord?.status || data.status,
                images: Array.isArray(updatedRecord?.images) ? updatedRecord.images : existingImages,
            })
            if (Array.isArray(updatedRecord?.images)) {
                setExistingImages(updatedRecord.images)
            }
            fileList.forEach(({ preview }) => URL.revokeObjectURL(preview))
            setFileList([])
        } catch (err: any) {
            console.error('Update failed', err)
            if (err?.response) {
                console.error('Server response:', err.response.data)
            }
            toast.error(err?.message || 'Cập nhật thất bại')
        }
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-2 bg-white">
            <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700">Tên</label>
                        <input {...register('name')} placeholder="Tên địa điểm" className="mt-2 block w-full rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-transparent" />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700">Slug</label>
                        <input {...register('slug')} placeholder="slug-vi-du" className="mt-2 block w-full rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-transparent" />
                        <p className="mt-1 text-xs text-gray-400">Dùng để tạo URL (tùy chọn)</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-gray-700">Địa chỉ</label>
                        <input {...register('address')} placeholder="Số nhà, đường, quận, thành phố" className="mt-2 block w-full rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-transparent" />
                    </div>

                    {initialValues?.status === 'pending' && (
                        <div className="max-w-sm">
                            <label className="text-sm font-semibold text-gray-700">Trạng thái</label>
                            <select {...register('status')} className="mt-2 block w-full rounded-lg border border-gray-200 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-300 focus:border-transparent">
                                <option value="approved">Đã duyệt</option>
                                <option value="pending">Chờ duyệt</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-400">Chỉ hiển thị khi đang ở trạng thái chờ duyệt</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-700">Danh mục</label>
                        <select
                            className="mt-2 block w-full rounded-lg border border-gray-200 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                            value={watch('categories') || ''}
                            onChange={(e) => {
                                const sel = e.currentTarget.value
                                setValue('categories', sel)
                                const found = categoriesOptions.find(c => c.value === sel)
                                setCategoryChanged(found ? found.label : null)
                            }}
                        >
                            <option value="">{categoryChanged ?? 'Chọn danh mục'}</option>
                            {categoriesOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700">Dịch vụ nổi bật</label>
                        <div className="mt-2 grid grid-cols-2 gap-2 max-h-40 overflow-auto rounded-lg border border-gray-100 p-2 bg-gray-50">
                            {servicesOptions.length === 0 && <div className="text-sm text-gray-400 col-span-full">Không có dịch vụ</div>}
                            {servicesOptions.map(opt => (
                                <label key={opt.value} className="inline-flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        value={opt.value}
                                        checked={watchedServices.includes(opt.value)}
                                        onChange={(e) => {
                                            const checked = e.currentTarget.checked
                                            const prev = watchedServices || []
                                            const next = checked ? [...prev, opt.value] : prev.filter((v: string) => v !== opt.value)
                                            setValue('services', next)
                                        }}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="truncate">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                        <p className="mt-1 text-xs text-gray-400">Chọn các dịch vụ hoặc tiện ích nổi bật (tùy chọn)</p>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-semibold text-gray-700">Mô tả</label>
                    <textarea {...register('description')} rows={5} placeholder="Mô tả ngắn về địa điểm" className="mt-2 block w-full rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-transparent" />
                </div>

                <div>
                    <label className="text-sm font-semibold text-gray-700">Ảnh</label>
                    <p className="text-sm text-gray-500 mt-1 mb-3">Quản lý ảnh: xem trước, xóa hoặc thêm URL ảnh mới</p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                        {existingImages.length === 0 && fileList.length === 0 && (
                            <div className="col-span-full text-gray-500 rounded-md p-4 border border-dashed border-gray-200">Chưa có ảnh</div>
                        )}

                        {existingImages.map((src, idx) => (
                            <div key={`existing-${idx}`} className="relative rounded-lg overflow-hidden border border-gray-200 bg-white">
                                <Image src={src || '/image.svg'} alt={`Ảnh ${idx+1}`} width={320} height={180} className="object-cover w-full h-28" />
                                <button type="button" onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white hover:bg-black/75">
                                    <IoCloseOutline className='h-4 w-4' />
                                </button>
                            </div>
                        ))}

                        {fileList.map(({ preview }, idx) => (
                            <div key={`new-${idx}`} className="relative rounded-lg overflow-hidden border border-gray-200 bg-white">
                                <img src={preview} alt={`New ${idx}`} className="object-cover w-full h-28" />
                                <button type="button" onClick={() => {
                                    const toRemove = fileList[idx]
                                    if (toRemove) URL.revokeObjectURL(toRemove.preview)
                                    setFileList(prev => prev.filter((_, i) => i !== idx))
                                }} className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white hover:bg-black/75">
                                    <IoCloseOutline className='h-4 w-4 ' />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mb-3">
                        <div
                            className="mt-2 flex items-center justify-center rounded-lg border-2 border-dashed border-blue-200 bg-blue-50 px-4 py-6 w-full cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const selectedFiles = e.target.files ? Array.from(e.target.files) : []
                                    const mapped = selectedFiles.map(f => ({ file: f, preview: URL.createObjectURL(f) }))
                                    setFileList(prev => [...prev, ...mapped])
                                    e.currentTarget.value = ''
                                }}
                            />

                            <div className="text-center">
                                {fileList.length > 0 ? (
                                    <p className="text-sm text-blue-600">Đã chọn mới {fileList.length} ảnh</p>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-blue-600">Kéo thả hoặc nhấp để thêm ảnh</p>
                                        <p className="text-xs text-blue-400">PNG, JPG — tối đa 5MB</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white z-10">{isSubmitting ? 'Đang lưu...' : 'Lưu'}</Button>
                </div>
            </div>
        </form>
    )
}
