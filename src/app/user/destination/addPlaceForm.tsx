"use client"
import Button from "@/components/ui/Button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { file, z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import Input from "@/components/ui/Input"
import PhotoIcon from "@heroicons/react/20/solid/PhotoIcon"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Ward } from "@/types/place"
import { Category } from "@/types/category"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState, useEffect } from "react"
import { createDestination } from "@/lib/place/destinationApi"
import { ca } from "zod/v4/locales"

const frameworks = [
  {
    value: "cafe",
    label: "Cà Phê",
  },
  {
    value: "Food",
    label: "Ăn uống",
  },
  {
    value: "Play",
    label: "Vui chơi",
  },
  {
    value: "Sightseeing",
    label: "Ngắm cảnh",
  },
  {
    value: "Exhibition",
    label: "Bảo tàng",
  },
]
const frameworkValues = frameworks.map(f => f.value)

export interface Option {
  value: string
  label: string
  lng: number
  lat: number
}
export interface CategoryOption {
  id: string
  name: string
}
export interface ServiceOption {
  id: string
  name: string
}

const items = [
  {
    id: "Free Breakfast",
    label: "Miễn phí ăn sáng",
  },
  {
    id: "Free Parking",
    label: "Đỗ xe miễn phí",
  },
  {
    id: "Free Internet",
    label: "Miễn phí Internet",
  },
  {
    id: "Free Cancel",
    label: "Miễn phí hủy đặt trước",
  },
  {
    id: "Free Shuttle",
    label: "Đưa đón miễn phí",
  },
  {
    id: "More",
    label: "Khác",
  }

] as const


const formSchema = z.object({
  username: z.string().min(2, {
    message: "Tên địa điểm ít nhất 2 kí tự"
  }).max(50),
  description: z.string().min(2, {
    message: "Mô tả ít nhất 2 kí tự"
  }).max(200),
  address: z.string().min(2, {
    message: "Địa chỉ ít nhất 2 kí tự"
  }).max(50),
  locationLng: z.string().optional(),
  locationLat: z.string().optional(),
  ward: z.string(),
  items: z.array(z.string()),
  messages: z.string(),
  images: z
    .custom<FileList>()
    .refine((files) => files && files.length > 0, {
      message: "Bạn phải chọn ít nhất 1 ảnh",
    }),
  category: z.string(),
})

export function AddPlace({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const [wardSearch, setWardSearch] = useState("");
  const [wardOpen, setWardOpen] = useState(false);
  const [wardValue, setWardValue] = useState("");
  const [options, setOptions] = useState<Option[]>([])
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([])
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([])
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      description: "",
      address: "",
      messages: "",
      items: [] as string[],
      category: "",
      ward: "",
      locationLng: "",
      locationLat: "",

    },
  })
  const [isSubmitting, setIsSubmitting] = useState(false);
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      toast.error('Bạn cần đăng nhập để gửi địa điểm')
      if (typeof window !== 'undefined') window.location.href = '/auth/login'
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("name", values.username)
      formData.append("description", values.description)
      formData.append("address", values.address)
      formData.append("district", "TP.Hồ Chí Minh")

      if (values.items){
        formData.append("services", JSON.stringify(values.items))
      }

      if (values.category) {
        formData.append("categories", JSON.stringify([values.category]))
      }
      if (values.ward) {
        formData.append("ward", JSON.stringify([values.ward]))
      }

      if (values.locationLng && values.locationLat) {
        const lng = parseFloat(values.locationLng as any)
        const lat = parseFloat(values.locationLat as any)
        if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
          const location = { type: "Point", coordinates: [lng, lat] }
          formData.append("location", JSON.stringify(location))
        }
      }


      const imgs: any = Array.isArray(values.images) ? values.images : (values.images ? Array.from(values.images as any) : [])
      imgs.forEach((file: File) => {
        formData.append("images", file)
      })

      if (typeof window !== 'undefined') {
        for (const [k, v] of formData.entries()) {
          console.debug('FormData entry:', k, v instanceof File ? `${(v as File).name} (File)` : v)
        }
      }

      await createDestination(formData)
      toast.success("Địa điểm đã được gửi cho admin phê duyệt")
      setOpen(false)
      console.log("Submitted values:", values)
    } catch (err: any) {
      console.error('Create destination error:', err)
      // log server validation payload if present
      if (err?.response?.data) {
        console.error('Server response data:', err.response.data)
        // show a friendly message or validation errors
        const srv = err.response.data
        if (srv.message) {
          toast.error(srv.message)
        } else if (srv.errors) {
          // assume errors is an object or array
          const msg = typeof srv.errors === 'string' ? srv.errors : JSON.stringify(srv.errors)
          toast.error(msg)
        } else {
          toast.error('Gửi thất bại: ' + JSON.stringify(srv))
        }
      } else {
        toast.error(err?.message || "Gửi địa điểm thất bại")
      }

      if (err?.response?.status === 401) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        if (typeof window !== 'undefined') window.location.href = '/auth/login'
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  useEffect(() => {
    const fetchWards = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/wards")
        if (!res.ok) throw new Error("Failed to fetch wards")
        const data = await res.json()
        console.log("fetchWards response:", data)
        const formatted: Option[] = data.map((ward: Ward) => ({
          value: ward._id,
          label: `${ward.name}`,
          lng: ward.location.coordinates[0],
          lat: ward.location.coordinates[1],
        }))

        setOptions(formatted)
      } catch (err) {
        console.error(err)
      }
    }

    const fetchServices = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/services")
        if (!res.ok) throw new Error("Failed to fetch services")
        const data = await res.json()
        console.log("services api responsse:", data)
        
        const formatted = data.data.map((service: ServiceOption) => ({
          id: service.id,
          name: service.name
        }))
        setServiceOptions(formatted)
      } catch (err) {
        console.error(err)
      }
    }
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/categories")
        if (!res.ok) throw new Error("Failed to fetch categories")
        const data = await res.json()
        console.log("categories api response:", data)
        const formatted: CategoryOption[] = data.data.map((category: Category) => ({
          id: category._id,
          name: category.name
        }))
        setCategoryOptions(formatted)
      } catch (err) {
        console.error(err)
      }
    }
    fetchServices()
    fetchCategories()
    fetchWards()
  }, [])
  return (
    
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogContent className="max-w-2xl max-h-[100vh] flex flex-col p-0 bg-gradient-to-br from-blue-100 via-blue-50 to-white shadow-2xl border border-blue-300 rounded-2xl">
      <div className="absolute top-[30%] -left-[10%] w-[50vw] h-[50vh] sm:h-[15vw] rounded-full bg-[#FFB226] blur-[15vw] opacity-70 z-[-1]"></div>
        <div className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vh] sm:h-[15vw] rounded-full bg-[white] blur-[15vw] opacity-70 z-[-1]"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vh] sm:h-[15vw] rounded-full bg-[#307AFD] blur-[15vw] opacity-70 z-[-1]"></div>
        <div className="absolute bottom-[20%] -right-[10%] w-[50vw] h-[50vh] sm:h-[15vw] rounded-full bg-[#307AFD] blur-[15vw] opacity-70 z-[-1]"></div>
        <DialogHeader className="p-8 border-b border-blue-200 rounded-t-2xl bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md">
          <DialogTitle className="text-2xl font-bold tracking-wide">Thêm địa điểm du lịch</DialogTitle>
          <DialogDescription className="mt-2 text-base text-blue-100">
            Hãy điền đầy đủ thông tin để quảng bá điểm du lịch của bạn.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-8">
          <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)} >
              <div className="mt-6 space-y-8"></div>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="mt-8">
                    <FormLabel className="text-base font-semibold text-black  ">Tên địa điểm</FormLabel>
                    <FormControl>
                      <Input placeholder="DuDi" {...field} className="block min-w-0 grow py-2 px-3 text-base text-black placeholder:text-gray-400 bg-blue-50 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 shadow-sm transition-all" />
                    </FormControl>
                    <FormDescription>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mt-8">
                    <FormLabel className="text-base font-semibold text-black">Mô tả địa điểm</FormLabel>
                    <FormControl>
                      <Input placeholder="Mô tả địa điểm du lịch của bạn" {...field} className="block min-w-0 grow py-2 px-3 text-base text-blue-900 placeholder:text-gray-400 bg-blue-50 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 shadow-sm transition-all" />
                    </FormControl>
                    <FormDescription>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="mt-8">
                    <FormLabel className="text-base font-semibold text-black">Địa chỉ</FormLabel>
                    <FormControl>
                      <Input placeholder="39 đường số 14" {...field} className="block min-w-0 grow py-2 px-3 text-base text-blue-900 placeholder:text-gray-400 bg-blue-50 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 shadow-sm transition-all" />
                    </FormControl>
                    <FormDescription>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />



              <FormField
                control={form.control}
                name="ward"
                render={({ field }) => (
                  <FormItem className="mt-8">
                    <FormLabel className="text-base font-semibold text-black">Phường</FormLabel>
                    <FormControl>
                      <Popover open={wardOpen} onOpenChange={setWardOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            role="combobox"
                            aria-expanded={wardOpen}
                            className="w-full justify-between bg-blue-100 border border-blue-300 text-gray-400 rounded-lg shadow-sm hover:bg-blue-200 focus:ring-2 focus:ring-blue-400 transition-all"
                          >
                            {wardValue
                              ? options.find((option) => option.value === wardValue)?.label
                              : "Phường"}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full min-w-[450px] p-0 bg-white border border-blue-300 rounded-lg shadow-lg">
                          <Command className="bg-blue-50">
                            <CommandInput
                              placeholder="Chọn phường"
                              className="h-10 px-3 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 text-black bg-white"
                              value={wardSearch}
                              onValueChange={setWardSearch}
                            />
                            <CommandList className="text-blue-900 max-h-48 overflow-y-auto">
                              <CommandEmpty>Không tìm thấy.</CommandEmpty>
                              <CommandGroup>
                                {options
                                  .filter(option => option.label.toLowerCase().includes(wardSearch.toLowerCase()))
                                  .map((option) => (
                                    <CommandItem
                                      key={option.value}
                                      value={option.value}
                                      onSelect={(currentValue) => {
                                        field.onChange(option.value)
                                        form.setValue("locationLng", option.lng.toString())
                                        form.setValue("locationLat", option.lat.toString())
                                        setWardValue(currentValue === wardValue ? "" : currentValue)
                                        setWardOpen(false)
                                      }}
                                      className={`cursor-pointer px-4 py-2 text-sm rounded-lg hover:bg-blue-100 transition-all ${option.value === wardValue ? "bg-blue-500 text-white" : ""}`}
                                    >
                                      {option.label}
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          wardValue === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormDescription>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="items"
                render={({ field }) => (
                  <FormItem className="mt-8">
                    <div className="mb-4">
                      <FormLabel className="text-base font-semibold text-black">Dịch vụ nổi bật</FormLabel>
                      <FormDescription className="text-xs text-blue-500">
                        Chọn dịch vụ bạn muốn để hiển thị.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {serviceOptions.map((item) => (
                        <div key={item.id} className="flex flex-row items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100 hover:bg-blue-100 transition-all">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(
                                    field.value?.filter((value) => value !== item.id)
                                  )
                              }}
                              className="accent-blue-500 focus:ring-2 focus:ring-blue-400"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal text-black">{item.name}</FormLabel>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("items")?.includes("68d508ffd35c87bd36ceab42") && (
                <FormField
                  control={form.control}
                  name="messages"
                  render={({ field }) => (
                    <FormItem className="mt-8">
                      <FormLabel className="text-base font-semibold text-black">Thêm yêu cầu, góp ý, dịch vụ khác</FormLabel>
                      <FormControl>
                        <textarea {...field} id="message" rows={4} className="block p-3 w-full text-sm text-blue-900 bg-blue-50 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 placeholder:text-blue-300" placeholder="Nhập yêu cầu, góp ý, dịch vụ khác..." />
                      </FormControl>
                      <FormDescription>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="mt-8">
                    <FormLabel className="text-base font-semibold text-black">Danh mục</FormLabel>
                    <FormControl>
                      <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            role="combobox"
                            aria-expanded={categoryOpen}
                            className="w-[220px] justify-between bg-blue-100 border border-blue-300 text-black rounded-lg shadow-sm hover:bg-blue-200 focus:ring-2 focus:ring-blue-400 transition-all"
                          >
                            {categoryValue
                              ? categoryOptions.find((opt) => opt.id === categoryValue)?.name
                              : "Chọn danh mục"}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[220px] p-0 bg-white border border-blue-300 rounded-lg shadow-lg">
                          <Command className="bg-blue-50">
                            <CommandInput
                              placeholder="Chọn danh mục"
                              className="h-10 px-3 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 text-black bg-white"
                            />
                            <CommandList className="bg-blue-50 text-blue-900 max-h-48 overflow-y-auto">
                              <CommandEmpty>Không tìm thấy.</CommandEmpty>
                              <CommandGroup>
                                {categoryOptions.map((opt) => (
                                  <CommandItem
                                    key={opt.id}
                                    value={opt.id}
                                    onSelect={(currentValue) => {
                                      field.onChange(opt.id) // gán objectId cho field
                                      setCategoryValue(currentValue === categoryValue ? "" : opt.id)
                                      setCategoryOpen(false)
                                    }}
                                    className={`cursor-pointer px-4 py-2 text-sm rounded-lg hover:bg-blue-100 transition-all ${categoryValue === opt.id ? "bg-blue-500 text-white" : ""
                                      }`}
                                  >
                                    {opt.name}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        categoryValue === opt.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormDescription></FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />



              <FormField
                control={form.control}
                name="images"
                render={({ field }) => {
                  const files = field.value ? Array.from(field.value) : [];

                  return (
                    <FormItem className="mt-8">
                      <FormLabel className="text-base font-semibold text-black">Thêm hình ảnh</FormLabel>
                      <FormControl>
                        <div
                          className="mt-2 flex justify-center rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 px-8 py-12 w-full cursor-pointer hover:bg-blue-100 transition-all"
                          onClick={() => document.getElementById("file-upload")?.click()}
                        >
                          <input
                            id="file-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const newFiles = e.target.files ? Array.from(e.target.files) : [];
                              const oldFiles = field.value ? Array.from(field.value) : [];
                              field.onChange([...oldFiles, ...newFiles]);
                            }}
                          />

                          {files.length > 0 ? (
                            <div className="grid grid-cols-3 gap-6 w-full">
                              {/* Preview ảnh */}
                              {files.map((file, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="h-28 w-full rounded-lg object-cover shadow-md border border-blue-200"
                                  />
                                  <p className="text-xs text-center mt-1 truncate text-black">{file.name}</p>

                                  {/* Nút xoá */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const updated = files.filter((_, i) => i !== index);
                                      field.onChange(updated);
                                    }}
                                    className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center">
                              <PhotoIcon aria-hidden="true" className="mx-auto size-14 text-blue-300" />
                              <div className="mt-4 flex text-sm text-blue-600 justify-center">
                                <span>Nhấn hoặc kéo thả ảnh vào đây</span>
                              </div>
                              <p className="text-xs text-blue-400">PNG, JPG — tối đa 5MB</p>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <div className="mt-8 flex justify-end">
                <Button type="submit" disabled={isSubmitting} className={`bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-800 transition-all focus:ring-2 focus:ring-blue-400 ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  {isSubmitting ? 'Đang gửi...' : 'Gửi địa điểm'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}