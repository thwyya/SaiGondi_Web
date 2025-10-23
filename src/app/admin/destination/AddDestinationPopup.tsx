"use client";
import { useState } from "react";
import CustomDropdown from "@/shared/CustomDropdown";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/services/categoryService";
import api from "@/services/api";
import { toast } from "sonner";


export default function DestinationPopup({onClose}:{onClose:()=>void}) {

    const [status, setStatus] = useState("");
    const {data:categoryOptions=[]} = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    })
    
    const [form, setForm] = useState({
    name: "",
    address: "",
    description: "", 
    categories: "",
    });

    const handleChange = (e: any) => {
        const { id, value } = e.target;
        setForm(prev => ({
        ...prev,
        [id]: value
        }));
    };

    const confirmAdd = async () => {
        try {
            await api.post('/admin/places', form);
            toast.success('Thêm danh mục thành công')
            onClose()
            window.location.reload();
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
            <div className='flex flex-col text-left space-y-2 mb-8 !bg-white w-[80%] lg:w-[50%] 2xl:w-[40%] rounded-3xl px-6 py-6'>
                <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                        <span className=" h-12 w-12 border border-gray-200 rounded-xl text-gray-700 flex items-center justify-center"><i className="ri-building-line text-2xl "></i></span>
                        <div className="flex flex-col">
                            <h1>THÊM ĐỊA ĐIỂM</h1>
                            <p className="text-gray-600">Hãy thêm những địa điểm mà bạn thấy hợp lý nhé</p>
                        </div>                        
                    </div>
                    <button onClick={onClose}><i className="ri-close-large-line"></i></button>
                </div>

                <span className="block h-px overflow-hidden bg-gray-400 my-4 origin-top scale-y-20"/>
                <div id="content__container" className="">
                    <div className="flex items-start pb-4">
                        <h4 className="w-[30%]">Tên địa điểm</h4>
                        <input id="name" onChange={handleChange} value={form.name} type="text" placeholder="vd: Cơm tấm cô Mười" className="flex-1 border border-gray-300 text-gray-500 rounded-md p-2 " />
                    </div>
                    <div className="flex items-start ">
                        <h4 className="w-[30%]">Địa chỉ</h4>
                        <input id="address" onChange={handleChange} value={form.address} type="text" placeholder="123, đường Linh Trung, phường Linh Xuân" className="flex-1 border border-gray-300 text-gray-500 rounded-md p-2 " />
                    </div>
                </div>

                <span className="block h-px overflow-hidden bg-gray-400 my-4 origin-top scale-y-20"/>
                
                <div className="flex">
                    <h4 className="w-[30%]">Hình ảnh</h4>
                    <div className="flex gap-5 flex-1">
                        <span className="rounded-full h-15 w-15 !bg-[#F5F5F5] flex items-center justify-center  "><i className="ri-image-ai-line text-2xl"></i></span>
                        <div className="border border-gray-200 p-2 rounded-xl flex flex-1 flex-col justify-center items-center">
                            <div className="flex">
                                <h4 className="text-(--primary) mr-1">Nhấn để thêm </h4>
                                <p> hoặc kéo thả</p>
                            </div>
                            <h4>SVG, PNG, JPG or GIF (max. 800x400px)</h4>

                        </div>
                    </div>

                </div>

                <span className="block h-px overflow-hidden bg-gray-400 my-4 origin-top scale-y-20"/>

                <div id="bottom__container" className="">
                    <div className="flex items-start pb-4">
                        <h4 className="w-[30%]">Danh mục</h4>
                        <CustomDropdown options={categoryOptions.map(c=>c.name)} value={status} onChange={(value)=>{
                            setStatus(value)
                            setForm(prev=>({...prev, categories: value}))
                        }}/>

                    </div>
                    <div className="flex items-start ">
                        <h4 className="w-[30%]">Mô tả địa điểm</h4>
                        <textarea id="description" onChange={handleChange} rows={3} value={form.description} placeholder="Viết một chút mô tả về địa điểm" className="flex-1 border border-gray-300 text-gray-500 rounded-md p-2 " />
                    </div>
                </div>

                <span className="block h-px overflow-hidden bg-gray-400 my-4 origin-top scale-y-20"/>

                <div id="btn__group" className="flex gap-4">
                    <button className="border border-gray-300 rounded-md py-4 flex-1 font-bold text-xl">HUỶ</button>
                    <button onClick={confirmAdd} className="btn-primary border border-gray-300 rounded-md flex-1 font-bold text-xl py-4">THÊM ĐỊA ĐIỂM</button>

                </div>
            </div>
            <div className="absolute inset-0 bg-black/40 z-[-1]" />  
        </div>

        
    )
}