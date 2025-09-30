"use client";
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import api from "@/services/api";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryStat {
  id: string;
  name: string;
  count: number;
  views: number;
}

const CategoryChart: React.FC = () => {
  const [categories, setCategories] = useState<CategoryStat[]>([]);

  useEffect(() => {
    api
      .get("/admin/stats/categories")
      .then((res) => {
        setCategories(res.data?.data || []);
      })
      .catch((err) => {
        console.error("Lỗi lấy category stats:", err);
      });
  }, []);

  const total = categories.reduce((sum, item) => sum + (item.count || 0), 0);

  const labels = categories.map((item) => item.name);
  const data = categories.map((item) => item.count);

  const colors = [
    "#307AFD",
    "#FFB226",
    "#94E9B8",
    "#AEC7ED",
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
  ];

  const pieData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 1,
        borderColor: "#fff",
        borderRadius: 3,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "55%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  return (
    <div className="w-full rounded-xl p-4">
      <h4 className="font-bold mb-4 text-base sm:text-lg">Các danh mục</h4>
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        
        <div className="flex justify-center md:justify-center w-full md:w-1/3">
          <div className="w-40 sm:w-48 md:w-56 lg:w-52">
            <Pie data={pieData} options={options} />
          </div>
        </div>

        <div className="py-20 flex flex-col gap-2 w-full md:w-auto">
          {categories.map((item, idx) => {
            const percent =
              total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
            return (
              <div key={item.id} className="flex items-center text-sm">
                <span
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: colors[idx] }}
                />
                <span className="mr-2">{item.name}</span>
                <span className="text-gray-600">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryChart;
