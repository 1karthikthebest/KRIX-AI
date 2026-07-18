// Hardcoded Clerk Configuration Keys
const CLERK_PUBLISHABLE_KEY = "pk_test_YWJvdmUta29pLTIwLmNsZXJrLmFjY291bnRzLmRldiQ";
const REDIRECT_TARGET_URL = "https://your-destination-website.com"; 

const canvas = document.getElementById('spaceBg');
const ctx = canvas.getContext('2d');
let stars = [];
let Clerk = null;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
}

function initStars() {
    stars = [];
    const starCount = Math.min(160, Math.floor(window.innerWidth / 9));
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5,
            opacity: Math.random(),
            twinkleSpeed: Math.random() * 0.006 + 0.002
        });
    }
}

function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#020205';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        star.opacity += star.twinkleSpeed;
        if (star.opacity > 1 || star.opacity < 0) {
            star.twinkleSpeed = -star.twinkleSpeed;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, star.opacity)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });

    const moonX = canvas.width * 0.84;
    const moonY = canvas.height * 0.22;
    const moonRadius = Math.min(65, canvas.width * 0.05);

    if (moonRadius > 15) {
        const shadowGlow = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.9, moonX, moonY, moonRadius * 1.4);
        shadowGlow.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        shadowGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = shadowGlow;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.clip();

        ctx.beginPath();
        ctx.arc(moonX - moonRadius * 0.38, moonY, moonRadius, 0, Math.PI * 2);
        ctx.rect(moonX - moonRadius * 2, moonY - moonRadius * 2, moonRadius * 4, moonRadius * 4);
        ctx.fillStyle = 'rgba(252, 251, 248, 0.9)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffffff';
        ctx.fill('evenodd');
        ctx.restore();
    }

    const horizonY = canvas.height * 0.85;
    const floorGradient = ctx.createLinearGradient(0, horizonY, 0, canvas.height);
    floorGradient.addColorStop(0, 'rgba(2, 2, 5, 0.98)');
    floorGradient.addColorStop(1, 'rgba(1, 1, 3, 1)');
    ctx.fillStyle = floorGradient;
    ctx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.lineWidth = 1;
    for (let x = -canvas.width; x < canvas.width * 2; x += 40) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, horizonY);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(canvas.width, horizonY);
    ctx.stroke();

    requestAnimationFrame(drawBackground);
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', () => {
    resizeCanvas();
    drawBackground();
    initializeClerkInstance();
});

function togglePassword(id) {
    const el = document.getElementById(id);
    el.type = el.type === "password" ? "text" : "password";
}

function triggerToast(text, level = "info") {
    const toast = document.createElement('div');
    toast.className = "fixed top-6 left-1/2 transform -translate-x-1/2 bg-zinc-950/95 border border-white/10 px-5 py-3.5 rounded-2xl shadow-glass-glow z-[99999] flex items-center gap-3 max-w-sm w-11/12 text-xs text-gray-200 transition-all duration-300";
    
    let color = "text-brandTeal";
    let icon = "shield-alert";
    
    if (level === "success") {
        color = "text-brandNeon";
        icon = "shield-check";
    } else if (level === "error") {
        color = "text-red-500";
        icon = "shield-alert";
    }

    toast.innerHTML = `
        <i data-lucide="${icon}" class="w-5 h-5 ${color} flex-shrink-0"></i>
        <span class="font-medium">${text}</span>
    `;
    document.body.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        toast.classList.add('opacity-0', 'scale-95');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function setLoaderState(isActive) {
    const loader = document.getElementById('cardLoader');
    if (isActive) {
        loader.classList.remove('pointer-events-none');
        loader.classList.add('opacity-100');
    } else {
        loader.classList.add('pointer-events-none');
        loader.classList.remove('opacity-100');
    }
}

function transitionTo(state) {
    const states = ['loginState', 'signupState', 'verifyState', 'forgotPasswordState', 'resetPasswordState', 'protectedState'];
    states.forEach(s => {
        const doc = document.getElementById(s);
        if (doc) doc.classList.add('hidden');
    });

    const current = document.getElementById(`${state}State`);
    if (current) current.classList.remove('hidden');
    lucide.createIcons();
}

async function initializeClerkInstance() {
    const script = document.createElement('script');
    script.setAttribute('data-clerk-publishable-key', CLERK_PUBLISHABLE_KEY);
    script.src = 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js';
    script.async = true;
    
    script.onload = async () => {
        try {
            if (typeof window.Clerk === 'function') {
                Clerk = new window.Clerk(CLERK_PUBLISHABLE_KEY);
            } else {
                Clerk = window.Clerk;
            }
            
            await Clerk.load();
            
            const indicator = document.getElementById('clerkIndicator');
            indicator.className = "text-[9px] px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 font-bold tracking-widest uppercase";
            indicator.innerHTML = `<span class="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span> Clerk Live`;

            Clerk.addListener(({ session }) => {
                if (session) {
                    document.getElementById('userEmailDisplay').textContent = session.user.primaryEmailAddress.emailAddress;
                    transitionTo('protected');
                    triggerToast("Handshake complete. Redirecting...", "success");
                    
                    setTimeout(() => {
                        window.location.href = REDIRECT_TARGET_URL;
                    }, 800);
                } else {
                    transitionTo('login');
                }
            });

        } catch (err) {
            triggerToast(`Clerk Boot Error: ${err.message}`, "error");
        }
    };
    document.head.appendChild(script);
}

async function onLoginSubmit(event) {
    event.preventDefault();
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value;

    setLoaderState(true);
    try {
        const signIn = await Clerk.signIn.create({ identifier, password });
        if (signIn.status === "complete") {
            await Clerk.setActive({ session: signIn.createdSessionId });
        } else {
            triggerToast(`Further action required: ${signIn.status}`, "error");
        }
    } catch (err) {
        triggerToast(err.errors ? err.errors[0].longMessage : err.message, "error");
    } finally {
        setLoaderState(false);
    }
}

async function onSignupSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    setLoaderState(true);
    try {
        const nameParts = name.split(' ');
        const signUp = await Clerk.signUp.create({
            emailAddress: email,
            password,
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(' ') || ""
        });
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        document.getElementById('verificationSentEmail').textContent = email;
        transitionTo('verify');
        triggerToast("Verification key dispatched.", "success");
    } catch (err) {
        triggerToast(err.errors ? err.errors[0].longMessage : err.message, "error");
    } finally {
        setLoaderState(false);
    }
}

async function onVerifySubmit(event) {
    event.preventDefault();
    const code = document.getElementById('verificationCode').value.trim();

    setLoaderState(true);
    try {
        const verificationResult = await Clerk.signUp.attemptEmailAddressVerification({ code });
        if (verificationResult.status === "complete") {
            await Clerk.setActive({ session: verificationResult.createdSessionId });
        } else {
            triggerToast(`Step required: ${verificationResult.status}`, "error");
        }
    } catch (err) {
        triggerToast(err.errors ? err.errors[0].longMessage : err.message, "error");
    } finally {
        setLoaderState(false);
    }
}

async function onForgotPasswordSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('forgotEmail').value.trim();

    setLoaderState(true);
    try {
        const signInAttempt = await Clerk.signIn.create({ identifier: email });
        await signInAttempt.prepareFirstFactor({ strategy: "reset_password_email_code" });
        transitionTo('resetPassword');
        triggerToast("Recovery OTP transmitted.", "success");
    } catch (err) {
        triggerToast(err.errors ? err.errors[0].longMessage : err.message, "error");
    } finally {
        setLoaderState(false);
    }
}

async function onResetPasswordSubmit(event) {
    event.preventDefault();
    const code = document.getElementById('resetCode').value.trim();
    const password = document.getElementById('resetNewPassword').value;

    setLoaderState(true);
    try {
        const result = await Clerk.signIn.attemptFirstFactor({
            strategy: "reset_password_email_code",
            code,
            password
        });
        if (result.status === "complete") {
            await Clerk.setActive({ session: result.createdSessionId });
        } else {
            triggerToast(`Verification Pending: ${result.status}`, "error");
        }
    } catch (err) {
        triggerToast(err.errors ? err.errors[0].longMessage : err.message, "error");
    } finally {
        setLoaderState(false);
    }
}

async function onSocialLogin(provider) {
    try {
        await Clerk.signIn.authenticateWithRedirect({
            strategy: provider,
            redirectUrl: window.location.href,
            redirectUrlComplete: window.location.href
        });
    } catch (err) {
        triggerToast(err.message, "error");
    }
}
