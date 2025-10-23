"use client"
import { useState } from "react";
import { GoTag } from "react-icons/go";
import api from "@/services/api";
import { toast } from "sonner";

export default function AddCategoryPopup({onClose}:{onClose:()=>void}) {

    const [categoryName, setCategoryName] = useState("")

    const handleAddCategory = async () => {
        if (!categoryName) return toast.error('Vui lòng nhập tên danh mục')
        try {

            await api.post('/admin/categories', { name: categoryName });
            toast.success('Thêm danh mục thành công')
            onClose()
            window.location.reload();
        }
        catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50">            
            <div className="flex flex-col bg-white z-1 w-[50%] lg:w-[30%] p-4">
                <div className="flex justify-between mb-4 ">
                    <GoTag className="h-10 w-10 border border-gray-300 rounded-md p-2 overflow-hidden" />                    
                    <button  onClick={onClose}><i className="ri-close-large-line text-gray-500"></i></button>
                </div>
                <h1>THÊM DANH MỤC</h1>
                <h6>Hãy thêm danh mục</h6>

                <input type="text" value={categoryName} onChange={e=>setCategoryName(e.target.value)} placeholder="Danh mục muốn thêm" className="border border-gray-300 rounded-md p-3 my-6 " />

                <div id="btn__group" className="flex gap-4">
                        <button className="border border-gray-300 rounded-md py-4 flex-1 font-bold text-xl">HUỶ</button>
                        <button onClick={handleAddCategory} className="btn-primary border border-gray-300 rounded-md flex-1 font-bold text-xl py-2">THÊM</button>
                    </div>
            </div>
            <div className="absolute inset-0 bg-black/40 z-[-1]" />
        </div>
    )
}