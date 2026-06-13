# End-to-end feature verification against the live Supabase DB.
# Exercises the wired controls across all three portals and the cross-portal
# create-workshop -> discover -> book loop. Mutates demo data; re-seed after.
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
PW = "thayya123"
results = []

def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))

with sync_playwright() as p:
    member = p.request.new_context(base_url=BASE, ignore_https_errors=True)
    instr = p.request.new_context(base_url=BASE, ignore_https_errors=True)
    admin = p.request.new_context(base_url=BASE, ignore_https_errors=True)
    member.post("/api/auth/login", data={"email": "member@thayya.test", "password": PW})
    instr.post("/api/auth/login", data={"email": "anaya@thayya.test", "password": PW})
    admin.post("/api/auth/login", data={"email": "admin@thayya.test", "password": PW})

    # ---- 1. every portal page renders 200 (catches server-component query bugs) ----
    pages = {
        member: ["/member/discover", "/member/instructor?id=anaya", "/member/book?workshopId=aaja-nachle-intensive", "/member/bookings", "/member/membership"],
        instr: ["/instructor/today", "/instructor/workshops", "/instructor/students", "/instructor/earnings", "/instructor/public", "/instructor/library", "/instructor/music"],
        admin: ["/admin/overview", "/admin/content", "/admin/instructors", "/admin/commission", "/admin/members"],
    }
    for ctx, urls in pages.items():
        for u in urls:
            r = ctx.get(u)
            check(f"page {u} 200", r.status == 200, str(r.status))

    # ---- 2. instructor creates a workshop -> appears in Discover -> bookable ----
    import time
    starts = int(time.time() * 1000) + 10 * 86400000
    r = instr.post("/api/instructor/workshops", data={
        "title": "QA Verify Workshop", "date": "Fri 20 Jun", "time": "7:00 PM",
        "venue": "QA Studio", "price": 700, "capacity": 20, "startsAt": starts})
    check("instructor create workshop 200", r.status == 200, str(r.status))
    new_id = r.json().get("workshop", {}).get("id") if r.status == 200 else None
    check("new workshop has id", bool(new_id), str(new_id))

    r = instr.get("/api/instructor/workshops")
    titles = [w.get("title") for w in (r.json().get("workshops", []) if r.status == 200 else [])]
    check("workshop in instructor list", "QA Verify Workshop" in titles, str(titles[:3]))

    # appears in member Discover (server-rendered HTML)
    html = member.get("/member/discover").text()
    check("new workshop shows in Discover", "QA Verify Workshop" in html, "not found in discover html")

    # member books the new workshop
    if new_id:
        r = member.post("/api/bookings", data={"workshopId": new_id})
        check("member books new workshop 200", r.status == 200, str(r.status))

    # ---- 3. member follow / unfollow ----
    r = member.post("/api/member/follows", data={"instructorId": "rohan"})
    check("follow 200", r.status == 200, str(r.status))
    r = member.delete("/api/member/follows", data={"instructorId": "rohan"})
    check("unfollow 200", r.status == 200, str(r.status))

    # ---- 4. member cancel a booking ----
    r = member.get("/api/bookings")
    bks = r.json().get("bookings", []) if r.status == 200 else []
    if bks:
        bid = bks[0]["id"]
        r = member.delete(f"/api/bookings/{bid}")
        check("cancel booking 200", r.status == 200, str(r.status))
        r2 = member.get("/api/bookings")
        ids = [b["id"] for b in r2.json().get("bookings", [])]
        check("cancelled booking gone", bid not in ids, "still present")

    # ---- 5. instructor payout cap (huge request capped to balance, not error) ----
    r = instr.post("/api/instructor/payouts", data={"amount": 999999999})
    if r.status == 200:
        amt = r.json().get("payout", {}).get("amount", 0)
        check("payout capped to balance", amt < 999999999, f"amount={amt}")
    else:
        # 400 only acceptable if balance is zero
        check("payout capped or no-balance", r.status == 400, str(r.status))

    # ---- 6. admin payout state machine ----
    r = admin.get("/api/admin/payouts")
    payouts = r.json().get("payouts", []) if r.status == 200 else []
    check("admin payouts list", len(payouts) >= 1, str(len(payouts)))
    pend = next((x for x in payouts if x["status"] == "pending"), None)
    if pend:
        r = admin.patch(f"/api/admin/payouts/{pend['id']}", data={"to": "approved"})
        check("payout pending->approved 200", r.status == 200, str(r.status))
        r = admin.patch(f"/api/admin/payouts/{pend['id']}", data={"to": "settled"})
        check("payout approved->settled 200", r.status == 200, str(r.status))
        r = admin.patch(f"/api/admin/payouts/{pend['id']}", data={"to": "approved"})
        check("invalid transition settled->approved 400", r.status == 400, str(r.status))

    # ---- 7. admin content drops CRUD ----
    r = admin.post("/api/admin/content", data={"name": "QA Drop", "note": "qa", "videosCount": 2, "audioCount": 3, "status": "Planning"})
    check("content create 200", r.status == 200, str(r.status))
    drop_id = r.json().get("drop", {}).get("id") or r.json().get("contentDrop", {}).get("id") if r.status == 200 else None
    if not drop_id and r.status == 200:
        # tolerate different key name
        j = r.json()
        drop_id = (j.get("drop") or j.get("contentDrop") or j.get("item") or {}).get("id")
    if drop_id:
        r = admin.patch(f"/api/admin/content/{drop_id}", data={"status": "Live"})
        check("content update 200", r.status == 200, str(r.status))
        r = admin.delete(f"/api/admin/content/{drop_id}")
        check("content delete 200", r.status == 200, str(r.status))

    # ---- 8. admin commission validation ----
    r = admin.patch("/api/admin/commission", data={"instructor": 60, "platform": 50})
    check("commission bad sum 400", r.status == 400, str(r.status))
    r = admin.patch("/api/admin/commission", data={"instructor": 75, "platform": 25})
    check("commission good 200", r.status == 200, str(r.status))

    # ---- 9. role isolation: member cannot hit admin/instructor APIs ----
    check("member blocked from admin payouts", member.get("/api/admin/payouts").status in (401, 403), "")
    check("member blocked from instructor workshops", member.get("/api/instructor/workshops").status in (401, 403), "")

print("\n=== FEATURE CHECKS ===")
ok = 0
for name, passed, detail in results:
    print(("PASS" if passed else "FAIL"), "-", name, ("" if passed else f"  [{detail}]"))
    ok += 1 if passed else 0
print(f"\n{ok}/{len(results)} passed")
