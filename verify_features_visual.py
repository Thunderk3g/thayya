# Visual capture of the new screens: login, signup, instructor music, and
# the AI assistant widget (opened + a message round-trip).
import os
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
OUT = os.path.join(os.path.dirname(__file__), "shots", "backend")
os.makedirs(OUT, exist_ok=True)
PW = "thayya123"

def login(ctx, email):
    r = ctx.request.post(f"{BASE}/api/auth/login", data={"email": email, "password": PW})
    assert r.status == 200, f"login {email} -> {r.status}"

with sync_playwright() as p:
    browser = p.chromium.launch()

    # public pages
    pub = browser.new_context(viewport={"width": 1280, "height": 900}, ignore_https_errors=True)
    pg = pub.new_page()
    pg.goto(f"{BASE}/login", wait_until="networkidle"); pg.wait_for_timeout(500)
    pg.screenshot(path=os.path.join(OUT, "login.png"))
    pg.goto(f"{BASE}/signup?role=instructor", wait_until="networkidle"); pg.wait_for_timeout(500)
    pg.screenshot(path=os.path.join(OUT, "signup.png"))
    pub.close()

    # instructor music (logged in)
    ins = browser.new_context(viewport={"width": 1280, "height": 1000}, ignore_https_errors=True)
    login(ins, "anaya@thayya.test")
    ip = ins.new_page()
    ip.goto(f"{BASE}/instructor/music", wait_until="networkidle"); ip.wait_for_timeout(800)
    ip.screenshot(path=os.path.join(OUT, "instructor-music.png"), full_page=True)
    ins.close()

    # member + assistant widget
    mem = browser.new_context(viewport={"width": 1280, "height": 900}, ignore_https_errors=True)
    login(mem, "member@thayya.test")
    mp = mem.new_page()
    mp.goto(f"{BASE}/member/discover", wait_until="networkidle"); mp.wait_for_timeout(1000)
    mp.screenshot(path=os.path.join(OUT, "member-with-launcher.png"))

    opened = False
    # try to open the assistant: a fixed bottom-right button
    for sel in [
        "[aria-label*='assistant' i]", "[aria-label*='chat' i]",
        "button[class*='launch' i]", "button[class*='fab' i]",
    ]:
        try:
            el = mp.locator(sel).first
            if el.count() and el.is_visible():
                el.click(); opened = True; break
        except Exception:
            pass
    if not opened:
        # fallback: click the last visible button on the page
        try:
            btns = mp.get_by_role("button")
            btns.nth(btns.count() - 1).click(); opened = True
        except Exception:
            pass

    if opened:
        mp.wait_for_timeout(700)
        mp.screenshot(path=os.path.join(OUT, "assistant-open.png"))
        # type a question into the assistant input and send
        try:
            box = mp.locator("textarea, input[type='text']").last
            box.fill("What classes are on this week?")
            box.press("Enter")
            mp.wait_for_timeout(2500)
            mp.screenshot(path=os.path.join(OUT, "assistant-reply.png"))
        except Exception as e:
            print("assistant input step skipped:", e)
    else:
        print("could not locate assistant launcher")

    print("opened assistant:", opened)
    mem.close()
    browser.close()
    print("screenshots in", OUT)
