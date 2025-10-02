from services.schemas import FundHistory

def history_to_csv(history: FundHistory) -> str:
    lines = ["date,nav,accNav,dailyReturn"]
    for r in history.rows:
        lines.append(f"{r.date},{r.nav},{r.accNav or ''},{r.dailyReturn or ''}")
    return "\n".join(lines)
