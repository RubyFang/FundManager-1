"use client";

import ReactECharts from "echarts-for-react";
import { useState } from "react";
import type { FundHistoryRow } from "@/types";

export default function FundChart({ rows }: { rows: FundHistoryRow[] }) {
  // 区间标签状态
  const [range, setRange] = useState<"10d" | "30d" | "60d" | "90d" | "all">(
    "10d"
  );

  // 处理区间筛选
  let filteredRows = rows;
  if (range === "10d") {
    filteredRows = [...rows]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10)
      .reverse();
  } else if (range === "30d") {
    filteredRows = [...rows]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30)
      .reverse();
  } else if (range === "60d") {
    filteredRows = [...rows]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 60)
      .reverse();
  } else if (range === "90d") {
    filteredRows = [...rows]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 90)
      .reverse();
  }
  // 按日期升序排列（从早到晚）
  const sortedRows = [...filteredRows].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  const dates = sortedRows.map((row) => row.date);
  const navData = sortedRows.map((row) => row.nav);
  // 构造 K 线数据（open, close, low, high）
  // 用前一天净值为 open，当前净值为 close，high/low 为两者最大/最小
  const klineData = sortedRows.map((row, idx, arr) => {
    const prevNav = idx === 0 ? row.nav : arr[idx - 1].nav;
    const open = prevNav;
    const close = row.nav;
    const high = Math.max(open, close);
    const low = Math.min(open, close);
    return [open, close, low, high];
  });

  // 用于动态设置 x 轴区间
  const [xRange, setXRange] = useState<{ min?: number; max?: number }>({});

  const option = {
    tooltip: { trigger: "axis" },
    legend: { data: ["单位净值", "日K线"] },
    grid: { left: "3%", right: "4%", bottom: 48, containLabel: true },
    xAxis: {
      type: "category",
      data: dates,
      name: "日期",
      axisLabel: { rotate: 45 },
      min: xRange.min,
      max: xRange.max,
    },
    yAxis: {
      type: "value",
      name: "净值",
      min: "dataMin",
    },
    // 用 slider 替代 brush
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: [0],
        start: 0,
        end: 100,
      },
    ],
    series: [
      {
        name: "单位净值",
        type: "line",
        data: navData,
        smooth: true,
        lineStyle: { color: "#8884d8" },
      },
      {
        name: "日K线",
        type: "candlestick",
        data: klineData,
        itemStyle: {
          color: "#f39c12",
          color0: "#4caf50",
          borderColor: "#f39c12",
          borderColor0: "#4caf50",
        },
      },
    ],
  };

  // 监听 brush 事件，自动缩放 x 轴
  const onEvents = {
    brushSelected: (params: any) => {
      const batch = params?.batch?.[0];
      if (batch && batch.selected && batch.selected[0]) {
        const indices = batch.selected[0].dataIndex;
        if (indices && indices.length > 0) {
          setXRange({ min: indices[0], max: indices[indices.length - 1] });
        }
      }
    },
    brush: (params: any) => {
      // 清除 brush 时恢复全区间
      if (params?.areas?.length === 0) {
        setXRange({});
      }
    },
  };

  return (
    <div className="w-full h-96 rounded-xl border bg-white p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold">基金净值走势</h2>
        <div className="flex gap-1">
          {["10d", "30d", "60d", "90d", "all"].map((label) => (
            <button
              key={label}
              className={`px-2 py-0.5 rounded text-xs border ${
                range === label ? "bg-blue-600 text-white" : "bg-white"
              }`}
              onClick={() => setRange(label as typeof range)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <ReactECharts
        option={option}
        style={{ width: "100%", height: "100%" }}
        onEvents={onEvents}
      />
    </div>
  );
}
