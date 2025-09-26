"use client";

import { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { LuTag } from "react-icons/lu";
import { PiMapPinAreaLight } from "react-icons/pi";
import { LiaShoePrintsSolid } from "react-icons/lia";
import { useRouter } from "next/navigation";
import { placeApi } from "@/lib/place/placeApi";
import { checkinApi } from "@/lib/checkin/checkinApi";
import { AxiosError } from "axios";
import { HCMMapSVG } from "./HCMMapSVG";

type Status = "visited" | null;
interface Place {
  _id: string;
  name: string;
  address?: string;
  district?: string;
  ward?: { _id: string; name: string } | string | null;
  location?: { coordinates: [number, number] };
  images?: string[];
}

export default function HCMMap() {
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<Place | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [selectedPath, setSelectedPath] = useState<SVGPathElement | null>(null);

  const [regionStatus, setRegionStatus] = useState<
    Record<string, { status: Status; color: string }>
  >({});
  const [scale, setScale] = useState(1);

  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
  const mapRef = useRef<SVGSVGElement | null>(null);
  const router = useRouter();

  // random màu pastel
  const getRandomPastelColor = () => {
    const r = Math.floor(Math.random() * 127 + 127);
    const g = Math.floor(Math.random() * 127 + 127);
    const b = Math.floor(Math.random() * 127 + 127);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getColorByStatus = (
    statusObj: { status: Status; color: string } | undefined
  ) => {
    if (!statusObj) return "#D8D8D8";
    return statusObj.color;
  };

  const clampPopupPosition = (x: number, y: number) => {
    const padding = 20,
      popupWidth = 320,
      popupHeight = 220;
    const newX = Math.min(
      Math.max(x, padding),
      window.innerWidth - popupWidth - padding
    );
    const newY = Math.min(
      Math.max(y, padding),
      window.innerHeight - popupHeight - padding
    );
    return { x: newX, y: newY };
  };

  const normalize = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/^(xa|phuong|thi tran)\s+/i, "")
      .trim()
      .toLowerCase();

  const getWardName = (
    ward: string | { _id: string; name: string } | null | undefined
  ): string => {
    if (!ward) return "";
    if (typeof ward === "string") return ward;
    return ward.name;
  };

  // setup path click events
  useEffect(() => {
    const paths = document.querySelectorAll<SVGPathElement>("svg path");

    paths.forEach((path) => {
      const title = path.getAttribute("data-title") || "unknown";
      const normTitle = normalize(title);
      const statusObj = regionStatus[normTitle];

      path.style.fill = getColorByStatus(statusObj);
      path.style.stroke = "#0c5feeff";
      path.style.strokeWidth = "0.5";
      path.style.transition = "fill 0.3s ease";

      // Hover
      path.onmouseenter = () => {
        setHoveredName(title);
        path.style.fill = getRandomPastelColor();
      };

      path.onmouseleave = () => {
        setHoveredName(null);
        setMousePos(null);
        path.style.fill = getColorByStatus(regionStatus[normTitle]);
      };

      path.onmousemove = (e) =>
        setMousePos({ x: e.clientX + 15, y: e.clientY + 15 });

      // Click
      path.onclick = async (e) => {
        setSelectedPath(path);
        setSelectedName(title);
        setPopupPos(clampPopupPosition(e.clientX, e.clientY));

        try {
          const res = await placeApi.getAll();
          const places: Place[] = Array.isArray(res) ? res : res.places || [];

          const matched: Place | undefined = places.find((p: any) => {
            if (typeof p.ward === "string") {
              return normalize(p.ward).includes(normTitle);
            }
            if (typeof p.ward === "object" && p.ward?.name) {
              return normalize(p.ward.name).includes(normTitle);
            }
            return false;
          });

          if (matched) {
            setSelectedInfo(matched);
            const normWard = normalize(
              getWardName(matched.ward) || matched.name
            );
            setIsCheckedIn(!!regionStatus[normWard]?.status);
          } else {
            setSelectedInfo(null);
            setIsCheckedIn(false);
          }
        } catch (error) {
          console.error("Lỗi khi load place info:", error);
          setSelectedInfo(null);
          setIsCheckedIn(false);
        }
      };
    });
  }, [regionStatus]);

  const handleVisited = async () => {
    if (!selectedInfo) return;
    try {
      await checkinApi.createCheckin(selectedInfo._id, {
        note: `Check-in ${selectedInfo.name}`,   // luôn có note
        device: "Web App",                       // mặc định Web App
        imgList: [],                             // gửi mảng rỗng nếu không có ảnh
      });

      const normWard = normalize(
        getWardName(selectedInfo.ward) || selectedInfo.name
      );

      setRegionStatus((prev) => ({
        ...prev,
        [normWard]: {
          status: "visited",
          color: prev[normWard]?.color || getRandomPastelColor(),
        },
      }));

      setIsCheckedIn(true);
      setMessage(`Bạn đã check-in ${selectedInfo.name} thành công!`);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Chi tiết lỗi check-in:", error.response?.data);
        const errMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          JSON.stringify(error.response?.data) ||
          error.message;
        setMessage(`Lỗi khi check-in: ${errMsg}`);
      } else {
        setMessage("Đã xảy ra lỗi khi check-in.");
      }
    }
  };

  useEffect(() => {
    const fetchCheckins = async () => {
      try {
        const checkins = await checkinApi.getUserCheckins();

        const statusMap: Record<string, { status: Status; color: string }> = {};
        checkins.forEach((c: any) => {
          const wardName =
            c.ward || 
            (typeof c.placeId.ward === "object"
              ? c.placeId.ward.name
              : c.placeId.ward) ||
            c.placeId.name;

          const normWard = normalize(wardName);
          statusMap[normWard] = {
            status: "visited",
            color: getRandomPastelColor(),
          };
        });

        setRegionStatus(statusMap);
      } catch (error) {
        console.error("Lỗi khi load checkins:", error);
      }
    };

    fetchCheckins();
  }, []);

  const handleExplore = () => {
    if (selectedInfo?._id) {
      handleClosePopup();
      router.push(`/user/destination/${selectedInfo._id}`);
    }
  };

  const handleClosePopup = () => {
    setSelectedName(null);
    setPopupPos(null);
    setSelectedPath(null);
    setSelectedInfo(null);
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));
  const resetView = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-0 sm:px-4 mt-5 relative select-none">
      <div className="absolute -top-3 right-2 z-[9999] flex flex-col gap-2">
        <button
          onClick={zoomIn}
          className="shadow-md rounded p-2 hover:bg-gray-100"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          className="shadow-md rounded p-2 hover:bg-gray-100"
        >
          −
        </button>
        <button
          onClick={resetView}
          className="shadow-md rounded p-2 hover:bg-gray-100"
        >
          ⟳
        </button>
      </div>
      <HCMMapSVG
        mapRef={mapRef}
        scale={scale}
        translate={translate}
        isDragging={isDragging}
      />
      {hoveredName && mousePos && (
        <div
          className="fixed bg-white border border-gray-300 rounded-md px-2 py-1 text-sm shadow-md pointer-events-none z-50 max-w-[200px]"
          style={{ top: mousePos.y, left: mousePos.x }}
        >
          {hoveredName}
        </div>
      )}
      {popupPos && selectedName && (
        <div
          className="fixed bg-white p-5 rounded-xl shadow-lg z-50 min-w-[270px] w-[90%] max-w-[320px]"
          style={{ left: popupPos.x, top: popupPos.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClosePopup}
            className="absolute top-3 right-3 text-gray-500 hover:text-black"
          >
            <FaTimes size={18} />
          </button>

          <div className="flex items-start gap-2 mb-3">
            <div className="flex items-center justify-center w-8 h-8 border border-gray-400 rounded-md">
              <LuTag size={16} className="text-gray-600" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-base sm:text-lg">{selectedName}</h3>
              <p className="text-gray-500 text-xs sm:text-sm">
                {selectedInfo?.district ||
                  (typeof selectedInfo?.ward === "object"
                    ? selectedInfo?.ward?.name
                    : selectedInfo?.ward) ||
                  "Không rõ khu vực"}
              </p>
            </div>
          </div>
          <div className="flex justify-around gap-8 mt-4">
            {!isCheckedIn ? (
              <button
                onClick={handleVisited}
                className="flex flex-col items-center text-sm sm:text-base text-blue-500"
              >
                <div className="flex items-center justify-center w-10 h-10">
                  <LiaShoePrintsSolid
                    size={50}
                    className="text-blue-500"
                    stroke="currentColor"
                  />
                </div>
                <span className="mt-1 font-medium">Check-in</span>
              </button>
            ) : (
              <button
                disabled
                className="flex flex-col items-center text-sm sm:text-base text-blue-500 cursor-default"
              >
                <div className="flex items-center justify-center w-10 h-10">
                  <LiaShoePrintsSolid
                    size={50}
                    className="text-blue-500"
                    stroke="currentColor"
                  />
                </div>
                <span className="mt-1 font-medium">Đã check-in</span>
              </button>
            )}

            <button
              onClick={handleExplore}
              className="flex flex-col items-center text-sm sm:text-base text-blue-500"
            >
              <div className="flex items-center justify-center w-10 h-10">
                <PiMapPinAreaLight
                  size={55}
                  className="text-blue-500"
                  stroke="currentColor"
                />
              </div>
              <span className="mt-1 font-medium">Khám phá</span>
            </button>
          </div>
          {message && (
            <p className="mt-3 text-sm text-center text-gray-700">{message}</p>
          )}
        </div>
      )}
    </div>
  );
}
