import React, { useState } from 'react';

interface VerifyOtpPageProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

const VerifyOtpPage: React.FC<VerifyOtpPageProps> = ({ email, onVerified, onBack }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || data?.error || 'Verify failed');
      onVerified();
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat p-4" style={{ backgroundImage: "url('https://picsum.photos/id/122/1920/1080')" }}>
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

      <div className="relative z-10 flex flex-col items-center text-center text-white max-w-md w-full">
        <div className="mt-10 w-full bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white">Xác minh OTP</h2>
          <p className="text-gray-300 mt-1">Nhập mã OTP đã gửi đến: {email}</p>

          <form onSubmit={handleVerify} className="mt-6 w-full">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Nhập mã OTP 6 số"
              className="w-full px-4 py-3 bg-white/20 border-2 border-transparent focus:border-blue-500 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-0 transition duration-300"
              required
            />

            {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 bg-gray-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-600"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Xác minh'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;





