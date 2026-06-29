const firebaseConfig = {
    apiKey:            'AIzaSyDK-VZPOkgebi-Obl-JG7Z-283cJmiUDm4',
    authDomain:        'kumtechgateway-237.firebaseapp.com',
    projectId:         'kumtechgateway-237',
    storageBucket:     'kumtechgateway-237.firebasestorage.app',
    messagingSenderId: '909947059277',
    appId:             '1:909947059277:web:40b0e5ddad2eef0991f004'
};

const ADMIN_EMAIL = 'kumtechgateway@gmail.com';

// ── Firebase (loaded once at startup — admin page always needs all three) ──
const [
    { initializeApp, getApps, getApp },
    { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut },
    { getFirestore, collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc }
] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js')
]);

const app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── State ─────────────────────────────────────────────────────────────────
let allReviews = [];
let currentTab = 'pending';

// ── Elements ──────────────────────────────────────────────────────────────
const loginScreen     = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginPane       = document.getElementById('loginPane');
const forgotPane      = document.getElementById('forgotPane');

// ── Screens ───────────────────────────────────────────────────────────────
const showLogin = () => {
    loginScreen.classList.remove('hidden');
    dashboardScreen.classList.add('hidden');
    dashboardScreen.classList.remove('flex');
};

const showDashboard = () => {
    loginScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
    dashboardScreen.classList.add('flex');
};

// ── Auth state ────────────────────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
    if (user && user.email === ADMIN_EMAIL) {
        showDashboard();
        loadReviews();
    } else {
        showLogin();
    }
});

// ── Sign in ───────────────────────────────────────────────────────────────
const signInBtn  = document.getElementById('signInBtn');
const signInIcon = document.getElementById('signInIcon');
const loginLabel = document.getElementById('loginLabel');
const loginError = document.getElementById('loginError');

document.getElementById('signInForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    loginError.classList.add('hidden');
    signInBtn.disabled     = true;
    signInIcon.className   = 'fas fa-spinner fa-spin';
    loginLabel.textContent = 'Signing in…';

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
        loginError.textContent = authError(err.code);
        loginError.classList.remove('hidden');
        signInBtn.disabled     = false;
        signInIcon.className   = 'fas fa-arrow-right-to-bracket';
        loginLabel.textContent = 'Sign In';
    }
});

// ── Password visibility toggle ────────────────────────────────────────────
document.getElementById('togglePassword').addEventListener('click', () => {
    const input = document.getElementById('adminPassword');
    const icon  = document.getElementById('togglePasswordIcon');
    const show  = input.type === 'password';
    input.type   = show ? 'text' : 'password';
    icon.className = `fas fa-eye${show ? '-slash' : ''} text-sm`;
});

// ── Forgot password ───────────────────────────────────────────────────────
document.getElementById('showForgotPassword').addEventListener('click', () => {
    loginPane.classList.add('hidden');
    forgotPane.classList.remove('hidden');
});

document.getElementById('showSignIn').addEventListener('click', () => {
    forgotPane.classList.add('hidden');
    loginPane.classList.remove('hidden');
    document.getElementById('resetMessage').classList.add('hidden');
});

document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email  = document.getElementById('resetEmail').value.trim();
    const msgEl  = document.getElementById('resetMessage');
    const btn    = document.getElementById('resetBtn');

    msgEl.classList.add('hidden');
    btn.disabled    = true;
    btn.textContent = 'Sending…';

    try {
        await sendPasswordResetEmail(auth, email);
        msgEl.className   = 'text-xs mb-3 text-green-600 dark:text-green-400';
        msgEl.textContent = 'Reset link sent — check your inbox.';
        msgEl.classList.remove('hidden');
        btn.textContent = 'Sent ✓';
    } catch (err) {
        msgEl.className   = 'text-xs mb-3 text-red-500';
        msgEl.textContent = authError(err.code);
        msgEl.classList.remove('hidden');
        btn.disabled    = false;
        btn.textContent = 'Send Reset Link';
    }
});

// ── Sign out ──────────────────────────────────────────────────────────────
document.getElementById('signOutBtn').addEventListener('click', () => signOut(auth));

// ── Refresh ───────────────────────────────────────────────────────────────
document.getElementById('refreshBtn').addEventListener('click', loadReviews);

// ── Tabs ──────────────────────────────────────────────────────────────────
document.getElementById('tabPending').addEventListener('click',  () => switchTab('pending'));
document.getElementById('tabApproved').addEventListener('click', () => switchTab('approved'));

function switchTab(tab) {
    currentTab = tab;

    const activeClass   = 'inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all bg-tech-blue text-white shadow-sm';
    const inactiveClass = 'inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all bg-white dark:bg-slate-800 text-charcoal dark:text-white border border-gray-200 dark:border-slate-600';
    const activeBadge   = 'bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[1.5rem] text-center';
    const inactiveBadge = 'bg-gray-100 dark:bg-slate-700 text-charcoal/60 dark:text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full min-w-[1.5rem] text-center';

    document.getElementById('tabPending').className   = tab === 'pending'  ? activeClass   : inactiveClass;
    document.getElementById('tabApproved').className  = tab === 'approved' ? activeClass   : inactiveClass;
    document.getElementById('pendingCount').className = tab === 'pending'  ? activeBadge   : inactiveBadge;
    document.getElementById('approvedCount').className= tab === 'approved' ? activeBadge   : inactiveBadge;

    renderReviews();
}

// ── Load reviews ──────────────────────────────────────────────────────────
async function loadReviews() {
    const list = document.getElementById('reviewsList');
    list.innerHTML = '<p class="text-sm text-gray-400 text-center py-12">Loading…</p>';

    try {
        const snapshot = await getDocs(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')));
        allReviews = [];
        snapshot.forEach(d => allReviews.push({ id: d.id, ...d.data() }));
        updateCounts();
        renderReviews();
    } catch (err) {
        list.innerHTML = `<p class="text-sm text-red-500 text-center py-12">${esc(err.message)}</p>`;
    }
}

function updateCounts() {
    document.getElementById('pendingCount').textContent  = allReviews.filter(r => !r.approved).length;
    document.getElementById('approvedCount').textContent = allReviews.filter(r =>  r.approved).length;
}

// ── Render ────────────────────────────────────────────────────────────────
function renderReviews() {
    const list     = document.getElementById('reviewsList');
    const filtered = allReviews.filter(r => currentTab === 'pending' ? !r.approved : r.approved);

    if (!filtered.length) {
        list.innerHTML = `<p class="text-sm text-gray-400 text-center py-12">No ${currentTab} reviews.</p>`;
        return;
    }

    list.innerHTML = filtered.map(reviewCard).join('');
}

function reviewCard(r) {
    const initials = r.name.split(' ').slice(0, 2).map(w => (w[0] ?? '').toUpperCase()).join('');
    const stars    = Array.from({ length: 5 }, (_, i) =>
        `<i class="fas fa-star text-xs ${i < r.rating ? 'text-orange' : 'text-gray-200 dark:text-slate-600'}"></i>`
    ).join('');

    let dateStr = '—';
    try {
        if (r.createdAt) {
            const d = r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt.seconds * 1000);
            dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }
    } catch (_) {}

    const actionBtn = r.approved
        ? `<button type="button" data-action="revoke"  data-id="${r.id}" class="btn-revoke  px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap">Revoke</button>`
        : `<button type="button" data-action="approve" data-id="${r.id}" class="btn-approve px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap">Approve</button>`;

    return `
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
        <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-tech-blue to-orange flex items-center justify-center text-white font-bold text-sm shrink-0 select-none">${esc(initials)}</div>
            <div class="flex-1 min-w-0">
                <div class="flex items-baseline gap-2 flex-wrap">
                    <span class="font-semibold text-sm text-charcoal dark:text-white">${esc(r.name)}</span>
                    ${r.company ? `<span class="text-xs text-charcoal/50 dark:text-gray-400">${esc(r.company)}</span>` : ''}
                </div>
                <div class="flex gap-0.5 mt-1 mb-2">${stars}</div>
                <p class="text-sm text-charcoal/80 dark:text-gray-300 leading-relaxed">${esc(r.review)}</p>
                <p class="text-xs text-gray-400 mt-2">${dateStr}</p>
            </div>
            <div class="flex flex-col gap-2 shrink-0 pt-0.5">
                ${actionBtn}
                <button type="button" data-action="delete" data-id="${r.id}" class="btn-delete px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap">Delete</button>
            </div>
        </div>
    </div>`;
}

// ── Actions (event delegation) ────────────────────────────────────────────
const ACTION_LABELS = { approve: 'Approve', revoke: 'Revoke', delete: 'Delete' };

document.getElementById('reviewsList').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn || btn.disabled) return;

    const { action, id } = btn.dataset;

    if (action === 'delete' && !confirm('Delete this review permanently? This cannot be undone.')) return;

    btn.disabled    = true;
    btn.textContent = '…';

    try {
        if      (action === 'approve') await updateDoc(doc(db, 'reviews', id), { approved: true });
        else if (action === 'revoke')  await updateDoc(doc(db, 'reviews', id), { approved: false });
        else if (action === 'delete')  await deleteDoc(doc(db, 'reviews', id));
        await loadReviews();
    } catch (err) {
        console.error(`Failed to ${action} review ${id}:`, err);
        btn.disabled    = false;
        btn.textContent = ACTION_LABELS[action] ?? action;
    }
});

// ── Helpers ───────────────────────────────────────────────────────────────
function esc(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function authError(code) {
    const map = {
        'auth/invalid-credential':     'Incorrect email or password.',
        'auth/user-not-found':         'No account found with that email.',
        'auth/wrong-password':         'Incorrect password.',
        'auth/too-many-requests':      'Too many attempts — try again later.',
        'auth/invalid-email':          'Please enter a valid email address.',
        'auth/network-request-failed': 'Network error — check your connection.',
    };
    return map[code] ?? 'Something went wrong. Please try again.';
}
