import httpx
import re
from .schemas import FundMeta, FundHistory, FundHistoryRow
from bs4 import BeautifulSoup
import re

async def get_basic_profile(code: str) -> dict:
    """
    抓取基金基本概况 (jbgk 页面) 的表格数据
    """
    url = f"https://fundf10.eastmoney.com/jbgk_{code}.html"
    headers = {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
        "Referer": f"https://fundf10.eastmoney.com/{code}.html"
    }

    async with httpx.AsyncClient(timeout=10, headers=headers) as client:
        r = await client.get(url)
        html = r.text

    soup = BeautifulSoup(html, "lxml")
    result: dict = {}

    # 顶部简介（包含 类型 / 管理人 / 资产规模）
    p = soup.find("p", string=re.compile(r"类型："))
    if p:
        text = p.get_text()
        m_type = re.search(r"类型：([^ 管]+)", text)
        m_mgr = re.search(r"管理人：([^ ]+)", text)
        m_size = re.search(r"资产规模：([0-9.]+)", text)
        if m_type: result["type"] = m_type.group(1)
        if m_mgr: result["company"] = m_mgr.group(1)
        if m_size: result["assetScale"] = m_size.group(1)

    # 表格数据 (成立日期, 管理费率, 托管费率, 分红方式等)
    table = soup.find("table", attrs={"class": "info w790"})
    if table:
        for tr in table.find_all("tr"):
            cells = [c.get_text(strip=True).rstrip("：")  # 去掉尾部的全角冒号
                    for c in tr.find_all(["th", "td"])]
            if len(cells) % 2:
                continue
            for i in range(0, len(cells), 2):
                result[cells[i]] = cells[i + 1]

    return result


UA = "Mozilla/5.0 Chrome/125 Safari/537.36"

async def get_history(code: str, pages: int = 10) -> FundHistory:
    rows = []
    async with httpx.AsyncClient(headers={"User-Agent": UA, "Referer": "https://fundf10.eastmoney.com"}) as client:
        for p in range(1, pages+1):
            url = f"https://api.fund.eastmoney.com/f10/lsjz?fundCode={code}&pageIndex={p}&pageSize=50"
            r = await client.get(url)
            data = r.json()
            for item in data["Data"]["LSJZList"]:
                if not item["DWJZ"]:
                    continue
                rows.append(FundHistoryRow(
                    date=item["FSRQ"],
                    nav=float(item["DWJZ"]),
                    accNav=float(item["LJJZ"]) if item["LJJZ"] else None,
                    dailyReturn=float(item["JZZZL"]) if item["JZZZL"] else None
                ))
    rows.sort(key=lambda r: r.date, reverse=True)
    return FundHistory(code=code, rows=rows)

async def get_meta(code: str) -> FundMeta:
    # url = f"https://fund.eastmoney.com/pingzhongdata/{code}.js"
    # async with httpx.AsyncClient(headers={"User-Agent": UA}) as client:
    #     r = await client.get(url)
    #     js = r.text
    # name = re.search(r'var fund_full_name\s*=\s*"(.*?)"', js)
    # if not name:
    #     name = re.search(r'var fS_name\s*=\s*"(.*?)"', js)

    basic = await get_basic_profile(code)

    return FundMeta(
        code=code,
        name=basic.get("基金简称"),
        type=basic.get("基金类型"),
        company=basic.get("基金托管人"),
        manager=basic.get("基金经理人") or None,
        scale=basic.get("资产规模"),
        trace=basic.get("跟踪标的")
    )
