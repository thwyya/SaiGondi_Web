"use client"
import Button from "@/components/ui/Button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { z } from "zod"
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
import { useState, useEffect, useRef } from "react"
import { createDestination, getCategories, getServices } from "@/lib/place/destinationApi"
import { IoCloseOutline } from "react-icons/io5";

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
    .array(z.instanceof(File))
    .min(1, { message: "Bạn phải chọn ít nhất 1 ảnh" }),
  category: z.string(),
})

export function AddPlace({ open, setOpen, onSaved }: { open: boolean; setOpen: (v: boolean) => void; onSaved?: (created: any) => void }) {
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
      images: [] as File[],
      category: "",
      ward: "",
      locationLng: "",
      locationLat: "",

    },
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
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

      if (values.items) {
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


      const imgs = values.images || [] 
      imgs.forEach((file) => {
        formData.append("images", file)
      })

      if (typeof window !== 'undefined') {
        for (const [k, v] of formData.entries()) {
          console.debug('FormData entry:', k, v instanceof File ? `${(v as File).name} (File)` : v)
        }
      }

      const created = await createDestination(formData)
      try {
        // notify parent if it wants to update local state in realtime
        onSaved?.(created)
      } catch (err) {
        console.error('onSaved handler error', err)
      }
      toast.success("Địa điểm đã được gửi cho admin phê duyệt")
      setOpen(false)
    } catch (err: any) {
      console.error('Create destination error:', err)
      if (err?.response?.data) {
        console.error('Server response data:', err.response.data)
        const srv = err.response.data
        if (srv.message) {
          toast.error(srv.message)
        } else if (srv.errors) {
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
      form.reset()
      setWardValue("")
      setCategoryValue("")
      setIsSubmitting(false)
    }
  }
  useEffect(() => {
    const fetchWards = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/wards")
        if (!res.ok) throw new Error("Failed to fetch wards")
        const data = await res.json()
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
          const res = await getServices();

          const formatted = res.data.map((service: ServiceOption) => ({
            id: service.id,
            name: service.name
          }))
          setServiceOptions(formatted)
        } catch (err) {
          console.error(err)
        }
      }
      
    const fetchCategories= async () => {
            try {
              const res = await getCategories({type: 'place'});
              const list = (res?.data ?? res) as Array<{ _id: string; name: string }>;
              const formatted: CategoryOption[] = (list || []).map((category) => ({
                id: category._id,
                name: category.name,
              }));
              setCategoryOptions(formatted);
            } catch (err) {
              console.error("fetch categories error:", err);
            }
          };
    fetchServices()
    fetchCategories()
    fetchWards()
  }, [])
  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogContent className="w-[95vw] max-w-2xl sm:max-h-[90vh] max-h-[95vh] flex flex-col p-0 bg-gradient-to-br from-blue-100 via-blue-50 to-white shadow-2xl border border-blue-300 rounded-2xl">
        <DialogHeader className="p-6 sm:p-8 border-b border-blue-200 rounded-t-2xl bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md">
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-wide">Thêm địa điểm du lịch</DialogTitle>
          <DialogDescription className="mt-2 text-sm sm:text-base text-blue-100">
            Hãy điền đầy đủ thông tin để quảng bá điểm du lịch của bạn.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)} >
              <div className="mt-2 sm:mt-6 space-y-6 sm:space-y-8"></div>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="mt-6 sm:mt-8">
                    <FormLabel className="text-sm sm:text-base font-semibold text-black">Tên địa điểm</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: DuDi" {...field} className="w-full py-2 sm:py-3 sm:text-base px-3 text-sm text-black placeholder:text-gray-400 bg-blue-50 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 shadow-sm transition-all" />
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
                  <FormItem className="mt-6 sm:mt-8">
                    <FormLabel className="text-sm sm:text-base font-semibold text-black">Mô tả địa điểm</FormLabel>
                    <FormControl>
                      <Input placeholder="Mô tả địa điểm du lịch của bạn" {...field} className="w-full py-2 sm:py-3 px-3 text-sm sm:text-base text-blue-900 placeholder:text-gray-400 bg-blue-50 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 shadow-sm transition-all" />
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
                  <FormItem className="mt-6 sm:mt-8">
                    <FormLabel className="text-sm sm:text-base font-semibold text-black">Địa chỉ</FormLabel>
                    <FormControl>
                      <Input placeholder="39 đường số 14" {...field} className="block min-w-0 grow py-2 sm:py-3 px-3 text-sm sm:text-base text-black placeholder:text-gray-400 bg-blue-50 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 shadow-sm transition-all" />
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
                  <FormItem className="mt-6 sm:mt-8">
                    <FormLabel className="text-sm sm:text-base font-semibold text-black">Phường</FormLabel>
                    <FormControl>
                      <Popover open={wardOpen} onOpenChange={setWardOpen} >
                        <PopoverTrigger asChild>
                          <Button
                            role="combobox"
                            aria-expanded={wardOpen}
                            className="w-full justify-between bg-blue-50 border border-blue-300 text-black rounded-lg shadow-sm hover:bg-blue-200 focus:ring-2 focus:ring-blue-400 transition-all"
                          >
                            {wardValue
                              ? options.find((option) => option.value === wardValue)?.label
                              : <span className="text-gray-400">Chọn phường</span>}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-[90vw] p-0 bg-white border border-blue-300 rounded-lg shadow-lg" onWheel={(e) => {
                          e.stopPropagation();
                        }}>

                          <Command className="bg-blue-50">
                            <CommandInput
                              placeholder="Chọn phường"
                              className="h-10 px-3 py-2 rounded-lg text-black "
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
                  <FormItem className="mt-6 sm:mt-8 ">
                    <div className="mb-3 sm:mb-4">
                      <FormLabel className=" text-sm sm:text-base font-semibold text-black">Dịch vụ nổi bật</FormLabel>
                      <FormDescription className="text-xs text-blue-500">
                        Chọn dịch vụ bạn muốn để hiển thị.
                      </FormDescription>
                    </div>
                    <div className="max-h-60 sm:max-h-72 md:max-h-80 overflow-y-auto pr-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 ">
                      {serviceOptions.map((item) => {
                        const checkboxId = `service-checkbox-${item.id}`;
                        const isChecked = Array.isArray(field.value) && field.value.includes(item.id);

                        const toggle = () => {
                          const currentValues = Array.isArray(field.value) ? field.value : [];
                          if (currentValues.includes(item.id)) {
                            field.onChange(currentValues.filter((v) => v !== item.id));
                          } else {
                            field.onChange([...currentValues, item.id]);
                          }
                        };

                        return (
                          <div
                            key={item.id}
                            role="checkbox"
                            aria-checked={isChecked}
                            tabIndex={0}
                            onClick={() => toggle()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggle();
                              }
                            }}
                            className={cn(
                              "flex flex-row items-center gap-2 rounded-lg px-3 py-2 sm:py-3 border transition-all",
                              isChecked ? "bg-blue-100 border-blue-500" : "bg-blue-50 border-blue-100 hover:bg-blue-100"
                            )}
                          >
                            <div onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                id={checkboxId}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const currentValues = Array.isArray(field.value) ? field.value : [];
                                  return checked
                                    ? field.onChange([...currentValues, item.id])
                                    : field.onChange(
                                      currentValues.filter((value) => value !== item.id)
                                    )
                                }}
                                className="accent-blue-500 focus:ring-2 focus:ring-blue-400"
                              />
                            </div>
                            <span className="text-sm font-normal text-black select-none">{item.name}</span>
                          </div>
                        );
                      })}
                      </div>
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
                    <FormItem className="mt-6 sm:mt-8">
                      <FormLabel className="text-sm sm:text-base font-semibold text-black">Thêm yêu cầu, góp ý, dịch vụ khác</FormLabel>
                      <FormControl>
                        <textarea {...field} id="message" rows={4} className="block p-3 w-full text-sm text-black bg-blue-50 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 placeholder:text-gray-400" placeholder="Nhập yêu cầu, góp ý, dịch vụ khác..." />
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
                  <FormItem className="mt-6 sm:mt-8">
                    <FormLabel className="text-sm sm:text-base font-semibold text-black">Danh mục</FormLabel>
                    <FormControl>
                      <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            role="combobox"
                            aria-expanded={categoryOpen}
                            className="w-full justify-between bg-blue-50 border border-blue-300 text-black rounded-lg shadow-sm hover:bg-blue-200 focus:ring-2 focus:ring-blue-400 transition-all"
                          >
                            {categoryValue
                              ? categoryOptions.find((opt) => opt.id === categoryValue)?.name
                              : <span className="text-gray-400">Chọn danh mục</span>}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-[90vw] p-0 bg-white border border-blue-300 rounded-lg shadow-lg" onWheel={(e) => {
                          e.stopPropagation();
                        }} >
                          <Command className="bg-blue-50">
                            <CommandInput
                              placeholder="Chọn danh mục"
                              className="bg-blue-50 text-blue-900 max-h-[40vh] overflow-y-auto"
                            />
                            <CommandList className="bg-blue-50 text-blue-900 max-h-48 overflow-y-auto">
                              <CommandEmpty>Không tìm thấy.</CommandEmpty>
                              <CommandGroup>
                                {categoryOptions.map((opt) => (
                                  <CommandItem
                                    key={opt.id}
                                    value={opt.id}
                                    onSelect={(currentValue) => {
                                      field.onChange(opt.id)
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
                  const files = Array.isArray(field.value) ? field.value : [];

                  return (
                    <FormItem className="mt-6 sm:mt-8">
                      <FormLabel className="text-sm sm:text-base font-semibold text-black">Thêm hình ảnh</FormLabel>
                      <FormControl>
                        <div
                          className="mt-2 flex justify-center rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 px-4 py-6 w-full cursor-pointer hover:bg-blue-100 transition-all"
                          onClick={() => fileInputRef.current?.click()} // use ref
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const selected = e.target.files ? Array.from(e.target.files) : [];
                              const merged = [...files, ...selected];
                              field.onChange(merged);
                              // allow re-selecting the same files
                              e.currentTarget.value = "";
                            }}
                          />

                          {files.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 sm:gap-4 w-full">
                              {/* Preview ảnh */}
                              {files.map((file, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="h-24 sm:h-28 md:h-32 w-full rounded-lg object-cover shadow-md border border-blue-200"
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
                                    className="absolute top-1 right-1 text-white rounded-full  opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-gray-800 bg-gray-500 "
                                  >
                                    <IoCloseOutline className="h-6 w-6" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center">
                              <PhotoIcon aria-hidden="true" className="mx-auto size-14 text-blue-300" />
                              <div className="mt-3 sm:mt-4 flex text-xs sm:text-sm text-blue-600 justify-center">
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