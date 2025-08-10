import React, { useState, useEffect, useMemo } from 'react';

// --- FIREBASE IMPORTS ---
// Pastikan untuk menginstal firebase: npm install firebase
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut 
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    onSnapshot, 
    addDoc, 
    doc, 
    updateDoc, 
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    writeBatch,
    setDoc
} from 'firebase/firestore';


// --- FIREBASE CONFIGURATION ---
// TODO: Ganti dengan konfigurasi proyek Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyAmWwwjnlzxFaBTctbmYeSNFoVYDI-eqW0",
  authDomain: "artoqu-1.firebaseapp.com",
  projectId: "artoqu-1",
  storageBucket: "artoqu-1.firebasestorage.app",
  messagingSenderId: "426010775421",
  appId: "1:426010775421:web:c49e411ecd1f2181210614"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- PENTING: PENGATURAN NAMA APLIKASI & IKON ---
// Untuk mengubah nama aplikasi saat diinstal dari Chrome ("Add to Home Screen"),
// edit file `public/manifest.json` di proyek Anda.
//
// "short_name": "ArtoQu",
// "name": "ArtoQu - Manajemen Keuangan",
//
// Untuk ikon aplikasi, ganti file `public/favicon.ico` dan `public/logo192.png`
// dengan file logo Anda. Kode di bawah ini menambahkan favicon secara dinamis
// untuk keperluan pratinjau.

// Helper function to format currency to Indonesian Rupiah
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// --- ICONS (Inline SVG for simplicity) ---
const HomeIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const WalletIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>;
const DebtIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>;
const UserIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const PlusIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const BellIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>;
const MoonIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>;
const SunIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>;
const ChevronLeftIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6"></path></svg>;
const CameraIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>;
const ArrowUpIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5v14"></path><path d="m18 11-6-6-6 6"></path></svg>;
const ArrowDownIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5v14"></path><path d="m18 11-6 6-6-6"></path></svg>;
const RepeatIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m17 2 4 4-4 4"></path><path d="M3 11v-1a4 4 0 0 1 4-4h14"></path><path d="m7 22-4-4 4-4"></path><path d="M21 13v1a4 4 0 0 1-4 4H3"></path></svg>;
const TrashIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const EditIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>;
const LogOutIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const InfoIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;


// Data will now be fetched from Firebase

const categories = {
    expense: ['Makanan', 'Transportasi', 'Belanja', 'Hiburan', 'Tagihan', 'Hutang', 'Kesehatan', 'Pendidikan', 'Lainnya'],
    income: ['Gaji', 'Bonus', 'Hadiah', 'Investasi', 'Lainnya'],
};


// --- UI Components ---
const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end">
        <div className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex justify-end items-center mb-2">
                <button onClick={onClose} className="text-gray-500 dark:text-gray-400 text-2xl">&times;</button>
            </div>
            {children}
        </div>
    </div>
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
    </div>
);


// --- PAGES ---

const AuthPage = ({ setModalContent }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', name: '' });
    const [loading, setLoading] = useState(false);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLoginView) {
                if (!formData.email || !formData.password) {
                    setModalContent(<div className="p-4 text-center text-red-500">Email dan password harus diisi.</div>);
                    setLoading(false);
                    return;
                }
                await signInWithEmailAndPassword(auth, formData.email, formData.password);
                // onAuthStateChanged will handle the redirect
            } else {
                if (!formData.email || !formData.password || !formData.name) {
                    setModalContent(<div className="p-4 text-center text-red-500">Nama, email, dan password harus diisi.</div>);
                    setLoading(false);
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                // Create user profile in a subcollection to comply with security rules
                const profileDocRef = doc(db, `users/${userCredential.user.uid}/profile`, 'data');
                await setDoc(profileDocRef, {
                    uid: userCredential.user.uid,
                    name: formData.name,
                    email: formData.email,
                    createdAt: serverTimestamp()
                });
                // onAuthStateChanged will handle the redirect
            }
        } catch (error) {
            setModalContent(<div className="p-4 text-center text-red-500">{error.message}</div>);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-sm mx-auto">
                <div className="text-center mb-8">
                    {/* Ganti H1 dengan tag img untuk logo */}
                    <img 
                        src="/logo192.png" 
                        alt="ArtoQu Logo" 
                        className="w-48 mx-auto"
                        // Ganti dengan URL logo Anda yang sudah di-hosting
                        // onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/300x80/6d28d9/ffffff?text=ArtoQu'; }}
                    />
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Kelola keuangan Anda dengan cerdas.</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
                        {isLoginView ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLoginView && (
                            <input type="text" name="name" placeholder="Nama Lengkap" value={formData.name} onChange={handleInputChange} className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500" required />
                        )}
                        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500" required />
                        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500" required />
                        <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400">
                            {loading ? 'Memproses...' : (isLoginView ? 'Masuk' : 'Daftar')}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                        {isLoginView ? "Belum punya akun? " : "Sudah punya akun? "}
                        <button onClick={() => setIsLoginView(!isLoginView)} className="font-semibold text-purple-600 dark:text-purple-400 hover:underline">
                            {isLoginView ? 'Daftar di sini' : 'Masuk di sini'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

const HomePage = ({ setPage, wallets, transactions, debts, userData, setModalContent }) => {
    const totalBalance = useMemo(() => wallets.reduce((sum, wallet) => sum + wallet.balance, 0), [wallets]);
    
    const { incomeThisMonth, expenseThisMonth } = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        let income = 0;
        let expense = 0;

        transactions.forEach(tx => {
            const txDate = tx.date.toDate(); // Convert Firestore Timestamp to Date
            if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
                if (tx.type === 'income') {
                    income += tx.amount;
                } else if (tx.type === 'expense') {
                    expense += tx.amount;
                }
            }
        });
        return { incomeThisMonth: income, expenseThisMonth: expense };
    }, [transactions]);

    const upcomingDebts = useMemo(() => {
        const today = new Date();
        return debts.filter(debt => {
            if (debt.paidInstallments >= debt.tenor) return false;
            
            const dueDate = new Date(today.getFullYear(), today.getMonth(), debt.dueDate);
            if (dueDate < today) {
                dueDate.setMonth(dueDate.getMonth() + 1);
            }
            
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(today.getDate() + 7);
            
            return dueDate >= today && dueDate <= sevenDaysFromNow;
        }).sort((a, b) => {
             const today = new Date();
             const dueDateA = new Date(today.getFullYear(), today.getMonth(), a.dueDate);
             if (dueDateA < today) dueDateA.setMonth(dueDateA.getMonth() + 1);
             const dueDateB = new Date(today.getFullYear(), today.getMonth(), b.dueDate);
             if (dueDateB < today) dueDateB.setMonth(dueDateB.getMonth() + 1);
             return dueDateA - dueDateB;
        });
    }, [debts]);
    
    const recentTransactions = useMemo(() => {
        return transactions.slice(0, 4); // Already sorted by date from Firestore query
    }, [transactions]);

    const getWalletName = (walletId) => wallets.find(w => w.id === walletId)?.name || 'N/A';
    
    const today = new Date();
    const dateString = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div className="p-4 pb-24 space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Halo, {userData?.name || 'Pengguna'}!</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{dateString}</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="text-gray-600 dark:text-gray-300"><BellIcon className="w-6 h-6"/></button>
                </div>
            </header>
            
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-80">Total Saldo</p>
                <p className="text-4xl font-bold tracking-tight mb-4">{formatCurrency(totalBalance)}</p>
                <div className="flex justify-between items-center border-t border-white/20 pt-4">
                    <div className="flex items-center space-x-2">
                         <div className="bg-white/20 p-1 rounded-full"><ArrowDownIcon className="w-4 h-4"/></div>
                         <div>
                            <p className="text-xs opacity-80">Pemasukan Bulan Ini</p>
                            <p className="font-semibold">{formatCurrency(incomeThisMonth)}</p>
                         </div>
                    </div>
                    <div className="flex items-center space-x-2">
                         <div className="bg-white/20 p-1 rounded-full"><ArrowUpIcon className="w-4 h-4"/></div>
                         <div>
                            <p className="text-xs opacity-80">Pengeluaran Bulan Ini</p>
                            <p className="font-semibold">{formatCurrency(expenseThisMonth)}</p>
                         </div>
                    </div>
                </div>
            </div>

            {upcomingDebts.length > 0 && (
                <div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Reminder Angsuran</h2>
                    <div className="relative">
                        <div className="flex overflow-x-auto space-x-4 pb-3 -mx-4 px-4 custom-scrollbar">
                            {upcomingDebts.map(debt => {
                                 const today = new Date();
                                 const dueDateThisMonth = new Date(today.getFullYear(), today.getMonth(), debt.dueDate);
                                 if (dueDateThisMonth < today) {
                                    dueDateThisMonth.setMonth(dueDateThisMonth.getMonth() + 1);
                                 }
                                 const daysLeft = Math.ceil((dueDateThisMonth - today) / (1000 * 60 * 60 * 24));
                                 const dayText = daysLeft <= 0 ? "Jatuh Tempo Hari Ini" : `${daysLeft} hari lagi`;

                                 return (
                                    <div key={debt.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md min-w-[200px] flex-shrink-0 border border-gray-200 dark:border-gray-700">
                                        <h3 className="font-bold text-gray-800 dark:text-gray-100">{debt.name}</h3>
                                        <p className="text-purple-600 dark:text-purple-400 font-bold text-lg">{formatCurrency(debt.installment)}</p>
                                        <p className={`text-sm ${daysLeft <= 3 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>{dayText}</p>
                                    </div>
                                 )
                            })}
                        </div>
                    </div>
                </div>
            )}

            <div>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Riwayat Transaksi</h2>
                    <button onClick={() => setPage('history')} className="text-sm text-purple-600 dark:text-purple-400 font-semibold cursor-pointer">Lihat Semua</button>
                </div>
                <div className="space-y-3">
                    {recentTransactions.map(tx => {
                        const isIncome = tx.type === 'income';
                        const isTransfer = tx.type === 'transfer';
                        let icon;
                        if (isIncome) icon = <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full"><ArrowDownIcon className="w-5 h-5 text-green-500"/></div>;
                        else if (isTransfer) icon = <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full"><RepeatIcon className="w-5 h-5 text-blue-500"/></div>;
                        else icon = <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full"><ArrowUpIcon className="w-5 h-5 text-red-500"/></div>;
                        
                        return (
                            <div key={tx.id} className="flex items-center bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                {icon}
                                <div className="ml-4 flex-grow">
                                    <p className="font-bold text-gray-800 dark:text-gray-100">{tx.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{tx.date.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}, {isTransfer ? `${getWalletName(tx.fromWalletId)} \u2192 ${getWalletName(tx.toWalletId)}` : getWalletName(tx.walletId)}</p>
                                </div>
                                <p className={`font-bold ${isIncome ? 'text-green-500' : isTransfer ? 'text-blue-500' : 'text-red-500'}`}>
                                    {isIncome ? '+' : isTransfer ? '' : '-'}{formatCurrency(tx.amount)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const BalancePage = ({ wallets, setPage }) => {
    const totalBalance = useMemo(() => wallets.reduce((sum, wallet) => sum + wallet.balance, 0), [wallets]);
    
    const balanceByType = useMemo(() => {
        return wallets.reduce((acc, wallet) => {
            if (!acc[wallet.type]) {
                acc[wallet.type] = { total: 0, wallets: [] };
            }
            acc[wallet.type].total += wallet.balance;
            acc[wallet.type].wallets.push(wallet);
            return acc;
        }, {});
    }, [wallets]);

    const typeColors = {
        'Bank': 'text-blue-500',
        'eWallet': 'text-purple-500',
        'Cash': 'text-green-500',
    };

    return (
        <div className="p-4 pb-24">
            <header className="flex items-center mb-6">
                <button onClick={() => setPage('home')} className="mr-4 text-gray-700 dark:text-gray-200"><ChevronLeftIcon className="w-6 h-6"/></button>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Saldo</h1>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Saldo</p>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 tracking-tight">{formatCurrency(totalBalance)}</p>
            </div>

            <div className="space-y-4">
                {Object.entries(balanceByType).map(([type, data]) => (
                    <div key={type} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className={`text-lg font-bold ${typeColors[type]}`}>{type}</h2>
                            <p className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(data.total)}</p>
                        </div>
                        <div className="space-y-3">
                            {data.wallets.map(wallet => (
                                <div key={wallet.id} className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-3 mt-2">
                                    <div>
                                        <p className="text-gray-700 dark:text-gray-200 font-medium">{wallet.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{wallet.accountNumber}</p>
                                    </div>
                                    <p className="text-gray-800 dark:text-gray-100 font-semibold">{formatCurrency(wallet.balance)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AddTransactionPage = ({ setPage, wallets, addTransaction, setModalContent, userId }) => {
    const [activeTab, setActiveTab] = useState('expense');
    const [formData, setFormData] = useState({
        type: 'expense',
        name: '',
        amount: '',
        category: categories.expense[0],
        date: new Date().toISOString().slice(0, 16),
        walletId: wallets[0]?.id || '',
        fromWalletId: wallets[0]?.id || '',
        toWalletId: wallets[1]?.id || '',
        note: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'amount') {
            const rawValue = value.replace(/\./g, '');
            if (/^\d*$/.test(rawValue)) {
                setFormData(prev => ({ ...prev, [name]: rawValue }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setFormData(prev => ({
            ...prev,
            type: tab,
            category: tab === 'expense' ? categories.expense[0] : categories.income[0],
            name: tab === 'transfer' ? 'Transfer' : '',
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if ((activeTab !== 'transfer' && (!formData.name || !formData.amount)) || (activeTab === 'transfer' && !formData.amount)) {
            setModalContent(
                 <div className="p-4 text-center">
                    <h3 className="text-lg font-bold mb-2 text-red-500">Gagal</h3>
                    <p className="text-gray-600 dark:text-gray-300">Nama transaksi dan nominal wajib diisi.</p>
                </div>
            )
            return;
        }

        const transactionData = {
            userId,
            type: formData.type,
            name: formData.name,
            amount: parseFloat(formData.amount),
            date: new Date(formData.date),
            note: formData.note,
            createdAt: serverTimestamp(),
        };

        if (formData.type === 'transfer') {
            transactionData.fromWalletId = formData.fromWalletId;
            transactionData.toWalletId = formData.toWalletId;
        } else {
            transactionData.walletId = formData.walletId;
            transactionData.category = formData.category;
        }

        await addTransaction(transactionData);
        setPage('home');
    };
    
    const handleScan = () => {
        setModalContent(
            <div className="text-center p-4">
                <CameraIcon className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">Fitur Pindai Struk (OCR)</h3>
                <p className="text-gray-600 dark:text-gray-300">
                    Dalam aplikasi nyata, fitur ini akan membuka kamera Anda untuk memindai struk.
                    Data seperti nama toko, tanggal, dan total belanja akan terisi otomatis ke dalam form.
                </p>
            </div>
        );
    };

    const commonFields = (
        <>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Transaksi</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nominal</label>
                <input 
                    type="text" 
                    inputMode="numeric"
                    name="amount" 
                    value={formData.amount ? new Intl.NumberFormat('id-ID').format(formData.amount) : ''}
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" 
                    placeholder="0"
                    required 
                />
            </div>
        </>
    );

    return (
        <div className="p-4 pb-24">
            <header className="flex items-center mb-6 relative">
                <button onClick={() => setPage('home')} className="mr-4 text-gray-700 dark:text-gray-200"><ChevronLeftIcon className="w-6 h-6"/></button>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Tambah Transaksi</h1>
                <button onClick={handleScan} className="absolute right-0 text-purple-600 dark:text-purple-400">
                    <CameraIcon className="w-6 h-6" />
                </button>
            </header>

            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1 mb-6">
                <button onClick={() => handleTabChange('expense')} className={`w-1/3 py-2 rounded-md text-sm font-semibold ${activeTab === 'expense' ? 'bg-white dark:bg-gray-900 text-purple-600 shadow' : 'text-gray-600 dark:text-gray-300'}`}>Pengeluaran</button>
                <button onClick={() => handleTabChange('income')} className={`w-1/3 py-2 rounded-md text-sm font-semibold ${activeTab === 'income' ? 'bg-white dark:bg-gray-900 text-purple-600 shadow' : 'text-gray-600 dark:text-gray-300'}`}>Pemasukan</button>
                <button onClick={() => handleTabChange('transfer')} className={`w-1/3 py-2 rounded-md text-sm font-semibold ${activeTab === 'transfer' ? 'bg-white dark:bg-gray-900 text-purple-600 shadow' : 'text-gray-600 dark:text-gray-300'}`}>Transfer</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'expense' && (
                    <>
                        {commonFields}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                            <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                {categories.expense.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sumber Dana</label>
                            <select name="walletId" value={formData.walletId} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance)})</option>)}
                            </select>
                        </div>
                    </>
                )}
                {activeTab === 'income' && (
                    <>
                        {commonFields}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                            <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                {categories.income.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tujuan Dana</label>
                            <select name="walletId" value={formData.walletId} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance)})</option>)}
                            </select>
                        </div>
                    </>
                )}
                {activeTab === 'transfer' && (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nominal</label>
                             <input 
                                type="text" 
                                inputMode="numeric"
                                name="amount" 
                                value={formData.amount ? new Intl.NumberFormat('id-ID').format(formData.amount) : ''}
                                onChange={handleInputChange} 
                                className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" 
                                placeholder="0"
                                required 
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dari</label>
                            <select name="fromWalletId" value={formData.fromWalletId} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance)})</option>)}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ke</label>
                            <select name="toWalletId" value={formData.toWalletId} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                {wallets.filter(w => w.id !== formData.fromWalletId).map(w => <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance)})</option>)}
                            </select>
                        </div>
                    </>
                )}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal & Waktu</label>
                    <input type="datetime-local" name="date" value={formData.date} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan (Opsional)</label>
                    <textarea name="note" value={formData.note} onChange={handleInputChange} rows="2" className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"></textarea>
                </div>
                <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors">Simpan</button>
            </form>
        </div>
    );
};

const DebtPage = ({ setPage, debts, addDebt, setModalContent, wallets, processDebtPayment, setSelectedDebtId, transactions, userId }) => {
    const totalLoanAmount = useMemo(() => debts.reduce((sum, debt) => sum + debt.totalLoan, 0), [debts]);
    const totalPaidDebt = useMemo(() => debts.reduce((sum, debt) => sum + debt.paidInstallments * debt.installment, 0), [debts]);
    const totalRemainingDebt = totalLoanAmount - totalPaidDebt;
    const paidPercentage = useMemo(() => {
        const raw = totalLoanAmount > 0 ? (totalPaidDebt / totalLoanAmount) * 100 : 0;
        return Math.round(Math.min(raw, 100));
    }, [totalLoanAmount, totalPaidDebt]);

    const totalInstallmentThisMonth = useMemo(() => {
        const today = new Date();
        return debts.reduce((sum, debt) => {
            const startDate = debt.startDate.toDate();
            const endDate = new Date(startDate);
            endDate.setMonth(startDate.getMonth() + debt.tenor);
            if (today >= startDate && today <= endDate && debt.paidInstallments < debt.tenor) {
                return sum + debt.installment;
            }
            return sum;
        }, 0);
    }, [debts]);
    
    const paidInstallmentThisMonth = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        return transactions
            .filter(tx => {
                const txDate = tx.date.toDate();
                return tx.type === 'expense' && 
                       tx.category === 'Hutang' &&
                       txDate.getMonth() === currentMonth &&
                       txDate.getFullYear() === currentYear;
            })
            .reduce((sum, tx) => sum + tx.amount, 0);
    }, [transactions]);

    const remainingInstallmentThisMonth = totalInstallmentThisMonth - paidInstallmentThisMonth;
    
    const paidThisMonthPercentage = useMemo(() => {
        const raw = totalInstallmentThisMonth > 0 ? (paidInstallmentThisMonth / totalInstallmentThisMonth) * 100 : 0;
        return Math.round(Math.min(raw, 100));
    }, [totalInstallmentThisMonth, paidInstallmentThisMonth]);


    const openAddDebtModal = () => {
        setModalContent(<AddDebtForm addDebt={addDebt} closeModal={() => setModalContent(null)} userId={userId} />);
    };
    
    const openPaymentModal = (debt) => {
        setModalContent(
            <PaymentSourceModal
                debt={debt}
                wallets={wallets}
                onPay={processDebtPayment}
                closeModal={() => setModalContent(null)}
            />
        );
    };

    return (
        <div className="p-4 pb-24">
            <header className="flex items-center mb-6">
                <button onClick={() => setPage('home')} className="mr-4 text-gray-700 dark:text-gray-200"><ChevronLeftIcon className="w-6 h-6"/></button>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Manajemen Hutang</h1>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Hutang Berjalan</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white my-2">{formatCurrency(totalLoanAmount)}</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 my-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${paidPercentage}%` }}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{paidPercentage}% lunas</span>
                    <span>Sisa: {formatCurrency(totalRemainingDebt)}</span>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-6 border border-gray-200 dark:border-gray-700">
                 <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">Total Angsuran Bulan Ini</h3>
                    <span className="font-semibold text-sm text-gray-600 dark:text-gray-300">{paidThisMonthPercentage}%</span>
                </div>
                <div className="flex justify-between items-end">
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(totalInstallmentThisMonth)}</p>
                    {remainingInstallmentThisMonth > 0 && <p className="text-sm text-red-500">Kurang: {formatCurrency(remainingInstallmentThisMonth)}</p>}
                </div>
                 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${paidThisMonthPercentage}%` }}></div>
                </div>
            </div>

            <button onClick={openAddDebtModal} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors mb-6">
                Tambah Hutang Baru
            </button>

            <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Rincian Daftar Hutang</h2>
                <div className="space-y-3">
                    {debts.map(debt => {
                        const remaining = debt.totalLoan - (debt.paidInstallments * debt.installment);
                        const progress = (debt.paidInstallments / debt.tenor) * 100;
                        const isPaidOff = debt.paidInstallments >= debt.tenor;
                        return (
                            <div key={debt.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-800 dark:text-gray-100">{debt.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Angsuran: {formatCurrency(debt.installment)} / bulan</p>
                                    </div>
                                    <button onClick={() => { setSelectedDebtId(debt.id); setPage('debtDetail'); }} className="text-gray-400 hover:text-purple-600">
                                        <InfoIcon className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="mt-3">
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-sm mt-1">
                                         <span className="text-gray-600 dark:text-gray-300">{debt.paidInstallments}/{debt.tenor} bulan</span>
                                        <span className="font-semibold text-gray-800 dark:text-gray-100">Sisa: {formatCurrency(remaining)}</span>
                                    </div>
                                </div>
                                {!isPaidOff && (
                                    <button onClick={() => openPaymentModal(debt)} className="w-full mt-4 bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600 transition-colors">
                                        Bayar Angsuran
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const DebtDetailPage = ({ debt, setPage, setModalContent, deleteDebt, updateDebt }) => {
    if (!debt) {
        return (
            <div className="p-4 pb-24 text-center">
                <p>Hutang tidak ditemukan.</p>
                <button onClick={() => setPage('debt')} className="text-purple-600 font-semibold mt-4">Kembali ke Daftar Hutang</button>
            </div>
        );
    }

    const totalHutang = debt.installment * debt.tenor;
    const sisaHutang = debt.totalLoan - (debt.paidInstallments * debt.installment);
    const isLunas = debt.paidInstallments >= debt.tenor;

    const openEditModal = () => {
        setModalContent(
            <EditDebtForm
                updateDebt={updateDebt}
                closeModal={() => setModalContent(null)}
                existingDebt={debt}
            />
        );
    };

    const confirmDelete = () => {
        setModalContent(
            <div className="p-4">
                <h3 className="text-lg font-bold mb-2 text-center">Konfirmasi Hapus</h3>
                <p className="text-center mb-6">Anda yakin ingin menghapus hutang "{debt.name}"? Tindakan ini tidak dapat dibatalkan.</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={() => setModalContent(null)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 font-semibold">Batal</button>
                    <button onClick={async () => { await deleteDebt(debt.id); setPage('debt'); setModalContent(null); }} className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold">Hapus</button>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 pb-24">
            <header className="flex items-center mb-6">
                <button onClick={() => setPage('debt')} className="mr-4 text-gray-700 dark:text-gray-200"><ChevronLeftIcon className="w-6 h-6"/></button>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">{debt.name}</h1>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6 border border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Status</span><span className={`font-semibold ${isLunas ? 'text-green-500' : 'text-yellow-500'}`}>{isLunas ? 'Lunas' : 'Belum Lunas'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Total Hutang</span><span className="font-semibold">{formatCurrency(totalHutang)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Sisa Hutang</span><span className="font-semibold">{formatCurrency(sisaHutang)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Angsuran / Bulan</span><span className="font-semibold">{formatCurrency(debt.installment)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Tenor</span><span className="font-semibold">{debt.tenor} bulan</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Jatuh Tempo</span><span className="font-semibold">Tanggal {debt.dueDate} setiap bulan</span></div>
                </div>
                <div className="flex space-x-3 mt-6">
                    <button onClick={openEditModal} className="flex-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 font-semibold py-2 rounded-lg flex items-center justify-center space-x-2"><EditIcon className="w-4 h-4"/><span>Edit</span></button>
                    <button onClick={confirmDelete} className="flex-1 bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 font-semibold py-2 rounded-lg flex items-center justify-center space-x-2"><TrashIcon className="w-4 h-4"/><span>Hapus</span></button>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Jadwal Cicilan</h2>
                <div className="space-y-2">
                    {Array.from({ length: debt.tenor }, (_, i) => i + 1).map(installmentNumber => {
                        const isPaid = installmentNumber <= debt.paidInstallments;
                        const dueDate = debt.startDate.toDate();
                        dueDate.setMonth(dueDate.getMonth() + installmentNumber - 1);
                        dueDate.setDate(debt.dueDate);
                        
                        return (
                            <div key={installmentNumber} className={`p-3 rounded-lg flex justify-between items-center ${isPaid ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">Angsuran ke-{installmentNumber}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                {isPaid && <span className="text-sm font-semibold text-green-600 dark:text-green-400 bg-green-200 dark:bg-green-500/20 px-2 py-1 rounded-full">Lunas</span>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const PaymentSourceModal = ({ debt, wallets, onPay, closeModal }) => {
    const [selectedWalletId, setSelectedWalletId] = useState(wallets[0]?.id || '');

    const handlePayment = () => {
        onPay(debt.id, selectedWalletId);
        closeModal();
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-2">Bayar Angsuran</h3>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-1">"{debt.name}"</p>
            <p className="text-center text-2xl font-bold text-purple-600 dark:text-purple-400 mb-6">{formatCurrency(debt.installment)}</p>
            
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pilih Sumber Dana:</label>
                <select 
                    value={selectedWalletId} 
                    onChange={(e) => setSelectedWalletId(e.target.value)}
                    className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                >
                    {wallets.map(wallet => (
                        <option key={wallet.id} value={wallet.id} disabled={wallet.balance < debt.installment}>
                            {wallet.name} ({formatCurrency(wallet.balance)})
                        </option>
                    ))}
                </select>
            </div>

            <button 
                onClick={handlePayment} 
                disabled={!selectedWalletId || wallets.find(w => w.id === selectedWalletId)?.balance < debt.installment}
                className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300"
            >
                Konfirmasi Pembayaran
            </button>
        </div>
    );
};

const AddDebtForm = ({ addDebt, closeModal, userId }) => {
    const [formData, setFormData] = useState({
        name: '', totalLoan: '', installment: '', tenor: '', paidInstallments: '0', startDate: new Date().toISOString().slice(0, 10), dueDate: '15'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'totalLoan' || name === 'installment') {
            const rawValue = value.replace(/\./g, '');
            if (/^\d*$/.test(rawValue)) {
                setFormData(prev => ({ ...prev, [name]: rawValue }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addDebt({
            userId,
            name: formData.name,
            totalLoan: parseFloat(formData.totalLoan),
            installment: parseFloat(formData.installment),
            tenor: parseInt(formData.tenor),
            paidInstallments: parseInt(formData.paidInstallments),
            startDate: new Date(formData.startDate),
            dueDate: parseInt(formData.dueDate),
            createdAt: serverTimestamp()
        });
        closeModal();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-4">Tambah Hutang Baru</h3>
            <input type="text" name="name" placeholder="Nama Hutang" value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
            <input type="text" inputMode="numeric" name="totalLoan" placeholder="Jumlah Pinjaman" value={formData.totalLoan ? new Intl.NumberFormat('id-ID').format(formData.totalLoan) : ''} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
            <input type="text" inputMode="numeric" name="installment" placeholder="Nilai Angsuran" value={formData.installment ? new Intl.NumberFormat('id-ID').format(formData.installment) : ''} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
            <input type="number" name="tenor" placeholder="Tenor (bulan)" value={formData.tenor} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
            <input type="number" name="paidInstallments" placeholder="Angsuran sudah dibayar" value={formData.paidInstallments} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
            <div className="flex space-x-2">
                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                <input type="number" name="dueDate" placeholder="Tgl Jatuh Tempo" value={formData.dueDate} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" min="1" max="31" />
            </div>
            <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors">Simpan Hutang</button>
        </form>
    );
};

const EditDebtForm = ({ updateDebt, closeModal, existingDebt }) => {
    const [formData, setFormData] = useState({
        name: existingDebt.name,
        totalLoan: existingDebt.totalLoan.toString(),
        installment: existingDebt.installment.toString(),
        tenor: existingDebt.tenor.toString(),
        paidInstallments: existingDebt.paidInstallments.toString(),
        startDate: existingDebt.startDate.toDate().toISOString().slice(0, 10),
        dueDate: existingDebt.dueDate.toString()
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'totalLoan' || name === 'installment') {
            const rawValue = value.replace(/\./g, '');
            if (/^\d*$/.test(rawValue)) {
                setFormData(prev => ({ ...prev, [name]: rawValue }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateDebt(existingDebt.id, {
            name: formData.name,
            totalLoan: parseFloat(formData.totalLoan),
            installment: parseFloat(formData.installment),
            tenor: parseInt(formData.tenor),
            paidInstallments: parseInt(formData.paidInstallments),
            startDate: new Date(formData.startDate),
            dueDate: parseInt(formData.dueDate)
        });
        closeModal();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-4">Edit Rincian Hutang</h3>
            <input type="text" name="name" placeholder="Nama Hutang" value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
            <input type="text" inputMode="numeric" name="totalLoan" placeholder="Jumlah Pinjaman" value={formData.totalLoan ? new Intl.NumberFormat('id-ID').format(formData.totalLoan) : ''} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
            <input type="text" inputMode="numeric" name="installment" placeholder="Nilai Angsuran" value={formData.installment ? new Intl.NumberFormat('id-ID').format(formData.installment) : ''} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
            <input type="number" name="tenor" placeholder="Tenor (bulan)" value={formData.tenor} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
            <input type="number" name="paidInstallments" placeholder="Angsuran sudah dibayar" value={formData.paidInstallments} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
            <div className="flex space-x-2">
                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                <input type="number" name="dueDate" placeholder="Tgl Jatuh Tempo" value={formData.dueDate} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" min="1" max="31" />
            </div>
            <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors">Simpan Perubahan</button>
        </form>
    );
};

const ProfilePage = ({ setPage, userData, toggleDarkMode, isDarkMode }) => {
    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <div className="p-4 pb-24">
            <header className="flex items-center mb-6">
                <button onClick={() => setPage('home')} className="mr-4 text-gray-700 dark:text-gray-200"><ChevronLeftIcon className="w-6 h-6"/></button>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Profil</h1>
            </header>

            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4">
                    <span className="text-4xl font-bold text-white">{userData?.name?.charAt(0) || 'U'}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{userData?.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{userData?.email}</p>
            </div>

            <div className="space-y-3">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Mode Gelap</span>
                    <button onClick={toggleDarkMode} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
                        {isDarkMode ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-gray-700" />}
                    </button>
                </div>
                <button onClick={() => setPage('manageWallets')} className="w-full text-left bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <span className="text-gray-800 dark:text-gray-100 font-semibold">Kelola Dompet & Akun</span>
                </button>
                <button className="w-full text-left bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <span className="text-gray-800 dark:text-gray-100">Ganti Password</span>
                </button>
                <button onClick={handleLogout} className="w-full text-left bg-white dark:bg-gray-800 p-4 rounded-lg mt-4 flex justify-between items-center">
                    <span className="text-red-500 font-semibold">Logout</span>
                    <LogOutIcon className="w-5 h-5 text-red-500"/>
                </button>
            </div>
        </div>
    );
};

const TransactionHistoryPage = ({ setPage, transactions, wallets, deleteTransaction, setModalContent }) => {
    const [filter, setFilter] = useState('all'); // 'all', 'daily', 'weekly', 'monthly'
    
    const getWalletName = (walletId) => wallets.find(w => w.id === walletId)?.name || 'N/A';

    const filteredTransactions = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let sortedTransactions = [...transactions]; // Already sorted from Firestore

        switch(filter) {
            case 'daily':
                return sortedTransactions.filter(tx => {
                    const txDate = tx.date.toDate();
                    return new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate()).getTime() === today.getTime();
                });
            case 'weekly':
                const firstDayOfWeek = new Date(today);
                firstDayOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday as start
                return sortedTransactions.filter(tx => tx.date.toDate() >= firstDayOfWeek);
            case 'monthly':
                return sortedTransactions.filter(tx => {
                    const txDate = tx.date.toDate();
                    return txDate.getFullYear() === today.getFullYear() && txDate.getMonth() === today.getMonth();
                });
            case 'all':
            default:
                return sortedTransactions;
        }
    }, [transactions, filter]);
    
    const openEditModal = (tx) => {
        setModalContent(
            <div className="text-center p-4">
                <EditIcon className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">Fitur Edit Transaksi</h3>
                <p className="text-gray-600 dark:text-gray-300">
                    Di aplikasi nyata, ini akan membuka form yang sama dengan "Tambah Transaksi",
                    namun sudah terisi dengan data dari transaksi '{tx.name}'.
                </p>
            </div>
        );
    };

    const confirmDelete = (tx) => {
        setModalContent(
            <div className="p-4">
                <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white text-center">Konfirmasi Hapus</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                    Anda yakin ingin menghapus transaksi '{tx.name}'? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex justify-end space-x-4">
                    <button onClick={() => setModalContent(null)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold">
                        Batal
                    </button>
                    <button 
                        onClick={async () => {
                            await deleteTransaction(tx);
                            setModalContent(null);
                        }} 
                        className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold"
                    >
                        Hapus
                    </button>
                </div>
            </div>
        );
    };

    const FilterButton = ({ afilter, label }) => {
        const isActive = filter === afilter;
        return (
            <button 
                onClick={() => setFilter(afilter)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                    isActive 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="p-4 pb-24">
            <header className="flex items-center mb-6">
                <button onClick={() => setPage('home')} className="mr-4 text-gray-700 dark:text-gray-200"><ChevronLeftIcon className="w-6 h-6"/></button>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Riwayat Transaksi</h1>
            </header>
            
            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                <FilterButton afilter="all" label="Semua" />
                <FilterButton afilter="daily" label="Harian" />
                <FilterButton afilter="weekly" label="Mingguan" />
                <FilterButton afilter="monthly" label="Bulanan" />
            </div>

            <div className="space-y-3">
                {filteredTransactions.length > 0 ? filteredTransactions.map(tx => {
                    const isIncome = tx.type === 'income';
                    const isTransfer = tx.type === 'transfer';
                    let icon;
                    if (isIncome) icon = <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full"><ArrowDownIcon className="w-5 h-5 text-green-500"/></div>;
                    else if (isTransfer) icon = <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full"><RepeatIcon className="w-5 h-5 text-blue-500"/></div>;
                    else icon = <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full"><ArrowUpIcon className="w-5 h-5 text-red-500"/></div>;
                    
                    return (
                        <div key={tx.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center">
                                {icon}
                                <div className="ml-4 flex-grow">
                                    <p className="font-bold text-gray-800 dark:text-gray-100">{tx.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {tx.date.toDate().toLocaleString('id-ID')} - {isTransfer ? `${getWalletName(tx.fromWalletId)} \u2192 ${getWalletName(tx.toWalletId)}` : getWalletName(tx.walletId)}
                                    </p>
                                </div>
                                <p className={`font-bold ${isIncome ? 'text-green-500' : isTransfer ? 'text-blue-500' : 'text-red-500'}`}>
                                    {isIncome ? '+' : isTransfer ? '' : '-'}{formatCurrency(tx.amount)}
                                </p>
                            </div>
                            <div className="flex justify-end space-x-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                <button onClick={() => openEditModal(tx)} className="p-1 text-gray-500 hover:text-blue-500"><EditIcon className="w-4 h-4" /></button>
                                <button onClick={() => confirmDelete(tx)} className="p-1 text-gray-500 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">Tidak ada transaksi pada periode ini.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const WalletForm = ({ closeModal, saveWallet, existingWallet, userId }) => {
    const [formData, setFormData] = useState({
        name: existingWallet?.name || '',
        type: existingWallet?.type || 'Bank',
        accountNumber: existingWallet?.accountNumber || ''
    });

    const isEditing = !!existingWallet;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const walletData = { 
            ...formData, 
            userId,
        };
        if (isEditing) {
            saveWallet(existingWallet.id, walletData);
        } else {
            saveWallet({ ...walletData, balance: 0, createdAt: serverTimestamp() });
        }
        closeModal();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-4">
                {isEditing ? 'Edit Dompet' : 'Tambah Dompet Baru'}
            </h3>
            <input type="text" name="name" placeholder="Nama Dompet (e.g., OVO, BNI)" value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
            <select name="type" value={formData.type} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <option value="Bank">Bank</option>
                <option value="eWallet">eWallet</option>
                <option value="Cash">Tunai</option>
            </select>
            <input type="text" name="accountNumber" placeholder="Nomor Rekening / Akun" value={formData.accountNumber} onChange={handleInputChange} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
            {!isEditing && <p className="text-xs text-gray-400">Saldo awal akan diatur ke Rp0. Tambah saldo melalui menu transaksi Pemasukan.</p>}
            <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors">Simpan</button>
        </form>
    );
};

const ManageWalletsPage = ({ setPage, wallets, addWallet, updateWallet, deleteWallet, setModalContent, userId, transactions }) => {
    const openFormModal = (wallet = null) => {
        setModalContent(
            <WalletForm 
                closeModal={() => setModalContent(null)}
                saveWallet={wallet ? updateWallet : addWallet}
                existingWallet={wallet}
                userId={userId}
            />
        );
    };

    const confirmDelete = (wallet) => {
        const isWalletInUse = transactions.some(tx => 
            tx.walletId === wallet.id || 
            tx.fromWalletId === wallet.id || 
            tx.toWalletId === wallet.id
        );

        if (isWalletInUse) {
            setModalContent(
                <div className="p-4 text-center">
                    <h3 className="text-lg font-bold mb-2 text-red-500">Gagal Menghapus</h3>
                    <p className="text-gray-600 dark:text-gray-300">Dompet ini tidak dapat dihapus karena sudah digunakan dalam riwayat transaksi.</p>
                </div>
            );
            return;
        }

        setModalContent(
            <div className="p-4">
                <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white text-center">Konfirmasi Hapus</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                    Anda yakin ingin menghapus dompet '{wallet.name}'?
                </p>
                <div className="flex justify-end space-x-4">
                    <button onClick={() => setModalContent(null)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold">
                        Batal
                    </button>
                    <button 
                        onClick={async () => {
                            await deleteWallet(wallet.id);
                            setModalContent(null);
                        }} 
                        className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold"
                    >
                        Hapus
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 pb-24">
            <header className="flex items-center mb-6">
                <button onClick={() => setPage('profile')} className="mr-4 text-gray-700 dark:text-gray-200"><ChevronLeftIcon className="w-6 h-6"/></button>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Kelola Dompet & Akun</h1>
            </header>

            <button onClick={() => openFormModal()} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors mb-6 flex items-center justify-center space-x-2">
                <PlusIcon className="w-6 h-6" />
                <span>Tambah Dompet Baru</span>
            </button>

            <div className="space-y-3">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Daftar Dompet</h2>
                {wallets.map(wallet => (
                    <div key={wallet.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <div className="flex-grow">
                                <p className="font-bold text-gray-800 dark:text-gray-100">{wallet.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{wallet.type} &bull; {wallet.accountNumber}</p>
                            </div>
                            <p className="font-semibold text-lg text-purple-600 dark:text-purple-400">{formatCurrency(wallet.balance)}</p>
                            <div className="ml-4 flex items-center space-x-2">
                                <button onClick={() => openFormModal(wallet)} className="p-1 text-gray-500 hover:text-blue-500"><EditIcon className="w-5 h-5" /></button>
                                <button onClick={() => confirmDelete(wallet)} className="p-1 text-gray-500 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main Application Layout ---
const MainApp = ({ userData, toggleDarkMode, isDarkMode, setModalContent }) => {
    const [page, setPage] = useState('home');
    const [selectedDebtId, setSelectedDebtId] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Data states
    const [wallets, setWallets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [debts, setDebts] = useState([]);

    const userId = userData?.uid;

    // --- Firestore Data Fetching ---
    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }
        setLoading(true);

        const collectionsToFetch = [
            { path: `users/${userId}/wallets`, setter: setWallets, orderByField: 'createdAt' },
            { path: `users/${userId}/transactions`, setter: setTransactions, orderByField: 'date', orderDirection: 'desc' },
            { path: `users/${userId}/debts`, setter: setDebts, orderByField: 'createdAt' },
        ];

        const unsubscribes = collectionsToFetch.map(({ path, setter, orderByField, orderDirection = 'asc' }) => {
            const q = query(collection(db, path), orderBy(orderByField, orderDirection));
            return onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setter(data);
            }, (error) => {
                if (error.code !== 'permission-denied') {
                    console.error("Firestore listener error:", error);
                }
            });
        });

        setLoading(false);

        // Cleanup function
        return () => unsubscribes.forEach(unsub => unsub());

    }, [userId]);


    // --- Firestore CRUD Operations ---
    const addTransaction = async (txData) => {
        const batch = writeBatch(db);
        
        // 1. Add transaction document
        const txCollectionRef = collection(db, `users/${userId}/transactions`);
        batch.set(doc(txCollectionRef), txData);

        // 2. Update wallet balance(s)
        if (txData.type === 'expense') {
            const walletRef = doc(db, `users/${userId}/wallets`, txData.walletId);
            const currentWallet = wallets.find(w => w.id === txData.walletId);
            batch.update(walletRef, { balance: currentWallet.balance - txData.amount });
        } else if (txData.type === 'income') {
            const walletRef = doc(db, `users/${userId}/wallets`, txData.walletId);
            const currentWallet = wallets.find(w => w.id === txData.walletId);
            batch.update(walletRef, { balance: currentWallet.balance + txData.amount });
        } else if (txData.type === 'transfer') {
            const fromWalletRef = doc(db, `users/${userId}/wallets`, txData.fromWalletId);
            const fromWallet = wallets.find(w => w.id === txData.fromWalletId);
            batch.update(fromWalletRef, { balance: fromWallet.balance - txData.amount });

            const toWalletRef = doc(db, `users/${userId}/wallets`, txData.toWalletId);
            const toWallet = wallets.find(w => w.id === txData.toWalletId);
            batch.update(toWalletRef, { balance: toWallet.balance + txData.amount });
        }
        
        await batch.commit();
    };

    const deleteTransaction = async (txToDelete) => {
        const batch = writeBatch(db);

        // 1. Delete transaction document
        const txDocRef = doc(db, `users/${userId}/transactions`, txToDelete.id);
        batch.delete(txDocRef);

        // 2. Revert wallet balance changes
        if (txToDelete.type === 'expense') {
            const walletRef = doc(db, `users/${userId}/wallets`, txToDelete.walletId);
            const currentWallet = wallets.find(w => w.id === txToDelete.walletId);
            batch.update(walletRef, { balance: currentWallet.balance + txToDelete.amount });
        } else if (txToDelete.type === 'income') {
            const walletRef = doc(db, `users/${userId}/wallets`, txToDelete.walletId);
            const currentWallet = wallets.find(w => w.id === txToDelete.walletId);
            batch.update(walletRef, { balance: currentWallet.balance - txToDelete.amount });
        } else if (txToDelete.type === 'transfer') {
            const fromWalletRef = doc(db, `users/${userId}/wallets`, txToDelete.fromWalletId);
            const fromWallet = wallets.find(w => w.id === txToDelete.fromWalletId);
            batch.update(fromWalletRef, { balance: fromWallet.balance + txToDelete.amount });

            const toWalletRef = doc(db, `users/${userId}/wallets`, txToDelete.toWalletId);
            const toWallet = wallets.find(w => w.id === txToDelete.toWalletId);
            batch.update(toWalletRef, { balance: toWallet.balance - txToDelete.amount });
        }

        await batch.commit();
    };

    const addDebt = async (debtData) => {
        await addDoc(collection(db, `users/${userId}/debts`), debtData);
    };
    
    const deleteDebt = async (debtId) => {
        await deleteDoc(doc(db, `users/${userId}/debts`, debtId));
    };
    
    const updateDebt = async (debtId, updatedData) => {
        await updateDoc(doc(db, `users/${userId}/debts`, debtId), updatedData);
    };

    const processDebtPayment = async (debtId, walletId) => {
        const debtToPay = debts.find(d => d.id === debtId);
        const payingWallet = wallets.find(w => w.id === walletId);

        if (!debtToPay || !payingWallet || payingWallet.balance < debtToPay.installment) {
            setModalContent(
                <div className="p-4 text-center">
                    <h3 className="text-lg font-bold mb-2 text-red-500">Gagal</h3>
                    <p className="text-gray-600 dark:text-gray-300">Saldo tidak cukup atau data tidak ditemukan.</p>
                </div>
            );
            return;
        }

        const batch = writeBatch(db);

        // 1. Update debt document
        const debtRef = doc(db, `users/${userId}/debts`, debtId);
        batch.update(debtRef, { paidInstallments: debtToPay.paidInstallments + 1 });

        // 2. Create new transaction for the payment
        const newTransaction = {
            userId,
            type: 'expense',
            name: `Bayar Angsuran: ${debtToPay.name}`,
            amount: debtToPay.installment,
            category: 'Hutang',
            date: new Date(),
            walletId: walletId,
            createdAt: serverTimestamp()
        };
        const txCollectionRef = collection(db, `users/${userId}/transactions`);
        batch.set(doc(txCollectionRef), newTransaction);

        // 3. Update wallet balance
        const walletRef = doc(db, `users/${userId}/wallets`, walletId);
        batch.update(walletRef, { balance: payingWallet.balance - debtToPay.installment });

        await batch.commit();

        setModalContent(
             <div className="p-4 text-center">
                <h3 className="text-lg font-bold mb-2 text-green-500">Berhasil</h3>
                <p className="text-gray-600 dark:text-gray-300">Pembayaran angsuran untuk {debtToPay.name} berhasil.</p>
            </div>
        );
    };

    const addWallet = async (walletData) => {
        await addDoc(collection(db, `users/${userId}/wallets`), walletData);
    };

    const updateWallet = async (walletId, updatedData) => {
        await updateDoc(doc(db, `users/${userId}/wallets`, walletId), updatedData);
    };

    const deleteWallet = async (walletId) => {
        await deleteDoc(doc(db, `users/${userId}/wallets`, walletId));
    };

    const renderPage = () => {
        if (loading) return <LoadingSpinner />;

        switch (page) {
            case 'home':
                return <HomePage setPage={setPage} wallets={wallets} transactions={transactions} debts={debts} userData={userData} setModalContent={setModalContent} />;
            case 'balance':
                return <BalancePage wallets={wallets} setPage={setPage} />;
            case 'addTransaction':
                return <AddTransactionPage setPage={setPage} wallets={wallets} addTransaction={addTransaction} setModalContent={setModalContent} userId={userId}/>;
            case 'debt':
                return <DebtPage setPage={setPage} debts={debts} addDebt={addDebt} setModalContent={setModalContent} wallets={wallets} processDebtPayment={processDebtPayment} setSelectedDebtId={setSelectedDebtId} transactions={transactions} userId={userId}/>;
            case 'debtDetail':
                const selectedDebt = debts.find(d => d.id === selectedDebtId);
                return <DebtDetailPage debt={selectedDebt} setPage={setPage} setModalContent={setModalContent} deleteDebt={deleteDebt} updateDebt={updateDebt} />;
            case 'profile':
                return <ProfilePage setPage={setPage} userData={userData} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />;
            case 'history':
                return <TransactionHistoryPage setPage={setPage} transactions={transactions} wallets={wallets} deleteTransaction={deleteTransaction} setModalContent={setModalContent} />;
            case 'manageWallets':
                return <ManageWalletsPage setPage={setPage} wallets={wallets} addWallet={addWallet} updateWallet={updateWallet} deleteWallet={deleteWallet} setModalContent={setModalContent} userId={userId} transactions={transactions}/>;
            default:
                return <HomePage setPage={setPage} wallets={wallets} transactions={transactions} debts={debts} userData={userData} setModalContent={setModalContent} />;
        }
    };

    return (
        <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-900 shadow-2xl min-h-screen relative">
            {renderPage()}
            
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto">
                <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 pt-2 pb-4 flex justify-around items-center rounded-t-2xl shadow-top">
                    <button onClick={() => setPage('home')} className={`flex flex-col items-center space-y-1 ${page === 'home' ? 'text-purple-600' : 'text-gray-500 dark:text-gray-400'}`}>
                        <HomeIcon className="w-6 h-6" />
                        <span className="text-xs">Home</span>
                    </button>
                    <button onClick={() => setPage('balance')} className={`flex flex-col items-center space-y-1 ${page === 'balance' ? 'text-purple-600' : 'text-gray-500 dark:text-gray-400'}`}>
                        <WalletIcon className="w-6 h-6" />
                        <span className="text-xs">Saldo</span>
                    </button>
                    <button onClick={() => setPage('addTransaction')} className="bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center -mt-8 shadow-lg shadow-purple-500/50">
                        <PlusIcon className="w-8 h-8"/>
                    </button>
                    <button onClick={() => setPage('debt')} className={`flex flex-col items-center space-y-1 ${page === 'debt' ? 'text-purple-600' : 'text-gray-500 dark:text-gray-400'}`}>
                        <DebtIcon className="w-6 h-6" />
                        <span className="text-xs">Hutang</span>
                    </button>
                    <button onClick={() => setPage('profile')} className={`flex flex-col items-center space-y-1 ${page === 'profile' ? 'text-purple-600' : 'text-gray-500 dark:text-gray-400'}`}>
                        <UserIcon className="w-6 h-6" />
                        <span className="text-xs">Profil</span>
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- APP CONTAINER ---
export default function App() {
    const [authStatus, setAuthStatus] = useState({ loading: true, user: null, userData: null });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    useEffect(() => {
        document.title = "ArtoQu";
        const faviconUrl = "/favicon.ico"; // Path to your favicon in the public folder
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = faviconUrl;

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Path to the user's profile document inside a subcollection
                const profileDocRef = doc(db, `users/${user.uid}/profile`, 'data');
                const unsubscribeUser = onSnapshot(profileDocRef, async (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        const userData = docSnapshot.data();
                        setAuthStatus({ loading: false, user, userData });
                    } else {
                        // This handles a race condition during registration and also if a user doc is missing for any reason.
                        const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
                        const timeSinceCreation = Date.now() - new Date(user.metadata.creationTime).getTime();
                        
                        // Give a 5-second grace period for the document to be created.
                        if (isNewUser && timeSinceCreation < 5000) {
                            return; 
                        }
                        
                        // If the document is still missing, we attempt to create it to self-heal the data.
                        console.warn(`Profile document for UID ${user.uid} not found. Attempting to create one.`);
                        try {
                            const defaultName = user.email.split('@')[0] || "Pengguna";
                            await setDoc(profileDocRef, {
                                uid: user.uid,
                                email: user.email,
                                name: defaultName,
                                createdAt: serverTimestamp()
                            });
                        } catch (error) {
                            console.error("Error creating missing profile document:", error);
                            setAuthStatus({ loading: false, user, userData: { email: user.email, name: 'Gagal membuat profil' } });
                        }
                    }
                }, (error) => {
                     if (error.code !== 'permission-denied') {
                        console.error("Profile listener error:", error);
                    }
                });
                return () => unsubscribeUser();
            } else {
                // User is signed out
                setAuthStatus({ loading: false, user: null, userData: null });
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    if (authStatus.loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="font-sans bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
            {authStatus.user ? (
                <MainApp
                    userData={{...authStatus.user, ...authStatus.userData}}
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                    setModalContent={setModalContent}
                />
            ) : (
                <AuthPage setModalContent={setModalContent} />
            )}
            {modalContent && <Modal onClose={() => setModalContent(null)}>{modalContent}</Modal>}
            <style>{`
                .shadow-top {
                    box-shadow: 0 -4px 10px -1px rgb(0 0 0 / 0.05);
                }
                .dark .shadow-top {
                    box-shadow: 0 -4px 15px -1px rgb(0 0 0 / 0.1);
                }
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
                /* Custom Scrollbar */
                .custom-scrollbar::-webkit-scrollbar {
                    display: none; /* Sembunyikan scrollbar untuk Chrome, Safari, dan Opera */
                }
                .custom-scrollbar {
                  -ms-overflow-style: none;  /* Sembunyikan scrollbar untuk IE dan Edge */
                  scrollbar-width: none;  /* Sembunyikan scrollbar untuk Firefox */
                }
            `}</style>
        </div>
    );
}
