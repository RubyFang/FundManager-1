from fastapi import FastAPI
from fastapi.responses import StreamingResponse, JSONResponse
from services.eastmoney import get_meta, get_history
from utils.csv_util import history_to_csv
import io

app = FastAPI()

@app.get("/fund/{code}/meta")
async def fund_meta(code: str):
    return await get_meta(code)

@app.get("/fund/{code}/history")
async def fund_history(code: str, pages: int = 10):
    return await get_history(code, pages)

@app.get("/fund/{code}/raw")
async def fund_raw(code: str, format: str = "json"):
    meta = await get_meta(code)
    history = await get_history(code)
    if format == "csv":
        csv_str = history_to_csv(history)
        return StreamingResponse(io.StringIO(csv_str),
                                 media_type="text/csv",
                                 headers={"Content-Disposition": f"attachment; filename={code}.csv"})
    return JSONResponse({"meta": meta.model_dump(), "history": history.model_dump()})