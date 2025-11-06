import { useState, useEffect } from "react";
import type React from "react";
import { useStore } from "@/hooks/useStore";

interface CreatePasswordPageProps {
  emailProp?: string;
}

export default function CreatePasswordPage({ emailProp }: CreatePasswordPageProps) {
  const { createPassword, emailRegisterTemp } = useStore();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Ưu tiên email từ prop (App truyền sau verify), sau đó đến emailRegisterTemp
    const selected = (emailProp || emailRegisterTemp || "").trim().toLowerCase();
    setEmail(selected);
  }, [emailProp, emailRegisterTemp]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu không trùng khớp");
      return;
    }

    try {
      setLoading(true);
      // Gọi store action: tạo password và tự động login
      await createPassword(email.trim().toLowerCase(), password);
      // Sau khi login thành công, App sẽ tự điều hướng đến Onboarding nếu chưa onboarded
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const cannotSubmit = !email || loading;

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#141414]">
      <div className="absolute w-full h-full bg-gradient-to-b from-transparent to-black/70 backdrop-blur-sm"></div>

      <div className="relative z-10 w-[380px] bg-white/10 rounded-2xl p-7 shadow-xl border border-white/20">
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Create your password
        </h1>
        <p className="text-gray-300 text-center mb-5 text-sm">
          Email: {email}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Password"
            className="p-3 rounded-lg bg-white/15 text-white outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="p-3 rounded-lg bg-white/15 text-white outline-none"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
          disabled={cannotSubmit}
            type="submit"
            className="bg-pink-500 hover:bg-pink-600 transition-all text-white py-3 rounded-lg font-semibold disabled:opacity-60"
          >
          {!email ? "Waiting for email..." : (loading ? "Processing..." : "Save Password")}
          </button>
        </form>
      </div>
    </div>
  );
}
