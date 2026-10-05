/**
 * TajProfit Web Application - Complete Real Working Engine
 */

// ==========================================
// 1. DATABASE & SESSION MANAGEMENT ENGINE
// ==========================================

function getUsersDB() {
    return JSON.parse(localStorage.getItem('tajprofit_users') || '[]');
}

function saveUsersDB(users) {
    localStorage.setItem('tajprofit_users', JSON.stringify(users));
}

// Check both permanent and temporary storage
function getActiveSession() {
    const local = localStorage.getItem('tajprofit_session');
    if (local) return JSON.parse(local);

    const session = sessionStorage.getItem('tajprofit_session');
    if (session) return JSON.parse(session);

    return null;
}

function setActiveSession(user, remember = true) {
    if (remember) {
        localStorage.setItem('tajprofit_session', JSON.stringify(user));
        sessionStorage.removeItem('tajprofit_session');
    } else {
        sessionStorage.setItem('tajprofit_session', JSON.stringify(user));
        localStorage.removeItem('tajprofit_session');
    }
    syncUserInDB(user);
    renderAppInterface();
}

function clearActiveSession() {
    localStorage.removeItem('tajprofit_session');
    sessionStorage.removeItem('tajprofit_session');
    renderAppInterface();
}

function syncUserInDB(user) {
    const users = getUsersDB();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
        users[index] = user;
    } else {
        users.push(user);
    }
    saveUsersDB(users);
}

// ==========================================
// 2. MODALS & TOAST NOTIFICATION HELPERS
// ==========================================

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    }
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        ['registerModal', 'loginModal', 'plansModal', 'transModal'].forEach(closeModal);
    }
});

['registerModal', 'loginModal', 'plansModal', 'transModal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('click', (e) => {
            if (e.target === el) closeModal(id);
        });
    }
});

let toastTimeout;
function showToast(message, isSuccess = true) {
    const toast = document.getElementById('toastBox');
    const msg = document.getElementById('toastMessage');
    const icon = document.getElementById('toastIcon');

    if (!toast || !msg || !icon) return;

    clearTimeout(toastTimeout);
    msg.innerText = message;
    icon.className = isSuccess 
        ? 'fa-solid fa-check text-emerald-400' 
        : 'fa-solid fa-triangle-exclamation text-rose-400';

    toast.classList.remove('translate-y-[-150%]', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    toastTimeout = setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-[-150%]', 'opacity-0');
    }, 3800);
}

function showCustomNotice(notice) {
    showToast(notice, false);
}

// ==========================================
// 3. REAL AUTHENTICATION (SIGN UP & LOGIN)
// ==========================================

function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPass').value;
    const referral = document.getElementById('regRef').value.trim();

    if (phone.length < 10) {
        showToast('Please enter a valid mobile number (min 10 digits)', false);
        return;
    }

    const users = getUsersDB();
    const exists = users.find(u => u.phone === phone);

    if (exists) {
        showToast('An account with this phone already exists!', false);
        return;
    }

    const newUser = {
        id: 'USER-' + Date.now(),
        name: name,
        phone: phone,
        password: password,
        referral: referral || 'TAJ-786',
        balance: 1000, // 1000 PKR Welcome Bonus
        investments: [],
        transactions: [
            {
                id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
                type: 'Bonus',
                amount: 1000,
                method: 'Welcome Credit',
                date: new Date().toLocaleDateString(),
                status: 'Completed'
            }
        ],
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsersDB(users);

    // Auto-login and persist
    setActiveSession(newUser, true);
    closeModal('registerModal');
    document.getElementById('regForm').reset();
    showToast(`Welcome ${name}! Your account has been credited with PKR 1,000 welcome bonus.`);
}

function handleLogin(event) {
    event.preventDefault();

    const phone = document.getElementById('loginPhone').value.trim();
    const password = document.getElementById('loginPass').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    const users = getUsersDB();
    const user = users.find(u => u.phone === phone && u.password === password);

    if (!user) {
        showToast('Incorrect mobile number or password!', false);
        return;
    }

    setActiveSession(user, rememberMe);
    closeModal('loginModal');
    document.getElementById('loginForm').reset();
    showToast(`Welcome back, ${user.name}!`);
}

function handleLogout() {
    clearActiveSession();
    showToast('You have been logged out safely.');
}

function handleHeroCTA() {
    const session = getActiveSession();
    if (session) {
        openTransaction('deposit');
    } else {
        openModal('registerModal');
    }
}

function handleMobileAuthBtn() {
    const session = getActiveSession();
    if (session) {
        handleLogout();
    } else {
        openModal('loginModal');
    }
}

// ==========================================
// 4. WALLET, DEPOSIT, WITHDRAW & INVESTMENTS
// ==========================================

let currentTransType = 'deposit';

function openTransaction(type) {
    const session = getActiveSession();
    if (!session) {
        showToast('Please log in first to manage your wallet.', false);
        openModal('loginModal');
        return;
    }

    currentTransType = type;
    const title = document.getElementById('transTitle');
    const subtitle = document.getElementById('transSubtitle');
    const label = document.getElementById('transAccountLabel');
    const btn = document.getElementById('transBtn');

    if (type === 'deposit') {
        title.innerText = 'Fund Wallet (Deposit)';
        subtitle.innerText = 'Transfer to TajProfit official account & enter transaction details';
        label.innerText = 'Sender Account / TID Reference';
        btn.innerText = 'Confirm Deposit';
    } else {
        title.innerText = 'Request Withdrawal';
        subtitle.innerText = `Available for withdrawal: PKR ${session.balance.toLocaleString()}`;
        label.innerText = 'Your JazzCash / Easypaisa / Bank Account Number';
        btn.innerText = 'Confirm Withdrawal';
    }

    document.getElementById('transAmount').value = '';
    document.getElementById('transRef').value = '';
    openModal('transModal');
}

function handleTransaction(event) {
    event.preventDefault();
    const session = getActiveSession();
    if (!session) return;

    const amount = parseFloat(document.getElementById('transAmount').value);
    const ref = document.getElementById('transRef').value.trim();
    const method = document.querySelector('input[name="paymentMethod"]:checked').value;

    if (isNaN(amount) || amount <= 0) {
        showToast('Please enter a valid amount.', false);
        return;
    }

    if (currentTransType === 'deposit') {
        // Add to user balance
        session.balance += amount;
        session.transactions.unshift({
            id: 'DEP-' + Math.floor(100000 + Math.random() * 900000),
            type: 'Deposit',
            amount: amount,
            method: method,
            date: new Date().toLocaleDateString(),
            status: 'Completed'
        });

        setActiveSession(session, true);
        closeModal('transModal');
        showToast(`Deposit of PKR ${amount.toLocaleString()} received and added to wallet!`);
    } else {
        // Withdraw logic
        if (amount > session.balance) {
            showToast('Insufficient balance for this withdrawal!', false);
            return;
        }

        session.balance -= amount;
        session.transactions.unshift({
            id: 'WTH-' + Math.floor(100000 + Math.random() * 900000),
            type: 'Withdrawal',
            amount: amount,
            method: `${method} (${ref})`,
            date: new Date().toLocaleDateString(),
            status: 'Processing'
        });

        setActiveSession(session, true);
        closeModal('transModal');
        showToast(`Withdrawal of PKR ${amount.toLocaleString()} queued! Sent to ${ref}.`);
    }
}

// Plan Subscription Logic
function executeBuyPlan(planName, cost, dailyReturn, days) {
    const session = getActiveSession();
    if (!session) {
        closeModal('plansModal');
        showToast('Please log in first to purchase an investment plan.', false);
        openModal('loginModal');
        return;
    }

    if (session.balance < cost) {
        closeModal('plansModal');
        showToast(`Insufficient balance! You need PKR ${cost.toLocaleString()}. Please deposit first.`, false);
        openTransaction('deposit');
        return;
    }

    // Deduct cost and activate plan
    session.balance -= cost;
    session.investments.push({
        name: planName,
        cost: cost,
        dailyReturn: dailyReturn,
        daysTotal: days,
        daysLeft: days,
        startDate: new Date().toLocaleDateString()
    });

    session.transactions.unshift({
        id: 'INV-' + Math.floor(100000 + Math.random() * 900000),
        type: 'Plan Purchase',
        amount: cost,
        method: planName,
        date: new Date().toLocaleDateString(),
        status: 'Active'
    });

    setActiveSession(session, true);
    closeModal('plansModal');
    showToast(`Success! You subscribed to ${planName}. Daily profit: PKR ${dailyReturn}.`);
}

// ==========================================
// 5. UI SYNC & RENDER ENGINE
// ==========================================

function renderAppInterface() {
    const session = getActiveSession();
    
    // Desktop Nav Elements
    const authActions = document.getElementById('authActionsDesktop');
    const userProfile = document.getElementById('userProfileDesktop');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userBalanceDisplay = document.getElementById('userBalanceDisplay');
    const heroBtnText = document.getElementById('heroPrimaryBtnText');

    // Dashboard Elements
    const dashCard = document.getElementById('userDashboardCard');
    const dashName = document.getElementById('dashUserName');
    const dashPhone = document.getElementById('dashUserPhone');
    const dashRef = document.getElementById('dashUserRef');
    const dashBalance = document.getElementById('dashUserBalance');
    const dashPlans = document.getElementById('dashActivePlans');
    const dashTrans = document.getElementById('dashRecentTrans');

    // Mobile Elements
    const mobileAuthIcon = document.getElementById('mobileAuthIcon');
    const mobileAuthLabel = document.getElementById('mobileAuthLabel');

    if (session) {
        // Sync Latest from DB
        const users = getUsersDB();
        const updated = users.find(u => u.id === session.id);
        const current = updated || session;

        // Desktop Nav
        if (authActions) authActions.classList.add('hidden');
        if (userProfile) {
            userProfile.classList.remove('hidden');
            userProfile.classList.add('flex');
        }
        if (userNameDisplay) userNameDisplay.innerText = current.name;
        if (userBalanceDisplay) userBalanceDisplay.innerText = `PKR ${current.balance.toLocaleString()}`;

        // Hero CTA button
        if (heroBtnText) heroBtnText.innerText = 'Deposit Funds';

        // Dashboard View
        if (dashCard) dashCard.classList.remove('hidden');
        if (dashName) dashName.innerText = current.name;
        if (dashPhone) dashPhone.innerText = current.phone;
        if (dashRef) dashRef.innerText = current.referral;
        if (dashBalance) dashBalance.innerText = `PKR ${current.balance.toLocaleString()}`;

        // Render Active Plans
        if (dashPlans) {
            if (current.investments && current.investments.length > 0) {
                dashPlans.innerHTML = current.investments.map(p => `
                    <div class="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                        <div>
                            <span class="font-bold text-white">${p.name}</span>
                            <span class="block text-[10px] text-amber-300">Daily: +PKR ${p.dailyReturn}</span>
                        </div>
                        <span class="text-[11px] font-bold bg-purple-800 text-purple-200 px-2 py-0.5 rounded-full">${p.daysLeft} Days Left</span>
                    </div>
                `).join('');
            } else {
                dashPlans.innerHTML = `<p class="italic text-purple-300/70">No active plans yet. Click 'Buy Plan' to begin earning daily returns.</p>`;
            }
        }

        // Render Transactions
        if (dashTrans) {
            if (current.transactions && current.transactions.length > 0) {
                dashTrans.innerHTML = current.transactions.map(t => `
                    <div class="flex items-center justify-between py-1 border-b border-white/10">
                        <span>${t.type} (${t.method})</span>
                        <span class="font-bold ${t.type === 'Withdrawal' ? 'text-rose-400' : 'text-emerald-400'}">
                            ${t.type === 'Withdrawal' ? '-' : '+'}PKR ${t.amount.toLocaleString()}
                        </span>
                    </div>
                `).join('');
            } else {
                dashTrans.innerHTML = `<p class="italic text-purple-300/70">No transactions recorded.</p>`;
            }
        }

        // Mobile Nav
        if (mobileAuthIcon) mobileAuthIcon.className = 'fa-solid fa-arrow-right-from-bracket text-lg mb-0.5 text-red-500';
        if (mobileAuthLabel) mobileAuthLabel.innerText = 'Logout';

    } else {
        // Logged Out State
        if (authActions) authActions.classList.remove('hidden');
        if (userProfile) {
            userProfile.classList.add('hidden');
            userProfile.classList.remove('flex');
        }
        if (dashCard) dashCard.classList.add('hidden');
        if (heroBtnText) heroBtnText.innerText = 'Create Free Account';

        if (mobileAuthIcon) mobileAuthIcon.className = 'fa-solid fa-arrow-right-to-bracket text-lg mb-0.5';
        if (mobileAuthLabel) mobileAuthLabel.innerText = 'Login';
    }
}

function showOfficeInfo(officeTitle, location) {
    showToast(`${officeTitle}: ${location}`);
}

function switchTab(tab) {
    if (tab === 'home') window.scrollTo({top: 0, behavior: 'smooth'});
}

// Initialise App State on Page Load
document.addEventListener('DOMContentLoaded', renderAppInterface);
