# Portal screens validation — screenshots every portal route desktop +
# mobile, captures console/page errors, checks for horizontal overflow
# and banned words.
import os
import re
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
OUT = os.path.join(os.path.dirname(__file__), "shots", "portals")
os.makedirs(OUT, exist_ok=True)

ROUTES = [
    "/member/discover", "/member/instructor", "/member/book",
    "/member/bookings", "/member/membership",
    "/instructor/today", "/instructor/library", "/instructor/workshops",
    "/instructor/students", "/instructor/earnings", "/instructor/public",
    "/admin/overview", "/admin/content", "/admin/instructors",
    "/admin/commission", "/admin/members",
]

BANNED = re.compile(r"zumba|hiit|fitness", re.IGNORECASE)

failures = []

with sync_playwright() as p:
    browser = p.chromium.launch()
    for vp_name, w, h in [("desktop", 1440, 900), ("mobile", 390, 844)]:
        ctx = browser.new_context(viewport={"width": w, "height": h},
                                  device_scale_factor=1.5,
                                  is_mobile=(vp_name == "mobile"))
        page = ctx.new_page()
        errors = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append(str(e)))
        for route in ROUTES:
            errors.clear()
            page.goto(BASE + route, wait_until="networkidle")
            page.wait_for_timeout(700)

            slug = route.strip("/").replace("/", "-")
            page.screenshot(path=os.path.join(OUT, f"{slug}-{vp_name}.png"),
                            full_page=True)

            overflow = page.evaluate(
                "() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
            if overflow > 1:
                failures.append(f"{route} [{vp_name}]: horizontal overflow {overflow}px")

            text = page.evaluate("() => document.body.innerText")
            hits = sorted(set(BANNED.findall(text)))
            if hits:
                failures.append(f"{route} [{vp_name}]: banned words {hits}")

            if errors:
                failures.append(f"{route} [{vp_name}]: errors {errors[:2]}")
        ctx.close()
    browser.close()

if failures:
    print("FAIL")
    for f in failures:
        print(" -", f)
else:
    print(f"PASS — {len(ROUTES)} routes x desktop+mobile: no errors, no overflow, no banned words")
