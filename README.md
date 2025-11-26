# 📝 TodoApp

[![React](https://img.shields.io/badge/React-17.0.2-blue?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-teal?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ShadCN](https://img.shields.io/badge/ShadCN-ui-purple)](https://shadcn-ui.com/)
[![Docker](https://img.shields.io/badge/Docker-20.10-blue?logo=docker&logoColor=white)](https://www.docker.com/)

Deployed on: [Render](https://todoapp-ozbt.onrender.com)

---

## 🚀 Giới thiệu

**TodoApp** là ứng dụng quản lý công việc cá nhân, được xây dựng với:

- **Frontend**: React + TailwindCSS 4 + ShadCN UI
- **Backend**: Node.js + Express
- **Database**: MongoDB

Ứng dụng cho phép:

- Thêm, sửa, xóa công việc.
- Đánh dấu hoàn thành.
- Lọc theo trạng thái.
- Responsive trên mọi thiết bị.

---

## ⚙️ Công nghệ sử dụng

| Công nghệ             | Vai trò                     |
| --------------------- | --------------------------- |
| **React**             | Frontend, UI động           |
| **Node.js + Express** | Backend API                 |
| **MongoDB**           | Database NoSQL              |
| **TailwindCSS 4**     | Giao diện nhanh, responsive |
| **ShadCN UI**         | Component UI hiện đại       |
| **Docker**            | Chạy container dễ dàng      |

---

## ⚡ Triển khai & chạy dự án với Docker

### 1️⃣ Clone dự án

```bash
git clone https://github.com/MrT223/ToDoApp.git
cd TodoApp
```

### 2️⃣ Chạy toàn bộ ứng dụng bằng Docker Compose

```bash
docker compose up --build -d
```

> Lệnh này sẽ build và chạy **MongoDB**, **backend**, **frontend** trong các container.

### 3️⃣ Kiểm tra các container đang chạy

```bash
docker ps
```

Container chính:

- `todo-mongodb` (MongoDB)
- `todo-backend` (Node.js API)
- `todo-frontend` (React App)

### 4️⃣ Truy cập ứng dụng

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5001/api/tasks](http://localhost:5001/api/tasks)

### 5️⃣ Dừng ứng dụng

```bash
docker compose down
```

> Giữ dữ liệu MongoDB vì đã mount volume `mongodb_data`.

---

## 🔗 Nguồn tham khảo

[![GitHub](https://img.shields.io/badge/GitHub-Visit-black?logo=github&logoColor=white)](https://github.com/mtikcode/mtikcode_todoX)
[![YouTube](https://img.shields.io/badge/YouTube-Watch-red?logo=youtube&logoColor=white)](https://www.youtube.com/watch?v=L3a9c8M55Fo&t=2783s)
