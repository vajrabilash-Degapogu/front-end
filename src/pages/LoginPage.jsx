import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "../css/LoginPage.css";
import Navbar from "../components/NavBar";

function LoginPage() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const login = async () => {

  if (!username.trim() || !password.trim()) {
    setError("⚠ Please enter username and password.");
    setTimeout(() => setError(""), 2500);
    return;
  }

  try {

    const response = await api.post("/auth/login", {
      username,
      password,
    });

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("username", response.data.username);

    setMessage("✅ Login Successful!");

    setTimeout(() => {
      navigate("/admin");
    }, 800);

  } catch (err) {

    setPassword("");

    setError("❌ Invalid username or password.");

    setTimeout(() => setError(""), 2500);

  }

};

  return (
    <>
      {/* SUCCESS MESSAGE */}
      {message && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}

      <div>
        <Navbar showOrderButton={false} />

        <div className="login-bg">
          <div className="login-card" >

            <h2>🔐 Admin Login</h2>

            <input
              className="text-black"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") login();
              }}
            />

            <input
              className="text-black"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") login();
              }}
            />

            <button onClick={login}>
              Login
            </button>

          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;