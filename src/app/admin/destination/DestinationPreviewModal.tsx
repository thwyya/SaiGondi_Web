"use client"

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { getDestinationById, getServices, createReview, getReviewsByPlaceId } from '@/lib/place/destinationApi'
import { categoryApi } from '@/lib/category/categoryApi'
import { blogApi } from '@/lib/blog/blogApi'
import { mapBlogToPost } from '@/lib/blog/mapBlogToPost'

import ReviewCard from '@/app/user/destination/ReviewCard'
import { toast } from 'sonner'

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel'

import Button from '@/components/ui/Button'
import { Bus, Car, CircleHelp, Coffee, Ticket, Wifi, ChevronLeft, ChevronRight } from 'lucide-react'
import { IoChatbubbles } from 'react-icons/io5'
import { HiLocationMarker } from 'react-icons/hi'

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import EditDestinationForm from './EditDestinationForm'

type Props = {
    id: string
    open: boolean
    onClose: () => void
    onUpdateSuccess?: (updated: any) => void
}

export default function DestinationPreviewModal({ id, open, onClose, onUpdateSuccess }: Props) {
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [destination, setDestination] = useState<any | null>(null)
    const [reviews, setReviews] = useState<any[]>([])
    const [ward, setWard] = useState<any | null>(null)
    const [category, setCategory] = useState<any | null>(null)
    const [relatedBlogs, setRelatedBlogs] = useState<any[]>([])
    const shareRef = useRef<HTMLDivElement>(null)
    const [servicesData, setServicesData] = useState<{ id: string; name: string }[]>([])
    const [currentMainImage, setCurrentMainImage] = useState<string>("")
    const [editOpen, setEditOpen] = useState(false)

    const serviceIcons: Record<string, React.ReactNode> = {
        "Miễn phí đỗ xe": <Car className="w-4 h-4 text-gray-600" />,
        "Miễn phí ăn sáng": <Coffee className="w-4 h-4 text-gray-600" />,
        "Miễn phí Internet": <Wifi className="w-4 h-4 text-gray-600" />,
        "Miễn phí di chuyển": <Bus className="w-4 h-4 text-gray-600" />,
        "Miễn phí hủy đặt trước": <Ticket className="w-4 h-4 text-gray-600" />
    }

    useEffect(() => {
        if (!open) return
        const fetchData = async () => {
            setLoading(true)
            try {
                const destinationRes = await getDestinationById(id)
                const place = destinationRes?.data || destinationRes?.place || destinationRes
                setDestination(place)
                setReviews(place.reviews || [])
                setCurrentMainImage((Array.isArray(place.images) && place.images[0]) || "")

                if (place.category) {
                    try {
                        const categoryRes = await categoryApi.getById(place.category)
                        setCategory(categoryRes.data || categoryRes.category || categoryRes)
                    } catch (e) {
                        console.error("Failed to fetch category", e)
                    }
                }

                try {
                    const blogsByPlaceRes = await blogApi.getBlogsByPlaceId(id)
                    const blogsByPlace = blogsByPlaceRes.data || []

                    let blogsByWard: any[] = []
                    let blogWardIdSource: any = place.ward
                    if (typeof blogWardIdSource === 'string' && blogWardIdSource.startsWith('[') && blogWardIdSource.endsWith(']')) {
                        try { blogWardIdSource = JSON.parse(blogWardIdSource)[0] } catch (e) { }
                    }
                    if (Array.isArray(blogWardIdSource)) blogWardIdSource = blogWardIdSource[0]
                    const finalBlogWardId = typeof blogWardIdSource === 'object' && blogWardIdSource !== null ? blogWardIdSource._id : typeof blogWardIdSource === 'string' ? blogWardIdSource : null
                    if (finalBlogWardId) {
                        const blogRes = await blogApi.getBlogsByWard(finalBlogWardId)
                        blogsByWard = blogRes.data || []
                    }

                    const allBlogs = [...blogsByPlace, ...blogsByWard]
                    const unique = allBlogs.reduce((acc: any[], cur: any) => {
                        if (!acc.find(a => a._id === cur._id)) acc.push(cur)
                        return acc
                    }, [])
                    setRelatedBlogs(unique.map(mapBlogToPost))
                } catch (e) {
                    console.error('Failed to fetch related blogs', e)
                }

                // services
                try {
                    const res = await getServices()
                    const services = res?.data || res || []
                    const formatted = Array.isArray(services) ? services.map((s: any) => ({ id: s.id || s._id || s._id, name: s.name })) : []
                    setServicesData(formatted)
                } catch (e) {
                    console.error('Failed to fetch services', e)
                }

            } catch (error) {
                console.error('Failed to fetch data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [open, id])

    const pageUrl = typeof window !== 'undefined' ? window.location.href : ''
    const copyToClipboard = () => { navigator.clipboard.writeText(pageUrl); toast.success('Đã sao chép liên kết!') }

    const getServiceName = (serviceId: string) => {
        const service = servicesData.find(s => s.id === serviceId)
        return service ? service.name : serviceId
    }

    const displayImage = currentMainImage || (Array.isArray(destination?.images) && destination.images.length > 0 ? destination.images[0] : '/image.svg')

    if (!open) return null

    return (
        <AlertDialog open={open} onOpenChange={(v: boolean) => { if (!v) onClose() }}>
            <AlertDialogContent className="max-w-7xl w-full max-h-[90vh] overflow-auto bg-gradient-to-b from-orange-50 to-blue-50">
                <AlertDialogHeader>
                    <AlertDialogTitle className='justify-between flex items-center'>
                        <span className="text-xl font-bold text-gray-800">Xem trước địa điểm</span>
                        <i className="ri-close-line cursor-pointer text-2xl hover:text-blue-500" onClick={() => onClose()}></i>
                    </AlertDialogTitle>
                </AlertDialogHeader>

                <div className="px-4 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">{destination?.name}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                <div className="flex items-center gap-1.5"><i className="ri-map-pin-2-fill text-blue-500"></i><span>{ward?.name || destination?.address || ''}</span></div>
                                {category && <div className="flex items-center gap-1.5"><i className="ri-folder-line text-blue-500"></i><span>{category.name}</span></div>}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setEditOpen(true)} className="border w-[50px] h-[50px] rounded-lg flex items-center justify-center hover:bg-gray-100"><i className="ri-edit-line text-xl" /></button>
                        </div>
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

                    {/* Main content */}
                    <div className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div className="relative w-full aspect-[3/2] sm:aspect-[4/3] lg:aspect-[3/2]">
                                <Image src={displayImage} alt={destination?.name || ''} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover rounded-lg" />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold mb-4 text-blue-400">GIỚI THIỆU</h2>
                                <p className="text-gray-700 leading-relaxed mb-6 text-[16px]">{destination?.description}</p>
                                <p className="mb-4"><i className="ri-map-pin-line mr-2"></i>{destination?.address}{destination?.address && destination?.ward && `, ${destination.ward.name}`}</p>

                                <p className="mb-4"><span className="font-semibold">Dịch vụ nổi bật:</span>{destination?.services?.length > 0 ? '' : <span className="text-gray-600"> Chưa cập nhật dịch vụ</span>}</p>

                                <div className="flex gap-3 flex-wrap">
                                    {destination?.services?.map((serviceId: any, index: number) => {
                                        const serviceName = getServiceName(serviceId)
                                        return (
                                            <span key={index} className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-lg text-sm">
                                                {serviceIcons[serviceName] ?? <CircleHelp className="w-4 h-4 text-gray-400" />}
                                                {serviceName}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Carousel */}
                        <div className="relative overflow-hidden">
                            <Carousel opts={{ align: 'start' }} className="w-full">
                                <CarouselContent className="gap-3 p-8">
                                    {Array.isArray(destination?.images) && destination.images.length > 0 && destination.images.slice(0, 20).map((img: string, idx: number) => (
                                        <CarouselItem key={idx} onClick={() => setCurrentMainImage(img)} className={`basis-[128px] sm:basis-[144px] lg:basis-[160px] relative aspect-[4/3] overflow-hidden rounded-lg bg-white hover:opacity-80 transition ${currentMainImage === img ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'}`} aria-label={`Ảnh ${idx + 1}`}>
                                            <Image src={img || '/image.svg'} alt={`${destination?.name} ${idx + 1}`} fill sizes="(min-width:1024px) 160px, (min-width:768px) 144px, 128px" className="object-cover rounded-md" />
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="flex absolute left-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/95 text-gray-800 shadow border hover:bg-white z-30"><ChevronLeft className="mx-auto w-4 h-4" /></CarouselPrevious>
                                <CarouselNext className="flex absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/95 text-gray-800 shadow border hover:bg-white z-30"><ChevronRight className="mx-auto w-4 h-4" /></CarouselNext>
                            </Carousel>
                        </div>

                        {/* Location */}
                        <section className="mt-8">
                            <h2 className="text-lg font-bold mb-3">Vị trí</h2>
                            <p className="text-gray-600 mb-3">{destination?.address}</p>
                            {(() => {
                                const coords = destination?.location?.coordinates
                                const lat = coords && coords.length > 1 ? coords[1] : null
                                const lng = coords && coords.length > 0 ? coords[0] : null
                                if (lat !== null && lng !== null) {
                                    return (<iframe src={`https://www.google.com/maps?q=${lat},${lng}&hl=vi&z=16&output=embed`} width="100%" height="400" className="w-full h-64 sm:h-80 md:h-96 rounded-lg border" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />)
                                }
                                return <div className="text-gray-500">Không có toạ độ</div>
                            })()}
                        </section>

                        {/* Reviews */}
                        <section className="mt-8">
                            <h2 className="text-lg font-bold mb-6">ĐÁNH GIÁ</h2>
                            <div className="flex items-center gap-6 mb-6">
                                <span className="text-4xl font-bold text-green-800">{(destination?.avgRating || 0).toFixed(1)}</span>
                                <span className="text-gray-600">{destination?.totalRatings || 0} Lượt đánh giá</span>
                            </div>

                            <div className="space-y-6">
                                {reviews.length > 0 ? reviews.map((r: any) => <ReviewCard key={r._id || r.id} review={r} />) : <p className="text-gray-600">Chưa có đánh giá nào.</p>}
                            </div>
                        </section>

                        {/* Related blogs */}
                        <section className="relative pt-20 pb-60">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                                <div className="flex items-start justify-between flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
                                    <h1 className="text-2xl sm:text-3xl font-bold font-inter text-gray-800 leading-tight">CÁC BÀI VIẾT LIÊN QUAN</h1>
                                    <Button variant="outline-primary" onClick={() => router.push('/user/blog')} className="text-sm px-4 py-2">Xem tất cả</Button>
                                </div>
                                <p className="text-gray-600 mb-6">Cùng xem các trải nghiệm của khách hàng</p>
                                {relatedBlogs.length === 0 ? <p className="text-gray-600">Chưa có bài viết liên quan.</p> : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 lg:gap-x-8 xl:gap-x-10 gap-y-45 sm:gap-y-20 md:gap-y-40 lg:gap-y-20">
                                        {relatedBlogs.slice(0, 4).map(post => {
                                            if (!post || !post.id) return null
                                            const authorName = post.author; const authorAvatar = post.authorAvatar; const postTitle = post.title || 'Untitled'; const postWard = post.ward || 'Unknown'
                                            return (
                                                <div className="group" key={post.id}>
                                                    <div className="relative py-6 hover:shadow-lg hover:scale-[1.02] transition-transform ">
                                                        <Link href={`/user/blog/${post.slug}`}>
                                                            <div className="absolute bottom-0 left-0 w-full h-70 z-0 overflow-hidden cursor-pointer"><Image src={post.image || '/default.jpg'} alt={postTitle} fill style={{ objectFit: 'cover' }} /></div>
                                                        </Link>
                                                        <div className="bg-white left-0 shadow-lg overflow-hidden relative z-10 translate-y-45 w-[88%] sm:w-[90%] ml-0 mt-8 mb-6">
                                                            <div className="absolute top-6 left-0 w-1 h-10 bg-[var(--warning)] z-20" />
                                                            <div className="p-4 sm:p-6">
                                                                <div className="flex items-center justify-between text-xs sm:text-sm text-[var(--warning)] mb-3 sm:mb-4"><span>{post.date ? new Date(post.date).toLocaleDateString('vi-VN') : ''}</span></div>
                                                                <div className="border-t border-gray-200 pt-2 mt-2">
                                                                    <Link href={`/user/blog/${post.slug}`}><h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 leading-snug line-clamp-2 min-h-[3rem] cursor-pointer">{postTitle}</h3></Link>
                                                                    <Link href={`/user/profile/${post.authorId}`}><div className="flex items-center space-x-2 cursor-pointer"><Image src={authorAvatar} alt={authorName} width={24} height={24} className="rounded-full" /><p className="text-gray-800 text-[12px] sm:text-sm font-inter">{authorName}</p></div></Link>
                                                                    <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-gray-500 mt-2 whitespace-nowrap"><span className="flex items-center gap-1 min-w-0"><HiLocationMarker className="text-[var(--warning)] shrink-0" /><span className="truncate">{postWard}</span></span><span className="flex items-center gap-1"><IoChatbubbles className="text-[var(--warning)]" />Bình luận({post.totalComments || 0})</span></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}
