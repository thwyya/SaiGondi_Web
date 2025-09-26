"use client";

import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels"; // ✅ plugin hiển thị số trên cột
import { getTopViewedPlaces, TopPlace } from "@/services/destinationService";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);

const TopPlacesBarChart: React.FC = () => {
  const [top6Places, setTop6Places] = useState<TopPlace[]>([]);

  useEffect(() => {
    getTopViewedPlaces()
      .then((data) => setTop6Places(data))
      .catch((err) => console.error("Lỗi lấy Top 6 places:", err));
  }, []);

  const labels = top6Places.map((item) =>
    item.name.length > 15 ? item.name.slice(0, 15) + "..." : item.name
  );

  const dataValues = top6Places.map((item) => item.viewCount);

  const colors = ["#9292FA", "#96E2D6", "#307AFD", "#FFB226", "#AEC7ED", "#8ACA90"];

  const barData = {
    labels,
    datasets: [
      {
        label: "Lượt xem",
        data: dataValues,
        backgroundColor: colors,
        borderRadius: 10,
        borderSkipped: false,
        barThickness: 40,       
        maxBarThickness: 50,   
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    indexAxis: "x",
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            if (typeof value !== "number") return "";
            return value >= 1000 ? (value / 1000).toFixed(1) + "k" : value.toString();
          },
        },
      },
      datalabels: {
        color: "#333",
        anchor: "end",
        align: "top",
        font: { weight: "bold", size: 12 },
        formatter: (value: number) =>
          value >= 1000 ? (value / 1000).toFixed(1) + "k" : value,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxTicksLimit: 6,
          autoSkip: false,
          maxRotation: 30,
          minRotation: 0,
          font: {
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            size: 11,
          },
          color: "#00000099",
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          maxTicksLimit: 5,
          font: { size: 13, weight: "bold" },
          callback: (value) => {
            const num = Number(value);
            return num >= 1000 ? num / 1000 + "K" : num;
          },
          color: "#00000099",
        },
      },
    },
  };

  return (
    <div className="w-full">
      <h3 className="m-4 font-bold">Top 6 địa điểm được xem nhiều nhất</h3>
      <div className="h-[220px]"> 
        <Bar data={barData} options={options} />
      </div>
    </div>
  );
};

export default TopPlacesBarChart;
