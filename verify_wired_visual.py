import os
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
OUT = os.path.join(os.path.dirname(__file__), "shots", "wired")
os.makedirs(OUT, exist_ok=True)
PW = "thayya123"

def login(ctx, email):
    ctx.request.post(f"{BASE}/api/auth/login", data={"email": email, "password": PW})

shots = {
    "anaya@thayya.test": ["/instructor/today", "/instructor/workshops", "/instructor/students", "/instructor/earnings"],
    "admin@thayya.test": ["/admin/overview", "/admin/commission", "/admin/members", "/admin/content"],
    "member@thayya.test": ["/member/discover", "/member/membership"],
}

with sync_playwright() as p:
    b = p.chromium.launch()
    for email, urls in shots.items():
        ctx = b.new_context(viewport={"width": 1366, "height": 1000}, ignore_https_errors=True)
        login(ctx, email)
        pg = ctx.new_page()
        for u in urls:
            pg.goto(BASE + u, wait_until="networkidle")
            pg.wait_for_timeout(700)
            slug = u.strip("/").replace("/", "-")
            pg.screenshot(path=os.path.join(OUT, f"{slug}.png"), full_page=True)
        ctx.close()
    b.close()
    print("shots in", OUT)
