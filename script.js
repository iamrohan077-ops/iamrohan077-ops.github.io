// NovaWeb interactivity: theme, menu, scroll effects, counters, typing, toggles, form validation.
document.addEventListener("DOMContentLoaded", () => {
    const $ = (id) => document.getElementById(id);
    const $$ = (sel) => document.querySelectorAll(sel);

    /* ---------- Dark / light theme (remembered between pages) ---------- */
    const root = document.documentElement, themeBtn = $("themeToggle");
    const applyTheme = (t) => {
        root.setAttribute("data-theme", t);
        if (themeBtn) themeBtn.innerHTML = `<i class="fas fa-${t === "dark" ? "sun" : "moon"}"></i>`;
    };
    let saved = "light";
    try { saved = localStorage.getItem("novaweb-theme") || "light"; } catch (e) { /* storage unavailable */ }
    applyTheme(saved);
    themeBtn?.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
        try { localStorage.setItem("novaweb-theme", next); } catch (e) { /* ignore */ }
    });

    /* ---------- Mobile menu ---------- */
    const menuBtn = $("menuToggle"), navLinks = $("navLinks");
    if (menuBtn && navLinks) menuBtn.addEventListener("click", () => {
        menuBtn.setAttribute("aria-expanded", String(navLinks.classList.toggle("open")));
    });

    /* ---------- Run a callback once when elements scroll into view ---------- */
    const onVisible = (items, threshold, fn, fallback) => {
        if (!("IntersectionObserver" in window)) return items.forEach(fallback);
        const obs = new IntersectionObserver((entries, o) => entries.forEach((e) => {
            if (e.isIntersecting) { fn(e.target); o.unobserve(e.target); }
        }), { threshold });
        items.forEach((i) => obs.observe(i));
    };

    /* ---------- Scroll reveal ---------- */
    const show = (el) => el.classList.add("visible");
    onVisible($$(".reveal"), 0.15, show, show);

    /* ---------- Animated counters ---------- */
    const runCounter = (el) => {
        const target = Number(el.dataset.target), start = performance.now();
        const tick = (now) => {
            const p = Math.min((now - start) / 1500, 1);
            el.textContent = Math.floor(p * target);
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };
    onVisible($$(".stat-number"), 0.5, runCounter, (c) => { c.textContent = c.dataset.target; });

    /* ---------- Typing effect in the hero ---------- */
    const typed = $("typed");
    if (typed) {
        const words = typed.dataset.words.split(",");
        let w = 0, c = 0, deleting = false;
        const type = () => {
            const word = words[w];
            let delay;
            typed.textContent = word.substring(0, c);
            if (!deleting && c < word.length) { c++; delay = 90; }
            else if (!deleting) { deleting = true; delay = 1400; }
            else if (c > 0) { c--; delay = 45; }
            else { deleting = false; w = (w + 1) % words.length; delay = 300; }
            setTimeout(type, delay);
        };
        type();
    }

    /* ---------- Click-to-expand service cards ---------- */
    $$(".flip-card").forEach((card) => {
        const toggle = () => card.classList.toggle("open");
        card.addEventListener("click", toggle);
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
        });
    });

    /* ---------- FAQ accordion (one open at a time) ---------- */
    const faqItems = $$(".faq-item");
    faqItems.forEach((item) => {
        const btn = item.querySelector(".faq-question");
        btn.addEventListener("click", () => {
            const wasOpen = item.classList.contains("open");
            faqItems.forEach((o) => {
                o.classList.remove("open");
                o.querySelector(".faq-question").setAttribute("aria-expanded", "false");
            });
            if (!wasOpen) { item.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
        });
    });

    /* ---------- Back to top button ---------- */
    const topBtn = $("backToTop");
    if (topBtn) {
        window.addEventListener("scroll", () => topBtn.classList.toggle("show", window.scrollY > 300));
        topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    }

    /* ---------- Contact form: live validation and character counter ---------- */
    const form = $("contactForm");
    if (form) {
        const [nameIn, emailIn, msgIn] = ["name", "email", "message"].map($);
        const feedback = $("formFeedback"), charCount = $("charCount");

        const setState = (input, errId, msg) => {
            $(errId).textContent = msg;
            input.classList.toggle("invalid", msg !== "");
            input.classList.toggle("valid", msg === "" && input.value.trim() !== "");
            return msg === "";
        };
        // Feedback colour comes from CSS classes (no inline styles)
        const setFeedback = (text, type) => {
            feedback.textContent = text;
            feedback.classList.toggle("success", type === "success");
            feedback.classList.toggle("error", type === "error");
        };

        const checkName = () => setState(nameIn, "nameError", nameIn.value.trim().length < 2 ? "Please enter at least 2 characters." : "");
        const checkEmail = () => setState(emailIn, "emailError", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailIn.value.trim()) ? "" : "Please enter a valid email address.");
        const checkMessage = () => setState(msgIn, "messageError", msgIn.value.trim().length < 10 ? "Message must be at least 10 characters." : "");

        nameIn.addEventListener("input", checkName);
        emailIn.addEventListener("input", checkEmail);
        msgIn.addEventListener("input", () => { charCount.textContent = msgIn.value.length; checkMessage(); });

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            if ([checkName(), checkEmail(), checkMessage()].every(Boolean)) {
                setFeedback(`Thank you, ${nameIn.value.trim()}! Your message has been sent successfully.`, "success");
                form.reset();
                charCount.textContent = "0";
                [nameIn, emailIn, msgIn].forEach((i) => i.classList.remove("valid", "invalid"));
            } else {
                setFeedback("Please correct the highlighted fields and try again.", "error");
            }
        });
    }
});
