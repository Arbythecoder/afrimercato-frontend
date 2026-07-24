import { useState } from 'react';
import { userAPI, securityAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Shield, ShieldAlert, Smartphone, ChevronLeft, Key, Copy, CheckCircle2, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';

function SecuritySettings() {
    const { user, setUser } = useAuth();

    // PASSWORD CHANGE STATES
    const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdError, setPwdError] = useState('');
    const [pwdSuccess, setPwdSuccess] = useState('');

    // PASSWORD VISIBILITY STATES
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);
    const [showDisablePwd, setShowDisablePwd] = useState(false);

    // 2FA STATES
    const [isSettingUp, setIsSettingUp] = useState(false);
    const [isDisabling, setIsDisabling] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [manualKey, setManualKey] = useState('');
    const [copied, setCopied] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // PASSWORD HANDLER
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPwdError('');
        setPwdSuccess('');

        if (pwdData.newPassword !== pwdData.confirmPassword) {
            setPwdError('New passwords do not match.');
            return;
        }
        if (pwdData.newPassword.length < 8) {
            setPwdError('New password must be at least 8 characters long.');
            return;
        }

        setPwdLoading(true);
        try {
            await userAPI.changePassword({
                currentPassword: pwdData.currentPassword,
                newPassword: pwdData.newPassword,
                confirmNewPassword: pwdData.confirmPassword,
            });
            setPwdSuccess('Password updated successfully!');
            setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'An error occurred while updating the password.';
            setPwdError(errorMessage);
        } finally {
            setPwdLoading(false);
        }
    }

    // 2FA HANDLERS
    const handleInitiateSetup = async () => {
        setLoading(true); setError(''); setSuccess('');
        try {
            const res = await securityAPI.setup2FA();
            if (res.success) {
                setQrCode(res.data.qrCode);
                setManualKey(res.data.manualEntryKey);
                setIsSettingUp(true);
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError('Failed to initiate 2FA setup.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySetup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await securityAPI.verify2FA(verificationCode);
            if (res.success) {
                setSuccess('Two-Factor Authentication is now enabled!');

                const updatedUser = { ...user, twoFactorEnabled: true };
                setUser(updatedUser);
                localStorage.setItem('afrimercato_user', JSON.stringify(updatedUser));

                setIsSettingUp(false);
                setVerificationCode('');
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError(err.message || 'Invalid verification code.');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable2FA = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await securityAPI.disable2FA({
                password,
                twoFactorCode: verificationCode
            });
            if (res.success) {
                setSuccess('Two-Factor Authentication has been disabled.');

                const updatedUser = { ...user, twoFactorEnabled: false };
                setUser(updatedUser);
                localStorage.setItem('afrimercato_user', JSON.stringify(updatedUser));

                setIsDisabling(false);
                setPassword('');
                setVerificationCode('');
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError(err.message || 'Failed to disable 2FA. Check credentials.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(manualKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
                <Link to="/admin/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-medium">
                    <ChevronLeft size={16} /> Dashboard
                </Link>
                <span className="text-gray-200">/</span>
                <span className="text-gray-900 font-semibold text-sm">Security Settings</span>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-6">
                {/* CARD 1: CHANGE PASSWORD                     */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3.5 rounded-full shadow-sm bg-blue-50 text-blue-600">
                            <Lock size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Ensure your account is using a long, random password to stay secure.
                            </p>
                        </div>
                    </div>

                    {pwdError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3 animate-fadeIn">
                            <AlertCircle size={20} className="shrink-0" />
                            <p className="text-sm font-semibold">{pwdError}</p>
                        </div>
                    )}
                    {pwdSuccess && (
                        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-3 animate-fadeIn">
                            <CheckCircle2 size={20} className="shrink-0" />
                            <p className="text-sm font-semibold">{pwdSuccess}</p>
                        </div>
                    )}

                    <form onSubmit={handlePasswordChange} className="max-w-2xl space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showCurrentPwd ? 'text' : 'password'}
                                    value={pwdData.currentPassword}
                                    onChange={(e) => setPwdData({ ...pwdData, currentPassword: e.target.value })}
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-afri-green bg-gray-50 focus:bg-white transition-colors"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showCurrentPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showNewPwd ? 'text' : 'password'}
                                        value={pwdData.newPassword}
                                        onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-afri-green bg-gray-50 focus:bg-white transition-colors"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPwd(!showNewPwd)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPwd ? 'text' : 'password'}
                                        value={pwdData.confirmPassword}
                                        onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-afri-green bg-gray-50 focus:bg-white transition-colors"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={pwdLoading}
                                className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-md disabled:opacity-50"
                            >
                                {pwdLoading ? 'Updating Password...' : 'Save New Password'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* CARD 2: TWO-FACTOR AUTHENTICATION           */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`p-3.5 rounded-full shadow-sm ${user?.twoFactorEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                {user?.twoFactorEnabled ? <Shield size={28} /> : <ShieldAlert size={28} />}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {user?.twoFactorEnabled
                                        ? 'Your account is secured with an authenticator app.'
                                        : 'Add an extra layer of security to your admin account.'}
                                </p>
                            </div>
                        </div>

                        {!isSettingUp && !isDisabling && (
                            <div>
                                {user?.twoFactorEnabled ? (
                                    <button
                                        onClick={() => setIsDisabling(true)}
                                        className="px-5 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors shadow-sm"
                                    >
                                        Disable 2FA
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleInitiateSetup}
                                        disabled={loading}
                                        className="px-6 py-2.5 bg-afri-green text-white font-bold rounded-xl hover:bg-afri-green-dark transition-all shadow-md hover:shadow-lg active:scale-95"
                                    >
                                        {loading ? 'Generating...' : 'Set Up 2FA'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3 animate-fadeIn">
                            <AlertCircle size={20} className="shrink-0" />
                            <p className="text-sm font-semibold">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-3 animate-fadeIn">
                            <CheckCircle2 size={20} className="shrink-0" />
                            <p className="text-sm font-semibold">{success}</p>
                        </div>
                    )}

                    {/* SETUP VIEW */}
                    {isSettingUp && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                                    <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"><Smartphone size={18} /></div>
                                    <h3 className="font-bold text-gray-900">Step 1: Scan QR Code</h3>
                                </div>

                                <div className="p-6 flex flex-col md:flex-row items-center gap-8">
                                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 shrink-0">
                                        <img src={qrCode} alt="2FA QR Code" className="w-40 h-40" />
                                    </div>

                                    <div className="flex-1 w-full text-center md:text-left">
                                        <p className="text-gray-600 text-sm mb-5">
                                            Open <span className="font-bold text-gray-900">Microsoft Authenticator</span> or <span className="font-bold text-gray-900">Google Authenticator</span> and scan the QR code to the left.
                                        </p>

                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Can't scan? Use Manual Key</p>
                                            <div className="sm:flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2.5 shadow-sm">
                                                <code className="font-mono text-[8.5px] sm:text-sm font-bold text-afri-green tracking-widest sm:pl-2">
                                                    {manualKey}
                                                </code>
                                                <button
                                                    onClick={copyToClipboard}
                                                    type="button"
                                                    className="p-2 bg-gray-50 hover:bg-gray-100 rounded-md text-gray-500 hover:text-afri-green transition-colors flex items-center gap-2"
                                                >
                                                    {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                                                    <span className="text-xs font-bold">{copied ? 'Copied!' : 'Copy'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center gap-3">
                                    <div className="bg-amber-100 text-amber-600 p-1.5 rounded-lg"><Key size={18} /></div>
                                    <h3 className="font-bold text-gray-900">Step 2: Verify Code</h3>
                                </div>

                                <div className="p-8">
                                    <p className="text-gray-600 text-sm text-center mb-6">
                                        Enter the 6-digit code generated by your app to verify the setup.
                                    </p>

                                    <form onSubmit={handleVerifySetup} className="max-w-xs mx-auto">
                                        <input
                                            type="text"
                                            maxLength="6"
                                            placeholder="000000"
                                            value={verificationCode}
                                            onChange={(e) => {
                                                setVerificationCode(e.target.value.replace(/\D/g, ''));
                                                setError('');
                                            }}
                                            className="w-full text-center text-2xl sm:text-4xl tracking-[0.5em] font-mono font-black text-gray-900 border-2 border-gray-200 rounded-xl py-4 focus:border-afri-green focus:ring-4 focus:ring-green-50 transition-all mb-6 placeholder:text-gray-300 shadow-inner"
                                            required
                                            autoFocus
                                        />

                                        <button
                                            type="submit"
                                            disabled={loading || verificationCode.length !== 6}
                                            className="w-full py-4 bg-afri-green text-white font-bold rounded-xl hover:bg-afri-green-dark transition-all shadow-md hover:shadow-lg disabled:opacity-50 active:scale-95 text-lg"
                                        >
                                            {loading ? 'Verifying...' : 'Verify & Enable'}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div className="text-center mt-6">
                                <button
                                    onClick={() => {
                                        setIsSettingUp(false);
                                        setError('');
                                        setVerificationCode('');
                                    }}
                                    className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                                >
                                    Cancel Setup
                                </button>
                            </div>
                        </div>
                    )}

                    {/* DISABLE VIEW */}
                    {isDisabling && (
                        <div className="animate-fadeIn mt-6 bg-red-50 rounded-xl border border-red-100 p-6 sm:p-8">
                            <h3 className="font-bold text-red-800 text-lg mb-2">Disable Two-Factor Authentication</h3>
                            <p className="text-sm text-red-600 mb-6">
                                To turn off 2FA, please verify your password and enter one final code from your authenticator app.
                            </p>

                            <form onSubmit={handleDisable2FA} className="max-w-md mx-auto space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-red-900 mb-1.5">Account Password</label>
                                    <div className="relative">
                                        <input
                                            type={showDisablePwd ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 pr-12 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 bg-white"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowDisablePwd(!showDisablePwd)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-700 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showDisablePwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-red-900 mb-1.5">6-Digit Authenticator Code</label>
                                    <input
                                        type="text"
                                        maxLength="6"
                                        placeholder="000000"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                        className="w-full px-4 py-3 border border-red-200 rounded-xl font-mono tracking-[0.5em] text-center text-2xl focus:ring-2 focus:ring-red-500 bg-white"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setIsDisabling(false); setError(''); setPassword(''); setVerificationCode(''); }}
                                        className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-md disabled:opacity-50"
                                    >
                                        {loading ? 'Disabling...' : 'Confirm Disable'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SecuritySettings;