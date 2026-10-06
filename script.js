"use strict";

/* ================================
   TAJPROFIT DEMO - SCRIPT.JS
   Educational / Frontend Demo Only
================================ */

let CurrentUser = null;
let CurrentTransactionType = "deposit";

const UsersKey = "TajProfitDemoUsers";
const SessionKey = "TajProfitDemoSession";

/* ================================
   Storage
================================ */

function GetUsers() {
    try {
        return JSON.parse(localStorage.getItem(UsersKey)) || [];
    } catch (error) {
        return [];
    }
}

function SaveUsers(users) {
    localStorage.setItem(UsersKey, JSON.stringify(users));
}

function GetCurrentUser() {
    const sessionPhone = localStorage.getItem(SessionKey);

    if (!sessionPhone) {
        return null;
    }

    const users = GetUsers();

    return users.find(user => user.phone === sessionPhone) || null;
}

function SaveCurrentUser(user) {
    const users = GetUsers();

    const index = users.findIndex(item => item.phone === user.phone);

    if (index !== -1) {
        users[index] = user;
    } else {
        users.push(user);
    }

    SaveUsers(users);

    CurrentUser = user;
}

/* ================================
   Modal
================================ */

function openModal(modalId) {
    const modal = document.getElementById(modalId);

    if (!modal) {
        return;
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    document.body.classList.add("overflow-hidden");
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);

    if (!modal) {
        return;
    }

    modal.classList.add("hidden");
    modal.classList.remove("flex");

    const openedModals = document.querySelectorAll(".fixed.inset-0.flex");

    if (openedModals.length === 0) {
        document.body.classList.remove("overflow-hidden");
    }
}

/* ================================
   Toast
================================ */

function ShowToast(message, type = "success") {
    const toast = document.getElementById("toastBox");
    const messageElement = document.getElementById("toastMessage");
    const iconElement = document.getElementById("toastIcon");

    if (!toast || !messageElement || !iconElement) {
        alert(message);
        return;
    }

    messageElement.textContent = message;

    if (type === "error") {
        iconElement.className = "fa-solid fa-xmark text-base";
    } else {
        iconElement.className = "fa-solid fa-check text-base";
    }

    toast.classList.remove(
        "translate-y-[-150%]",
        "opacity-0"
    );

    toast.classList.add(
        "translate-y-0",
        "opacity-100"
    );

    setTimeout(() => {
        toast.classList.remove(
            "translate-y-0",
            "opacity-100"
        );

        toast.classList.add(
            "translate-y-[-150%]",
            "opacity-0"
        );
    }, 3000);
}

/* ================================
   Register
================================ */

function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById("regName");
    const phone = document.getElementById("regPhone");
    const password = document.getElementById("regPass");
    const referral = document.getElementById("regRef");

    if (!name || !phone || !password) {
        return;
    }

    const UserName = name.value.trim();
    const UserPhone = phone.value.trim();
    const UserPassword = password.value;
    const ReferralCode = referral
        ? referral.value.trim()
        : "TAJ-786";

    if (UserName.length < 3) {
        ShowToast("Username must contain at least 3 characters.", "error");
        return;
    }

    if (UserPhone.length < 10) {
        ShowToast("Please enter a valid mobile number.", "error");
        return;
    }

    if (UserPassword.length < 6) {
        ShowToast("Password must contain at least 6 characters.", "error");
        return;
    }

    const users = GetUsers();

    const ExistingUser = users.find(
        user => user.phone === UserPhone
    );

    if (ExistingUser) {
        ShowToast("This mobile number is already registered.", "error");
        return;
    }

    const NewUser = {
        id: Date.now(),
        name: UserName,
        phone: UserPhone,
        password: UserPassword,
        referralCode: GenerateReferralCode(),
        referredBy: ReferralCode,
        balance: 0,
        plans: [],
        transactions: [],
        createdAt: new Date().toISOString()
    };

    users.push(NewUser);

    SaveUsers(users);

    localStorage.setItem(SessionKey, UserPhone);

    CurrentUser = NewUser;

    closeModal("registerModal");

    document.getElementById("regForm").reset();

    UpdateDashboard();

    ShowToast("Account created successfully.");
}

/* ================================
   Login
================================ */

function handleLogin(event) {
    event.preventDefault();

    const loginInput = document.getElementById("loginPhone");
    const passwordInput = document.getElementById("loginPass");

    if (!loginInput || !passwordInput) {
        return;
    }

    const loginValue = loginInput.value.trim();
    const password = passwordInput.value;

    const users = GetUsers();

    const user = users.find(item =>
        (item.phone === loginValue ||
            item.name.toLowerCase() === loginValue.toLowerCase()) &&
        item.password === password
    );

    if (!user) {
        ShowToast("Invalid username/mobile or password.", "error");
        return;
    }

    CurrentUser = user;

    const remember = document.getElementById("rememberMe");

    if (remember && remember.checked) {
        localStorage.setItem(SessionKey, user.phone);
    }

    closeModal("loginModal");

    document.getElementById("loginForm").reset();

    UpdateDashboard();

    ShowToast("Login successful.");
}

/* ================================
   Logout
================================ */

function handleLogout() {
    localStorage.removeItem(SessionKey);

    CurrentUser = null;

    UpdateDashboard();

    ShowToast("You have been logged out.");
}

/* ================================
   Dashboard
================================ */

function UpdateDashboard() {
    const user = CurrentUser || GetCurrentUser();

    CurrentUser = user;

    const dashboard = document.getElementById("userDashboardCard");
    const desktopAuth = document.getElementById("authActionsDesktop");
    const desktopProfile = document.getElementById("userProfileDesktop");

    if (!user) {
        if (dashboard) {
            dashboard.classList.add("hidden");
        }

        if (desktopAuth) {
            desktopAuth.classList.remove("hidden");
        }

        if (desktopProfile) {
            desktopProfile.classList.add("hidden");
            desktopProfile.classList.remove("flex");
        }

        return;
    }

    if (dashboard) {
        dashboard.classList.remove("hidden");
    }

    if (desktopAuth) {
        desktopAuth.classList.add("hidden");
    }

    if (desktopProfile) {
        desktopProfile.classList.remove("hidden");
        desktopProfile.classList.add("flex");
    }

    SetText("userNameDisplay", user.name);
    SetText("dashUserName", user.name);
    SetText("dashUserPhone", user.phone);

    SetText(
        "userBalanceDisplay",
        `PKR ${Number(user.balance || 0).toLocaleString()}`
    );

    SetText(
        "dashUserBalance",
        `PKR ${Number(user.balance || 0).toLocaleString()}`
    );

    SetText(
        "dashUserRef",
        user.referralCode
    );

    SetText(
        "refCodeBadge",
        user.referralCode
    );

    const referralInput = document.getElementById("refLinkInput");

    if (referralInput) {
        referralInput.value =
            `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(user.referralCode)}`;
    }

    RenderPlans();
    RenderTransactions();
}

/* ================================
   Helper
================================ */

function SetText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function GenerateReferralCode() {
    return "TAJ-" +
        Math.floor(100000 + Math.random() * 900000);
}

/* ================================
   Password
================================ */

function toggleRegPassword() {
    const input = document.getElementById("regPass");
    const icon = document.getElementById("regPassEye");

    if (!input || !icon) {
        return;
    }

    if (input.type === "password") {
        input.type = "text";
        icon.className = "fa-regular fa-eye-slash text-base";
    } else {
        input.type = "password";
        icon.className = "fa-regular fa-eye text-base";
    }
}

function toggleLoginPassword() {
    const input = document.getElementById("loginPass");
    const icon = document.getElementById("loginPassEye");

    if (!input || !icon) {
        return;
    }

    if (input.type === "password") {
        input.type = "text";
        icon.className = "fa-regular fa-eye-slash text-base";
    } else {
        input.type = "password";
        icon.className = "fa-regular fa-eye text-base";
    }
}

/* ================================
   Hero Button
================================ */

function handleHeroCTA() {
    if (CurrentUser) {
        document.getElementById("userDashboardCard")
            ?.scrollIntoView({
                behavior: "smooth"
            });

        return;
    }

    openModal("registerModal");
}

/* ================================
   Mobile Auth
================================ */

function handleMobileAuthBtn() {
    if (CurrentUser) {
        handleLogout();
        return;
    }

    openModal("loginModal");
}

/* ================================
   Plans
================================ */

function executeBuyPlan(planName, amount, dailyReturn, days) {
    if (!CurrentUser) {
        closeModal("plansModal");
        openModal("loginModal");

        ShowToast(
            "Please login before selecting a demo plan.",
            "error"
        );

        return;
    }

    const ConfirmPlan = confirm(
        `Demo plan selected:\n\n` +
        `${planName}\n` +
        `Amount: PKR ${amount.toLocaleString()}\n` +
        `Daily example: PKR ${dailyReturn.toLocaleString()}\n` +
        `Duration: ${days} days\n\n` +
        `This is a frontend demo. No real money will be charged.`
    );

    if (!ConfirmPlan) {
        return;
    }

    const plan = {
        id: Date.now(),
        name: planName,
        amount: amount,
        dailyReturn: dailyReturn,
        days: days,
        createdAt: new Date().toISOString(),
        status: "Demo"
    };

    CurrentUser.plans.push(plan);

    SaveCurrentUser(CurrentUser);

    closeModal("plansModal");

    UpdateDashboard();

    ShowToast(`${planName} added to your demo dashboard.`);
}

/* ================================
   Render Plans
================================ */

function RenderPlans() {
    const container = document.getElementById("dashActivePlans");

    if (!container || !CurrentUser) {
        return;
    }

    if (!CurrentUser.plans || CurrentUser.plans.length === 0) {
        container.innerHTML = `
            <p class="italic text-purple-300/70">
                No demo plans selected yet.
            </p>
        `;

        return;
    }

    container.innerHTML = CurrentUser.plans
        .slice()
        .reverse()
        .map(plan => `
            <div class="bg-purple-900/60 rounded-xl p-3 border border-purple-700">
                <div class="flex items-center justify-between gap-3">
                    <div>
                        <strong class="text-white">
                            ${EscapeHtml(plan.name)}
                        </strong>
                        <div class="text-[11px] text-purple-300">
                            PKR ${Number(plan.amount).toLocaleString()}
                            · ${plan.days} Days
                        </div>
                    </div>

                    <span class="text-[10px] px-2 py-1 rounded-full bg-amber-400/20 text-amber-300">
                        DEMO
                    </span>
                </div>
            </div>
        `)
        .join("");
}

/* ================================
   Transactions
================================ */

function openTransaction(type) {
    if (!CurrentUser) {
        openModal("loginModal");

        ShowToast(
            "Please login first.",
            "error"
        );

        return;
    }

    CurrentTransactionType = type;

    const title = document.getElementById("transTitle");
    const subtitle = document.getElementById("transSubtitle");
    const button = document.getElementById("transBtn");

    if (type === "withdraw") {
        if (title) {
            title.textContent = "Demo Withdrawal";
        }

        if (subtitle) {
            subtitle.textContent =
                "Frontend demonstration only. No real withdrawal is processed.";
        }

        if (button) {
            button.textContent = "Submit Demo Request";
        }
    } else {
        if (title) {
            title.textContent = "Demo Deposit";
        }

        if (subtitle) {
            subtitle.textContent =
                "Frontend demonstration only. No real payment is processed.";
        }

        if (button) {
            button.textContent = "Submit Demo Request";
        }
    }

    openModal("transModal");
}

function handleTransactionManual() {
    if (!CurrentUser) {
        closeModal("transModal");
        openModal("loginModal");
        return;
    }

    const amountInput = document.getElementById("transAmount");
    const referenceInput = document.getElementById("transRef");

    if (!amountInput || !referenceInput) {
        return;
    }

    const amount = Number(amountInput.value);
    const reference = referenceInput.value.trim();

    if (!amount || amount < 500) {
        ShowToast(
            "Enter an amount of at least PKR 500.",
            "error"
        );

        return;
    }

    if (!reference) {
        ShowToast(
            "Please enter the demo transaction reference.",
            "error"
        );

        return;
    }

    const method =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        )?.value || "Demo";

    const transaction = {
        id: Date.now(),
        type: CurrentTransactionType,
        amount: amount,
        method: method,
        reference: reference,
        status: "Demo",
        createdAt: new Date().toISOString()
    };

    CurrentUser.transactions.push(transaction);

    SaveCurrentUser(CurrentUser);

    document.getElementById("transForm")?.reset();

    closeModal("transModal");

    UpdateDashboard();

    ShowToast(
        `${CurrentTransactionType === "deposit" ? "Deposit" : "Withdrawal"} demo request saved.`
    );
}

/* ================================
   Transactions Display
================================ */

function RenderTransactions() {
    const container = document.getElementById("dashRecentTrans");

    if (!container || !CurrentUser) {
        return;
    }

    const transactions = CurrentUser.transactions || [];

    if (transactions.length === 0) {
        container.innerHTML = `
            <p class="italic text-purple-300/70">
                No demo transactions recorded.
            </p>
        `;

        return;
    }

    container.innerHTML = transactions
        .slice()
        .reverse()
        .slice(0, 10)
        .map(transaction => `
            <div class="flex items-center justify-between gap-3 border-b border-purple-800 pb-2">
                <div>
                    <strong class="text-white capitalize">
                        ${EscapeHtml(transaction.type)}
                    </strong>
                    <div class="text-[10px] text-purple-300">
                        ${EscapeHtml(transaction.method)}
                    </div>
                </div>

                <div class="text-right">
                    <strong class="text-amber-300">
                        PKR ${Number(transaction.amount).toLocaleString()}
                    </strong>

                    <div class="text-[9px] text-purple-300">
                        DEMO
                    </div>
                </div>
            </div>
        `)
        .join("");
}

/* ================================
   Referral
================================ */

function copyReferralLink() {
    const input = document.getElementById("refLinkInput");
    const buttonText = document.getElementById("copyBtnText");

    if (!input) {
        return;
    }

    const link = input.value;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(link)
            .then(() => {
                if (buttonText) {
                    buttonText.textContent = "Copied!";
                }

                ShowToast("Referral link copied.");

                setTimeout(() => {
                    if (buttonText) {
                        buttonText.textContent = "Copy";
                    }
                }, 2000);
            })
            .catch(() => {
                FallbackCopy(input);
            });

        return;
    }

    FallbackCopy(input);
}

function FallbackCopy(input) {
    input.select();

    document.execCommand("copy");

    ShowToast("Referral link copied.");
}

function shareReferral(platform) {
    if (!CurrentUser) {
        openModal("loginModal");
        return;
    }

    const input = document.getElementById("refLinkInput");

    if (!input) {
        return;
    }

    const link = input.value;

    const message =
        `Join the TajProfit demo platform: ${link}`;

    let shareUrl = "";

    if (platform === "whatsapp") {
        shareUrl =
            `https://wa.me/?text=${encodeURIComponent(message)}`;
    }

    if (platform === "facebook") {
        shareUrl =
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
    }

    if (platform === "telegram") {
        shareUrl =
            `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message)}`;
    }

    if (platform === "native") {
        if (navigator.share) {
            navigator.share({
                title: "TajProfit Demo",
                text: message,
                url: link
            }).catch(() => {});

            return;
        }

        copyReferralLink();
        return;
    }

    if (shareUrl) {
        window.open(
            shareUrl,
            "_blank",
            "noopener,noreferrer"
        );
    }
}

/* ================================
   Forgot Password
================================ */

function handlePasswordRecovery(event) {
    event.preventDefault();

    const phone =
        document.getElementById("recoverPhone")?.value.trim();

    const newPassword =
        document.getElementById("recoverNewPass")?.value;

    const confirmPassword =
        document.getElementById("recoverConfirmPass")?.value;

    if (!phone || !newPassword || !confirmPassword) {
        ShowToast("Please complete all fields.", "error");
        return;
    }

    if (newPassword.length < 6) {
        ShowToast(
            "Password must contain at least 6 characters.",
            "error"
        );

        return;
    }

    if (newPassword !== confirmPassword) {
        ShowToast(
            "Passwords do not match.",
            "error"
        );

        return;
    }

    const users = GetUsers();

    const index = users.findIndex(
        user => user.phone === phone
    );

    if (index === -1) {
        ShowToast(
            "No demo account found with this mobile number.",
            "error"
        );

        return;
    }

    users[index].password = newPassword;

    SaveUsers(users);

    document.getElementById("forgotForm")?.reset();

    closeModal("forgotModal");

    openModal("loginModal");

    ShowToast("Password updated successfully.");
}

/* ================================
   Office
================================ */

function showOfficeInfo(title, address) {
    const titleElement =
        document.getElementById("officeModalTitle");

    const addressElement =
        document.getElementById("officeModalAddress");

    if (!titleElement || !addressElement) {
        return;
    }

    titleElement.textContent = title;
    addressElement.textContent = address;

    openModal("officeModal");
}

/* ================================
   Escape HTML
================================ */

function EscapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* ================================
   Close Modal on Background Click
================================ */

document.addEventListener("click", event => {
    const modal = event.target;

    if (
        modal.classList &&
        modal.classList.contains("fixed") &&
        modal.classList.contains("inset-0") &&
        modal.classList.contains("flex")
    ) {
        if (event.target === modal) {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
            document.body.classList.remove("overflow-hidden");
        }
    }
});

/* ================================
   ESC Key
================================ */

document.addEventListener("keydown", event => {
    if (event.key !== "Escape") {
        return;
    }

    document
        .querySelectorAll(".fixed.inset-0.flex")
        .forEach(modal => {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
        });

    document.body.classList.remove("overflow-hidden");
});

/* ================================
   Page Load
================================ */

document.addEventListener("DOMContentLoaded", () => {
    CurrentUser = GetCurrentUser();

    UpdateDashboard();

    const referralCode =
        new URLSearchParams(window.location.search)
            .get("ref");

    const referralInput =
        document.getElementById("regRef");

    if (referralCode && referralInput) {
        referralInput.value = referralCode;
    }
});
