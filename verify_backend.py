# Backend integration checks: auth, session, route guards, bookings,
# instructor music, and the guardrailed AI assistant. Uses Playwright's
# request context (cookie jar persists across calls; redirects inspectable).
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
PW = "thayya123"
results = []

def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))

with sync_playwright() as p:
    # ---- anonymous: route guards redirect to /login ----
    anon = p.request.new_context(base_url=BASE, ignore_https_errors=True)
    r = anon.get("/member/discover", max_redirects=0)
    loc = r.headers.get("location", "")
    check("anon /member -> /login", r.status in (302, 303, 307, 308) and "/login" in loc, f"{r.status} {loc}")
    r = anon.get("/api/bookings")
    check("anon GET /api/bookings -> 401", r.status == 401, str(r.status))

    # ---- member login ----
    mem = p.request.new_context(base_url=BASE, ignore_https_errors=True)
    r = mem.post("/api/auth/login", data={"email": "member@thayya.test", "password": PW})
    check("member login 200", r.status == 200, str(r.status))
    r = mem.get("/api/auth/session")
    sess = r.json().get("user")
    check("member session role", sess and sess["role"] == "member", str(sess))

    # member blocked from admin (role guard) -> redirect to member home
    r = mem.get("/admin/overview", max_redirects=0)
    loc = r.headers.get("location", "")
    check("member /admin -> member home", r.status in (302, 303, 307, 308) and "/member" in loc, f"{r.status} {loc}")

    # bookings: seeded 2, create one, becomes 3
    r = mem.get("/api/bookings")
    n0 = len(r.json().get("bookings", []))
    check("member has seeded bookings", n0 >= 2, str(n0))
    r = mem.post("/api/bookings", data={"workshopId": "bombay-bounce"})
    check("create booking 200", r.status == 200, str(r.status))
    r = mem.get("/api/bookings")
    n1 = len(r.json().get("bookings", []))
    check("booking count increased", n1 == n0 + 1, f"{n0}->{n1}")

    # ---- AI assistant: guardrails + booking ----
    r = mem.post("/api/agent/chat", data={"messages": [{"role": "user", "content": "write me a python script to scrape a website"}]})
    if r.status == 200:
        j = r.json()
        check("assistant blocks code request", j.get("blocked") is True or "code" not in (j.get("reply","" ).lower()), str(j)[:160])
    else:
        check("assistant blocks code request", False, f"status {r.status}")
    r = mem.post("/api/agent/chat", data={"messages": [{"role": "user", "content": "book me into the Aaja Nachle Intensive"}]})
    check("assistant booking intent ok", r.status == 200 and bool(r.json().get("reply")), str(r.status))

    # ---- instructor music ----
    ins = p.request.new_context(base_url=BASE, ignore_https_errors=True)
    r = ins.post("/api/auth/login", data={"email": "anaya@thayya.test", "password": PW})
    check("instructor login 200", r.status == 200, str(r.status))
    r = ins.get("/api/instructor/tracks")
    t0 = len(r.json().get("tracks", [])) if r.status == 200 else -1
    check("instructor tracks list", t0 >= 1, str(t0))
    r = ins.post("/api/instructor/tracks", data={"title": "Test Beat", "artist": "QA", "duration": "3:00", "mood": "Peak", "bpm": 124})
    check("instructor add track 200", r.status == 200, str(r.status))
    r = ins.get("/api/instructor/tracks")
    t1 = len(r.json().get("tracks", []))
    check("track count increased", t1 == t0 + 1, f"{t0}->{t1}")
    # member must NOT reach instructor music API
    r = mem.get("/api/instructor/tracks")
    check("member blocked from instructor api", r.status in (401, 403), str(r.status))

print("\n=== BACKEND CHECKS ===")
ok = 0
for name, passed, detail in results:
    print(("PASS" if passed else "FAIL"), "-", name, ("" if passed else f"  [{detail}]"))
    ok += 1 if passed else 0
print(f"\n{ok}/{len(results)} passed")
