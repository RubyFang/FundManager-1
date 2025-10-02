"use client";
import { useEffect, useState } from "react";
import FundChart from "@/components/FundChart";
import FundInfoTable from "@/components/FundInfoTable";
import LiveToggle from "@/components/LiveToggle";
import type { FundMeta, FundHistory, FundHistoryRow } from "@/types";

export default function Page() {
  const [code, setCode] = useState("");
  const [meta, setMeta] = useState<FundMeta | null>(null);
  const [history, setHistory] = useState<FundHistory | null>(null);
  const [live, setLive] = useState(false);
  const [queryRecords, setQueryRecords] = useState<string[]>([]);
  const [metaList, setMetaList] = useState<FundMeta[]>([]);

  // 查询并缓存结果
  async function loadFund(c: string) {
    // 先尝试从 localStorage 读取
    const metaCache = localStorage.getItem(`fund_meta_${c}`);
    const historyCache = localStorage.getItem(`fund_history_${c}`);
    let m: FundMeta | null = null;
    let h: FundHistory | null = null;
    if (metaCache && historyCache) {
      try {
        m = JSON.parse(metaCache);
        h = JSON.parse(historyCache);
      } catch {}
    }
    if (!m || !h) {
      m = await fetch(`/api/fund/${c}/meta`).then((r) => r.json());
      h = await fetch(`/api/fund/${c}/history?pages=10`).then((r) => r.json());
      localStorage.setItem(`fund_meta_${c}`, JSON.stringify(m));
      localStorage.setItem(`fund_history_${c}`, JSON.stringify(h));
    }
    setMeta(m);
    setHistory(h);
    // 更新查询记录
    setQueryRecords((prev) => {
      const next = [c, ...prev.filter((item) => item !== c)].slice(0, 5);
      localStorage.setItem("fund_query_records", JSON.stringify(next));
      return next;
    });
    // 更新 metaList
    if (m) {
      setMetaList((prev) => {
        const exists = prev.find((item) => item.code === m.code);
        const next = exists ? prev : [...prev, m];
        localStorage.setItem("fund_meta_list", JSON.stringify(next));
        return next;
      });
    }
  }
  console.log(history?.rows);

  useEffect(() => {
    // 初始化查询记录和 metaList
    const records = localStorage.getItem("fund_query_records");
    if (records) {
      const arr = JSON.parse(records);
      setQueryRecords(arr);
      // 自动加载最后一次查询的基金
      if (arr.length > 0) {
        const lastCode = arr[0];
        const metaCache = localStorage.getItem(`fund_meta_${lastCode}`);
        const historyCache = localStorage.getItem(`fund_history_${lastCode}`);
        if (metaCache && historyCache) {
          try {
            setMeta(JSON.parse(metaCache));
            setHistory(JSON.parse(historyCache));
          } catch {}
        }
      }
    }
    const metaListCache = localStorage.getItem("fund_meta_list");
    if (metaListCache) {
      setMetaList(JSON.parse(metaListCache));
    }
  }, []);

  useEffect(() => {
    if (!live || !meta) return;
    const t = setInterval(() => loadFund(meta.code), 60000);
    return () => clearInterval(t);
  }, [live, meta]);

  return (
    <main className="p-6 space-y-6 max-w-6xl mx-auto">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">户部</h1>
        <LiveToggle enabled={live} setEnabled={setLive} />
      </header>

      <section className="flex gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="输入基金代码"
          className="flex-1 rounded-xl border bg-white px-3 py-2"
        />
        <button
          onClick={() => loadFund(code)}
          className="px-4 py-2 rounded-xl border bg-blue-600 text-white"
        >
          加载
        </button>
      </section>

      {meta && history && (
        <>
          <FundChart rows={history.rows} />
          <FundInfoTable
            items={metaList}
            onView={(code) => loadFund(code)}
            onDelete={(code) => {
              // 删除 metaList 中对应项
              setMetaList((prev) => {
                const next = prev.filter((item) => item.code !== code);
                localStorage.setItem("fund_meta_list", JSON.stringify(next));
                return next;
              });
              // 删除 localStorage 缓存
              localStorage.removeItem(`fund_meta_${code}`);
              localStorage.removeItem(`fund_history_${code}`);
              // 如果当前展示的就是被删的 code，则清空
              if (meta?.code === code) {
                setMeta(null);
                setHistory(null);
              }
            }}
            currentCode={meta?.code}
          />
          {/* 查询记录展示 */}
          {queryRecords.length > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              最近查询：{queryRecords.join("、")}
            </div>
          )}
        </>
      )}
    </main>
  );
}
