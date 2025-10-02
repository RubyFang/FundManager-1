"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import type { FundMeta } from "@/types";
import Link from "next/link";

export default function FundInfoTable({
  items,
  onView,
  onDelete,
  currentCode,
}: {
  items: FundMeta[];
  onView: (code: string) => void;
  onDelete: (code: string) => void;
  currentCode?: string;
}) {
  // 定义列
  const columns: ColumnDef<FundMeta>[] = [
    {
      header: "代码",
      accessorKey: "code",
      cell: (info) => (
        <span className="font-mono">{info.getValue() as string}</span>
      ),
    },
    {
      header: "名称",
      accessorKey: "name",
    },
    {
      header: "类型",
      accessorKey: "type",
      cell: (info) => info.getValue() || "-",
    },
    {
      header: "公司",
      accessorKey: "company",
      cell: (info) => info.getValue() || "-",
    },
    {
      header: "经理",
      accessorKey: "manager",
      cell: (info) => info.getValue() || "-",
    },
    {
      header: "规模",
      accessorKey: "scale",
      cell: (info) => info.getValue() || "-",
    },
    {
      header: "跟踪标的",
      accessorKey: "trace",
      cell: (info) => info.getValue() || "-",
    },
    {
      header: () => <span style={{ minWidth: 120 }}>操作</span>,
      id: "actions",
      cell: ({ row }) => {
        const fund = row.original;
        return (
          <div className="space-x-2" style={{ minWidth: 200 }}>
            <button
              onClick={() => onView(fund.code)}
              className={
                fund.code === currentCode
                  ? "px-2 py-1 rounded bg-blue-600 text-white"
                  : "px-2 py-1 rounded border"
              }
            >
              查看
            </button>
            <button
              onClick={() => onDelete(fund.code)}
              className="px-2 py-1 rounded-lg border bg-red-50 text-red-600"
            >
              删除
            </button>
            <a
              href={`/api/fund/${fund.code}/raw?format=csv`}
              className="px-2 py-1 rounded-lg border bg-gray-50"
            >
              下载CSV
            </a>
          </div>
        );
      },
    },
  ];

  // 初始化表格
  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-auto rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="p-2 text-left">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => {
              const code = row.original.code;
              return (
                <tr
                  key={row.id}
                  className="border-t cursor-pointer hover:bg-blue-50"
                >
                  {row.getVisibleCells().map((cell, idx) => {
                    // code 列用 Link 包裹
                    if (cell.column.id === "code") {
                      return (
                        <td key={cell.id} className="p-2">
                          <Link
                            href={`/fund/${code}`}
                            target="_blank"
                            className="inline-block px-2 py-1 rounded-lg font-bold text-blue-700 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 hover:text-blue-900 transition-all duration-150 shadow-sm"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </Link>
                        </td>
                      );
                    }
                    // 其他列正常渲染
                    return (
                      <td key={cell.id} className="p-2">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="p-6 text-center text-gray-500"
              >
                暂无基金
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
