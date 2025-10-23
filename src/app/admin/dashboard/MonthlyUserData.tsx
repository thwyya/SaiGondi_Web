"use client";
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Filler,
  ScriptableContext,
} from "chart.js";
import { Line } from "react-chartjs-2";
import api from "@/services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DayCount {
  _id: number;
  count: number;
}

interface MonthlyStats {
  currentMonth: DayCount[];
  previousMonth: DayCount[];
}

export default function MonthlyLineChart() {
  const [stats, setStats] = useState<MonthlyStats>({
    currentMonth: [],
    previousMonth: [],
  });

  useEffect(() => {
    api
      .get("/admin/stats/monthlyUsers")
      .then((res) => {
        const raw = res.data?.data || { thisMonth: [], lastMonth: [] };

        setStats({
          currentMonth: raw.thisMonth,
          previousMonth: raw.lastMonth,
        });
      })
      .catch((err) => {
        console.error("Lỗi lấy stats:", err);
      });
  }, []);

  const labels = Array.from({ length: 30 }, (_, i) => (i + 1).toString());
  const importantDays = [1, 5, 10, 15, 20, 25, 30];

  let cumulative = 0;
  const currentMonthData = labels.map((day) => {
    const found = stats.currentMonth.find((item) => item._id === Number(day));
    if (found) cumulative += found.count;
    return cumulative;
  });

  cumulative = 0;
  const previousMonthData = labels.map((day) => {
    const found = stats.previousMonth.find((item) => item._id === Number(day));
    if (found) cumulative += found.count;
    return cumulative;
  });

  const maxValue = Math.max(...currentMonthData, ...previousMonthData, 0);
  const stepSize = Math.ceil(maxValue / 5) || 1;

  const data = {
    labels,
    datasets: [
      {
        label: "Tháng này",
        data: currentMonthData,
        borderColor: "#307AFD",
        backgroundColor: (context: ScriptableContext<"line">) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return undefined;

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top
          );
          gradient.addColorStop(0, "#F6F7FA");
          gradient.addColorStop(0.5, "#EEF2FA");

          return gradient;
        },
        fill: true,
        tension: 0.5,
        pointRadius: 0, // bỏ chấm tròn
        borderWidth: 1,
        order: 2,
      },
      {
        label: "Tháng trước",
        data: previousMonthData,
        borderColor: "#FFB226",
        fill: false,
        tension: 0.5,
        pointRadius: 0, // bỏ chấm tròn
        borderWidth: 1,
        borderDash: [3, 3],
        order: 1,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = Number(context.raw);
            return value + " người";
          },
        },
      },
      datalabels: {
        display: false, // tắt số hiển thị trực tiếp trên line
      },
    },
    scales: {
      x: {
        ticks: {
          callback: (val, index, ticks) => {
            const day = Number(ticks[index].value);
            return importantDays.includes(day)
              ? day < 10
                ? "0" + day
                : day.toString()
              : "";
          },
          autoSkip: false,
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize,
          callback: (val) => val + " ",
        },
        suggestedMax: maxValue + stepSize,
        grid: { display: false },
      },
    },
  };

  return (
    <div className="w-full overflow-hidden mt-6">
      <div className="flex items-center gap-6">
        <h3 className="font-bold m-4 border-r pr-6 border-gray-300">
          Tổng hợp người dùng
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full mr-1 bg-(--primary)"></div>
          <h4>Tháng này</h4>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full mr-1 bg-(--secondary)"></div>
          <h4>Tháng trước</h4>
        </div>
      </div>
      <Line options={options} data={data} className="max-h-[300px]" />
    </div>
  );
}
