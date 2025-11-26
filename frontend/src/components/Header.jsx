import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-2 text-center relative">
      {/* LOGOUT BUTTON - Hiển thị khi đã đăng nhập */}
      {user && (
        <div className="absolute top-0 right-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-destructive hover:text-destructive/80"
          >
            <LogOut className="size-4" />
            Thoát
          </Button>
        </div>
      )}

      {/* LOGIN/REGISTER LINKS - Hiển thị khi chưa đăng nhập */}
      {!user && (
        <div className="absolute top-0 right-0 flex gap-2">
          <Link to="/login">
            <Button variant="outline" size="sm">
              Đăng nhập
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="gradient" size="sm">
              Đăng ký
            </Button>
          </Link>
        </div>
      )}

      <h1 className="text-4xl font-bold text-transparent bg-primary bg-clip-text">
        To-Do App
      </h1>

      <p className="text-muted-foreground ">
        {user
          ? `Chào mừng, ${user.username}!`
          : "Không có việc gì khó, chí sợ lòng không bền"}
      </p>
    </div>
  );
};

export default Header;
