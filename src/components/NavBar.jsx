import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { useLocation } from "react-router-dom";
export default function Navbar({ onOrderClick,  showOrderButton = true, showTrackButton = true }) {

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {

    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);

  }, []);

  return (

    <>
      <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        location.pathname === "/track"
          ? "bg-black/80 backdrop-blur-xl shadow-xl"
          : scrolled
          ? "bg-black/80 backdrop-blur-xl shadow-xl"
          : "bg-transparent"
      }`}
    >

        <div className="max-w-7xl mx-auto px-6">

          <div className="h-20 flex items-center justify-between">

            {/* LEFT LOGO */}

            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/")}
            >

              <img
                src="/favicon.png"
                alt="OwnTag"
                className="w-14 h-14 rounded-full border border-orange-500 shadow-lg"
              />

              <div className="hidden sm:block">

                <h2 className="text-white text-2xl font-bold">
                  OwnTag
                </h2>

                <p className="text-gray-300 text-xs tracking-widest">
                  YOUR VEHICLE • YOUR IDENTITY
                </p>

              </div>

            </div>

            {/* DESKTOP MENU */}

            <div className="hidden md:flex items-center gap-6">

              <button
                onClick={() => navigate("/")}
                className="text-white hover:text-orange-400 transition font-medium"
              >
                Home
              </button>

              

              {showTrackButton && (
              <button onClick={() => navigate("/track")} className="text-white hover:text-orange-400 transition font-medium">
                
                Track Order
              </button>
              )}

                            <button
                onClick={() => navigate("/customer-login")}
                className="text-white hover:text-orange-400 transition font-medium"
              >
                Customer Login
              </button>

              <button
                onClick={() => navigate("/customer-register")}
                className="text-white hover:text-orange-400 transition font-medium"
              >
                Register
              </button>

              {showOrderButton && (
              <button
                onClick={onOrderClick}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:scale-105 transition px-5 py-2 rounded-xl font-semibold shadow-lg"
              >
                Get 2 Tags @ ₹339
              </button>
            )}

              

            </div>

            {/* MOBILE BUTTON */}

            <button
              className="md:hidden text-white text-3xl"
              onClick={() => setOpen(!open)}
            >
              {open ? <HiX /> : <HiMenuAlt3 />}
            </button>

          </div>

        </div>

      </nav>

      {/* MOBILE MENU */}

      {open && (

        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-40 md:hidden">

          <div className="flex flex-col justify-center items-center h-full gap-8 text-xl">

            <button
              onClick={() => {
                navigate("/");
                setOpen(false);
              }}
              className="text-white hover:text-orange-400"
            >
              Home
            </button>

            {showTrackButton && (
              <button
                onClick={() => {
                  navigate("/track");
                  setOpen(false);
                }}
                className="text-white hover:text-orange-400"
              >
                Track Order
              </button>
            )}

            <button
              onClick={() => {
                navigate("/customer-login");
                setOpen(false);
              }}
              className="text-white hover:text-orange-400"
            >
              Customer Login
            </button>

            <button
              onClick={() => {
                navigate("/customer-register");
                setOpen(false);
              }}
              className="text-white hover:text-orange-400"
            >
              Register
            </button>

            {showOrderButton && (
              <button
                onClick={() => {
                  onOrderClick?.();
                  setOpen(false);
                }}
                className="bg-orange-500 px-8 py-3 rounded-xl font-semibold text-white shadow-lg"
              >
                Get 2 Tags @ ₹339
              </button>
            )}

            

          </div>

        </div>

      )}

    </>
  );
}