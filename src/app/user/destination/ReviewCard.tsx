import { Review } from "@/types/review"; 
import Image from "next/image"; 
import { useState } from "react"; 
import Button from "@/components/ui/Button"; 
import { reportReview } from "@/lib/place/destinationApi"; 
import { IoFlagSharp } from "react-icons/io5"; 
import { toast } from "sonner"; 
import { useLoginNotice } from "@/hooks/useLoginNotice"; 
import { useSelector } from "react-redux"; 

interface ReviewCardProps { 
    review: Review; 
} 

const ReviewCard = ({ review }: ReviewCardProps) => { 
    const { show: showLoginNotice, LoginNotice } = useLoginNotice(); 
    const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated); 

    const renderStars = () => { 
        const stars = []; 
        for (let i = 1; i <= 5; i++) { 
            stars.push( 
                <i 
                    key={i} 
                    className={`ri-star-fill text-lg ${i <= review.rating ? "text-yellow-400" : "text-gray-300"}`} 
                ></i> 
            ); 
        } 
        return stars; 
    }; 

    const [reportOpen, setReportOpen] = useState(false); 
    const [reportReason, setReportReason] = useState(""); 
    const user = (review as any).userId; 
    const authorAvatar = (user && user.avatar) || (review as any).avatar || "/avatar.svg"; 
    const authorName = (user && (user.name || (user.firstName && `${user.firstName} ${user.lastName}`))) || 
        (review as any).fullName || (review as any).firstName || "Người dùng ẩn danh"; 

    const handleReport = async () => { 
        if (!reportReason.trim()) { 
            toast.info("Vui lòng nhập lý do báo cáo!"); 
            return; 
        } 
        try { 
            await reportReview(review._id, reportReason); 
            toast.success("Đã gửi báo cáo thành công!"); 
            setReportOpen(false); 
            setReportReason(""); 
        } catch (err: any) { 
            const serverMessage = err?.response?.data?.message || err?.message; 
            toast.error(serverMessage || "Gửi báo cáo thất bại. Vui lòng thử lại."); 
            console.error("Failed to report comment", err); 
        } 
    }; 

    const handleOpenReport = () => { 
        if (!isAuthenticated) { 
            showLoginNotice(); 
            return; 
        } 
        setReportOpen(true); 
    }; 

    return ( 
        <> 
            <div className="flex gap-4"> 
                <Image 
                    src={authorAvatar} 
                    alt="" 
                    className="rounded-full h-16 w-16" 
                    width={64} 
                    height={64} 
                /> 
                <div className="flex flex-col flex-1"> 
                    <div className="flex items-center gap-4"> 
                        <div className="flex items-center border-r pr-4"> 
                            <div className="flex">{renderStars()}</div> 
                        </div> 
                        <h6>{authorName}</h6> 
                    </div> 
                    <p className="text-sm text-gray-600 mt-2">{review.comment}</p> 
                </div> 
                <IoFlagSharp className="cursor-pointer" onClick={handleOpenReport} /> 
                {reportOpen && ( 
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"> 
                        <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md relative"> 
                            <h2 className="text-lg font-semibold mb-3">Báo cáo bình luận</h2> 
                            <textarea 
                                className="w-full border rounded p-2 mb-4 text-sm" 
                                rows={4} 
                                placeholder="Nhập lý do báo cáo..." 
                                value={reportReason} 
                                onChange={(e) => setReportReason(e.target.value)} 
                            /> 
                            <div className="flex justify-end gap-2"> 
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={() => setReportOpen(false)} 
                                    className="flex items-center gap-2 border border-[var(--gray-3)] text-[var(--gray-1)] hover:bg-[var(--gray-5)]" 
                                > 
                                    Hủy 
                                </Button> 
                                <Button onClick={handleReport} variant="primary"> 
                                    Gửi 
                                </Button> 
                            </div> 
                        </div> 
                    </div> 
                )} 
            </div> 
            <span className="block h-px bg-gray-300 my-6" /> 
            <LoginNotice /> 
        </> 
    ); 
}; 

export default ReviewCard;