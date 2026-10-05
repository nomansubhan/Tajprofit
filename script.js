/**
 * TajProfit Web Application Scripts
 */

// Modal Handlers
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

// Close modal on Esc or outside backdrop click
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

// Toast Notifications
let toastTimeout;
function showToast(message, isSuccess = true) {
  const toast = document.getElementById('toastBox');
  const msg = document.getElementById('toastMessage');
  const icon = document.getElementById('toastIcon');

  if (!toast || !msg || !icon) return;

  clearTimeout(toastTimeout);

  msg.innerText = message;
  if (isSuccess) {
    icon.className = 'fa-solid fa-check text-emerald-400';
  } else {
    icon.className = 'fa-solid fa-triangle-exclamation text-rose-400';
  }

  toast.classList.remove('translate-y-[-150%]', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  toastTimeout = setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-[-150%]', 'opacity-0');
  }, 3500);
}

function showCustomNotice(notice) {
  showToast(notice, false);
}

// Authentication Handlers
function handleAuth(event, type) {
  event.preventDefault();
  if (type === 'register') {
    closeModal('registerModal');
    showToast('Registration successful! Welcome to TajProfit.');
  } else {
    closeModal('loginModal');
    showToast('Logged in successfully. Redirecting to portfolio...');
  }
}

// Transaction Modal Handlers
let currentTransType = 'deposit';

function openTransaction(type) {
  currentTransType = type;
  const title = document.getElementById('transTitle');
  const subtitle = document.getElementById('transSubtitle');
  const btn = document.getElementById('transBtn');

  if (type === 'deposit') {
    title.innerText = 'Make a Deposit';
    subtitle.innerText = 'Send payment through JazzCash, Easypaisa, or Bank Wire';
    btn.innerText = 'Confirm Deposit';
  } else {
    title.innerText = 'Request Withdrawal';
    subtitle.innerText = 'Funds will be transferred directly to your verified account';
    btn.innerText = 'Confirm Withdrawal';
  }
  openModal('transModal');
}

function handleTransaction(event) {
  event.preventDefault();
  closeModal('transModal');
  if (currentTransType === 'deposit') {
    showToast('Deposit request submitted! Verification takes 5-10 minutes.');
  } else {
    showToast('Withdrawal queued! Funds will hit your account shortly.');
  }
}

// Plan Selection
function selectPlan(planName, amount) {
  closeModal('plansModal');
  openTransaction('deposit');
  showToast(`${planName} selected (PKR ${amount}). Proceed with deposit.`);
}

// Office Information
function showOfficeInfo(officeTitle, location) {
  showToast(`${officeTitle}: ${location}`);
}

// Mobile Tab Navigation Switcher
function switchTab(tab) {
  const tabs = ['home', 'plans', 'deposit', 'withdraw'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-${t}`);
    if (!btn) return;
    if (t === tab) {
      btn.classList.add('text-taj-purple', 'bg-purple-100/70', 'font-semibold');
      btn.classList.remove('text-gray-500');
    } else {
      btn.classList.remove('text-taj-purple', 'bg-purple-100/70', 'font-semibold');
      btn.classList.add('text-gray-500');
    }
  });

  if (tab === 'plans') openModal('plansModal');
  if (tab === 'deposit') openTransaction('deposit');
  if (tab === 'withdraw') openTransaction('withdraw');
}