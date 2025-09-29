"use client";

import { useEffect, useRef } from "react";
import { FiBold, FiItalic, FiUnderline, FiImage, FiVideo, FiGlobe, FiUser } from "react-icons/fi";

interface PostFormProps {
  title: string;
  content: string;
  privacy: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onPrivacyClick: () => void;
}

export default function PostForm({
  title,
  content,
  privacy,
  onTitleChange,
  onContentChange,
  onPrivacyClick,
}: PostFormProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result.toString());
        } else {
          reject("Failed to read file");
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const insertImage = (url: string) => {
    execCommand(
      "insertHTML",
      `
      <figure class="editor-figure" contenteditable="false" style="margin:8px 0; text-align:center;">
        <img src="${url}" style="max-width:100%; border-radius:6px; display:inline-block;" />
      </figure>
      `
    );
  };

  const insertVideo = (url: string) => {
    execCommand(
      "insertHTML",
      `
      <figure class="editor-figure" contenteditable="false" style="margin:8px 0; text-align:center;">
        <video controls src="${url}" style="max-width:100%; border-radius:6px; display:inline-block;"></video>
      </figure>
      `
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageUrl = await readFileAsDataURL(file); 
    insertImage(imageUrl);
    e.target.value = "";
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const videoUrl = await readFileAsDataURL(file); 
    insertVideo(videoUrl);
    e.target.value = "";
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onContentChange((e.target as HTMLDivElement).innerHTML);
  };

  useEffect(() => {
    if (editorRef.current) {
      const isFocused =
        document.activeElement === editorRef.current ||
        editorRef.current.contains(document.activeElement);

      if (!isFocused && content !== editorRef.current.innerHTML) {
        editorRef.current.innerHTML = content || "";
      }
    }
  }, [content]);


  const renderPrivacyLabel = () => {
    switch (privacy) {
      case "public":
        return (
          <span className="flex items-center gap-1 font-medium">
            <FiGlobe /> Tất cả mọi người
          </span>
        );
      case "private":
        return (
          <span className="flex items-center gap-1 font-medium">
            <FiUser /> Chỉ mình bạn
          </span>
        );
      default:
        return "Không rõ";
    }
  };

  return (
    <div className="bg-[var(--background)] rounded-lg border border-[var(--gray-5)] p-5">
      <h3 className="font-bold mb-3 text-[var(--foreground)] pt-2">THÔNG TIN BÀI ĐĂNG</h3>

      <div className="flex items-center justify-between mb-2 pt-2">
        <label className="font-medium text-[var(--gray-2)]">Tiêu đề</label>
        <button
          type="button"
          onClick={onPrivacyClick}
          className="cursor-pointer px-3 py-1 bg-[#F9F9FC] border border-[var(--gray-5)] rounded-lg text-[var(--gray-2)] hover:bg-gray-100 flex items-center gap-1"
        >
          {renderPrivacyLabel()}
        </button>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="w-full bg-[#F9F9FC] border border-[var(--gray-5)] rounded-lg p-3 mb-4 outline-none focus:ring-2 focus:ring-[var(--primary)]"
      />

      <div className="flex justify-between items-center mb-2 pt-2">
        <span className="font-medium text-[var(--gray-2)]">Nội dung</span>
        <div className="flex gap-2 ">
          <button type="button" title="In đậm" className="cursor-pointer p-2 hover:bg-[var(--gray-6)] rounded" onClick={() => execCommand("bold")}>
            <FiBold />
          </button>
          <button type="button" title="In nghiêng" className="cursor-pointer p-2 hover:bg-[var(--gray-6)] rounded" onClick={() => execCommand("italic")}>
            <FiItalic />
          </button>
          <button type="button" title="Gạch chân" className="cursor-pointer p-2 hover:bg-[var(--gray-6)] rounded" onClick={() => execCommand("underline")}>
            <FiUnderline />
          </button>
          <button type="button" title="Thêm hình" className="cursor-pointer p-2 hover:bg-[var(--gray-6)] rounded" onClick={() => imageInputRef.current?.click()}>
            <FiImage />
          </button>
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <button type="button" title="Thêm video" className="cursor-pointer p-2 hover:bg-[var(--gray-6)] rounded" onClick={() => videoInputRef.current?.click()}>
            <FiVideo />
          </button>
          <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="w-full bg-[#F9F9FC] border border-[var(--gray-5)] rounded-lg p-3 outline-none focus:ring-2 focus:ring-[var(--primary)] h-[600px] overflow-y-auto"
        onInput={handleInput}
      />

      <style jsx global>{`
        .editor-figure img,
        .editor-figure video {
          max-width: 100%;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}