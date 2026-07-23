import {
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaQrcode
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

export default function Footer() {

  const navigate = useNavigate();

  const year = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/10">

      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">

          {/* Company */}

          <div>

            <div className="flex items-center gap-3 mb-5">

              <img
                src="/favicon.png"
                alt="OwnTag"
                className="w-12 h-12 rounded-full"
              />

              <div>

                <h2 className="text-2xl font-bold text-white">
                  OwnTag
                </h2>

                <p className="text-gray-400 text-sm">
                  Your Vehicle • Your Identity
                </p>

              </div>

            </div>

            <p className="text-gray-400 leading-7">

              OwnTag is India's smart vehicle QR solution that
              helps anyone contact the vehicle owner instantly
              with a simple QR scan.

            </p>

          </div>

          {/* Quick Links */}

          <div>

            <h3 className="text-xl font-bold text-white mb-6">
              Quick Links
            </h3>

            <ul className="space-y-4">

              <li>
                <button
                  onClick={() => navigate("/")}
                  className="text-gray-400 hover:text-orange-500 transition"
                >
                  Home
                </button>
              </li>

              <li>
                <button
                  onClick={() => navigate("/track")}
                  className="text-gray-400 hover:text-orange-500 transition"
                >
                  Track Order
                </button>
              </li>

              

            </ul>

          </div>

          {/* Contact */}

          <div>

            <h3 className="text-xl font-bold text-white mb-6">
              Contact
            </h3>

            <div className="space-y-5">

              <div className="flex gap-4">

                <FaPhoneAlt className="text-orange-500 mt-1" />

                <span className="text-gray-400">
                  +91 8886983273
                </span>

              </div>

              <div className="flex gap-4">

                <FaEnvelope className="text-orange-500 mt-1" />

                <span className="text-gray-400">
                  owntag.in@gmail.com
                </span>

              </div>

              <div className="flex gap-4">

                <FaMapMarkerAlt className="text-orange-500 mt-1" />

                <span className="text-gray-400">
                  Guntur, Andhra Pradesh, India
                </span>

              </div>

            </div>

          </div>

          {/* Social */}

          <div>

            <h3 className="text-xl font-bold text-white mb-6">
              Follow Us
            </h3>

            <div className="flex gap-5 text-2xl">

              <a
                href="https://www.instagram.com/owntag.in?utm_source=qr&igsh=aTF3cGtndnNqYmJr"
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition"
              >
                <FaInstagram className="text-white" />
              </a>

              <a
                href="https://youtube.com/@owntag-g7c?si=UzjKZuGpGaObR3bW"
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 transition"
              >
                <FaYoutube className="text-white" />
              </a>

              <a
                href="https://www.linkedin.com/in/owntag-your-vehicle-your-identity-29573041b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition"
              >
                <FaLinkedin className="text-white" />
              </a>

            </div>

            <div className="mt-8 bg-white/10 rounded-2xl p-5">

              <div className="flex items-center gap-3 mb-3">

                <FaQrcode className="text-orange-500 text-2xl" />

                <h4 className="text-white font-bold">
                  OwnTag
                </h4>

              </div>

              <p className="text-gray-400 text-sm">

                Smart QR Identity for your vehicle.
                Scan • Connect • Move.

              </p>

            </div>

          </div>

        </div>

        {/* Bottom */}

        <div className="border-t border-white/10 mt-14 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">

          <p className="text-gray-500 text-center">

            © {year} OwnTag. All Rights Reserved.

          </p>

          <div className="flex gap-8">

            <button className="text-gray-500 hover:text-orange-500 transition">
              Privacy Policy
            </button>

            <button className="text-gray-500 hover:text-orange-500 transition">
              Terms & Conditions
            </button>

          </div>

        </div>

      </div>

    </footer>
  );
}