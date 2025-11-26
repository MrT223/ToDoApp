import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, LockKeyhole, User as UserIcon } from "lucide-react";
import API from "@/lib/axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      return toast.error("Vui lòng nhập đầy đủ thông tin.");
    }
    if (password.length < 6) {
      return toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
    }

    setIsSubmitting(true);
    try {
      const res = await API.post("/auth/register", {
        username,
        email,
        password,
      });

      const userData = res.data;
      login(userData);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Đăng ký thất bại. Email hoặc Tên người dùng đã được sử dụng.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white relative flex items-center justify-center">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(120deg, #d5c5ff 0%, #a7f3d0 50%, #f0f0f0 100%)",
        }}
      />

      <Card className="max-w-md w-full p-6 z-10 shadow-custom-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-primary font-extrabold">
            Đăng Ký Tài Khoản
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Tạo tài khoản cá nhân để quản lý Todo List.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Tên người dùng
              </label>
              <div className="relative">
                {" "}
                <Input
                  id="username"
                  type="text"
                  placeholder="Tên của Master"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="pl-10"
                />
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-0.5 size-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                {" "}
                <Input
                  id="email"
                  type="email"
                  placeholder="Email của Master"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-0.5 size-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Mật khẩu (ít nhất 6 ký tự)
              </label>
              <div className="relative">
                {" "}
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                />
                <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-0.5 size-4 text-muted-foreground" />
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full h-11"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang đăng ký..." : "Đăng Ký"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-semibold"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
