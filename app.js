// Pendaftaran Service Worker PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// Konfigurasi Lalai Sub-Jenama Sekolah
const DEFAULT_BRANDING = {
  schoolName: 'Sekolah Kebangsaan Contoh (SKM)',
  schoolCode: 'CBA0001',
  schoolMotto: 'Ilmu Teras Kecemerlangan',
  schoolLogo: ''
};

// Ambil atau Simpan Data Penjenamaan Sekolah
function getSchoolBranding() {
  try {
    const saved = localStorage.getItem('dela_school_branding');
    return saved ? { ...DEFAULT_BRANDING, ...JSON.parse(saved) } : DEFAULT_BRANDING;
  } catch {
    return DEFAULT_BRANDING;
  }
}

function applySchoolBranding() {
  const brand = getSchoolBranding();

  // Kemas kini paparan pada skrin log masuk
  document.getElementById('loginSchoolName').textContent = brand.schoolName;
  document.getElementById('loginSchoolMotto').textContent = brand.schoolMotto;
  const loginLogo = document.getElementById('loginSchoolLogo');
  if (brand.schoolLogo) {
    loginLogo.src = brand.schoolLogo;
    loginLogo.classList.remove('hidden');
  } else {
    loginLogo.classList.add('hidden');
  }

  // Kemas kini header utama aplikasi
  document.getElementById('headerSchoolName').textContent = brand.schoolName;
  document.getElementById('headerSchoolCode').textContent = `KOD: ${brand.schoolCode}`;
  document.getElementById('headerSchoolMotto').textContent = brand.schoolMotto;

  const headerLogoBox = document.getElementById('headerLogoBox');
  headerLogoBox.innerHTML = brand.schoolLogo
    ? `<img src="${brand.schoolLogo}" alt="Logo ${brand.schoolName}" />`
    : '🏫';

  // Isi borang tetapan
  document.getElementById('inputSchoolName').value = brand.schoolName;
  document.getElementById('inputSchoolCode').value = brand.schoolCode;
  document.getElementById('inputSchoolMotto').value = brand.schoolMotto;
}

// Kawalan Akses Berasaskan Peranan (RBAC)
function applyRolePermissions(role) {
  const navButtons = document.querySelectorAll('[data-roles]');
  navButtons.forEach((btn) => {
    const allowedRoles = btn.getAttribute('data-roles').split(',');
    if (allowedRoles.includes(role)) {
      btn.classList.remove('hidden');
    } else {
      btn.classList.add('hidden');
    }
  });
}

// Penukaran Tab Navigasi (Segerak antara Desktop Sidebar & Mobile Bottom Bar)
function switchTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.classList.toggle('hidden', panel.id !== `tab-${tabId}`);
  });

  document.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });
}

// Pengesan Saiz Peranti Semasa (Telefon / Tablet / Laptop)
function updateDeviceIndicator() {
  const w = window.innerWidth;
  const label = w < 768 ? 'Telefon Pintar' : w <= 1024 ? 'Tablet' : 'Laptop / Komputer';
  const el = document.getElementById('deviceIndicator');
  if (el) el.textContent = `Paparan Aktif: ${label}`;
}

// Pengesan Status Rangkaian (Online / Offline)
function updateNetworkStatus() {
  const banner = document.getElementById('networkBanner');
  banner.classList.toggle('hidden', navigator.onLine);
}

// Inisialisasi Aplikasi
document.addEventListener('DOMContentLoaded', () => {
  applySchoolBranding();
  updateDeviceIndicator();
  updateNetworkStatus();

  window.addEventListener('resize', updateDeviceIndicator);
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);

  // Proses Log Masuk
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('userEmail').value.trim();
    const role = document.getElementById('userRole').value;
    const mode = document.getElementById('schoolMode').value;

    sessionStorage.setItem('dela_session', JSON.stringify({ email, role, mode }));
    enterApp({ email, role, mode });
  });

  // Log Keluar
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('dela_session');
    document.getElementById('appShell').classList.add('hidden');
    document.getElementById('loginView').classList.remove('hidden');
  });

  // Klik Navigasi Tab
  document.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });

  // Kecilkan / Besarkan Sidebar Desktop
  document.getElementById('toggleSidebarBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });

  // Simpan Tetapan Sub-Jenama Sekolah (Modul 26)
  document.getElementById('brandingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const current = getSchoolBranding();
    const updated = {
      ...current,
      schoolName: document.getElementById('inputSchoolName').value.trim(),
      schoolCode: document.getElementById('inputSchoolCode').value.trim().toUpperCase(),
      schoolMotto: document.getElementById('inputSchoolMotto').value.trim()
    };

    const fileInput = document.getElementById('inputSchoolLogo');
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        updated.schoolLogo = ev.target.result;
        localStorage.setItem('dela_school_branding', JSON.stringify(updated));
        applySchoolBranding();
        alert('Identiti dan logo sekolah berjaya dikemas kini!');
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      localStorage.setItem('dela_school_branding', JSON.stringify(updated));
      applySchoolBranding();
      alert('Maklumat sub-jenama sekolah berjaya disimpan!');
    }
  });

  // Set Semula Tetapan Penjenamaan
  document.getElementById('resetBrandingBtn').addEventListener('click', () => {
    localStorage.removeItem('dela_school_branding');
    applySchoolBranding();
    alert('Tetapan sekolah dikembalikan kepada asal.');
  });

  // Kekalkan sesi jika halaman dimuat semula
  const existing = sessionStorage.getItem('dela_session');
  if (existing) enterApp(JSON.parse(existing));
});

function enterApp({ email, role, mode }) {
  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');

  document.getElementById('activeUserEmail').textContent = email;
  document.getElementById('activeRoleBadge').textContent = role;
  document.getElementById('sidebarModeBadge').textContent = mode;
  document.getElementById('kpiClassMode').textContent =
    mode === 'SKM' ? 'Kelas Bercantum (SKM)' : 'Aliran Perdana';

  applyRolePermissions(role);
  switchTab('dashboard');
}
