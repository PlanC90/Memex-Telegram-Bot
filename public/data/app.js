let withdrawals = [];
let filteredWithdrawals = [];
let sortOrder = { recipient: true, amount: true, timestamp: true };
let activeFilters = { validWallet: false, period: 'all' };  // Yeni filtreleme durumları

document.addEventListener("DOMContentLoaded", () => {
    fetchData();
});

function fetchData() {
    fetch('/data/withdrawals.json')
        .then(response => response.json())
        .then(data => {
            withdrawals = data.map(w => ({
                recipient: w.walletAddress || 'N/A',
                amount: w.amount,
                timestamp: new Date(w.timestamp),
            }));
            filteredWithdrawals = [...withdrawals];
            renderSummary();
            renderWithdrawals();
        })
        .catch(error => console.error('Veri çekme hatası:', error));
}

function renderSummary() {
    const totalWithdrawals = filteredWithdrawals.length;
    const totalAmount = filteredWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const validWithdrawals = filteredWithdrawals.filter(w => w.recipient.startsWith('x') || w.recipient.startsWith('ep1'));
    const validCount = validWithdrawals.length;
    const validTotalAmount = validWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    document.getElementById("total-withdrawals").textContent = totalWithdrawals;
    document.getElementById("total-amount").textContent = totalAmount;
    document.getElementById("valid-count").textContent = validCount;
    document.getElementById("valid-total-amount").textContent = validTotalAmount;
}

function renderWithdrawals() {
    const tableBody = document.getElementById("withdrawal-table-body");
    tableBody.innerHTML = '';
    filteredWithdrawals.forEach(w => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${w.recipient}</td>
            <td>${w.amount}</td>
            <td>${w.timestamp.toLocaleString()}</td>
        `;
        tableBody.appendChild(row);
    });
}

function filterWithdrawals(period, button) {
    // Aktif filtreyi kontrol et ve uygula
    document.querySelectorAll('.filters button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    activeFilters.period = period;  // Günlük, haftalık, aylık, tümü
    applyFilters();
}

function filterValidWallets(button) {
    document.querySelectorAll('.filters button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    activeFilters.validWallet = !activeFilters.validWallet;  // Geçerli cüzdan aktifliğini değiştir
    applyFilters();
}

function applyFilters() {
    let tempWithdrawals = [...withdrawals];

    // Eğer geçerli cüzdan filtresi aktifse, bunu uygula
    if (activeFilters.validWallet) {
        tempWithdrawals = tempWithdrawals.filter(w => w.recipient.startsWith('x') || w.recipient.startsWith('ep1'));
    }

    // Eğer bir tarihsel filtre seçildiyse, onu uygula
    const now = new Date();
    if (activeFilters.period === 'daily') {
        tempWithdrawals = tempWithdrawals.filter(w => w.timestamp.toDateString() === now.toDateString());
    } else if (activeFilters.period === 'weekly') {
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        tempWithdrawals = tempWithdrawals.filter(w => w.timestamp >= startOfWeek);
    } else if (activeFilters.period === 'monthly') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        tempWithdrawals = tempWithdrawals.filter(w => w.timestamp >= startOfMonth);
    }

    filteredWithdrawals = tempWithdrawals;
    renderSummary();
    renderWithdrawals();
}

function sortTable(column) {
    filteredWithdrawals.sort((a, b) => {
        const valA = column === 'timestamp' ? a[column].getTime() : a[column];
        const valB = column === 'timestamp' ? b[column].getTime() : b[column];
        return sortOrder[column] ? valA - valB : valB - valA;
    });
    sortOrder[column] = !sortOrder[column];
    renderWithdrawals();
}

function downloadData() {
    // Sadece gerekli alanları dahil et, timestamp'ı çıkar, pid'yi ekle
    const dataToDownload = filteredWithdrawals.map(w => ({
        recipient: w.recipient,
        pid: 199,  // Sabit pid: 199
        amount: w.amount
    }));

    const dataStr = JSON.stringify(dataToDownload, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "filtered_withdrawals.json";
    link.click();
}
