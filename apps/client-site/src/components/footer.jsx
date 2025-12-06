import React, { useState, useEffect } from "react";
import {
  FaTwitter,
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa";
import { Mail, Phone, MapPin, ArrowUp, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-green-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-green-500/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10">
          {/* Main Footer Content */}
          <div className="container mx-auto px-6 py-16">
            <div
              className={`transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              {/* Top Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                {/* Company Info */}
                <div className="lg:col-span-2">
                  <div className="mb-6">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent mb-2">
                      Expert Office Furnish
                    </h3>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      Transforming workspaces with premium furniture solutions.
                      Your trusted partner for modern, elegant, and functional
                      office environments.
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 text-gray-300 hover:text-white transition-colors duration-300">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mt-1">
                        <Phone className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex flex-col">
                        <a href="tel:0244371593" className="hover:text-green-400 md:pointer-events-none">0244371593</a>
                        <a href="tel:0244280532" className="hover:text-green-400 md:pointer-events-none">0244280532</a>
                        <a href="tel:0571386600" className="hover:text-green-400 md:pointer-events-none">0571386600</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors duration-300">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-yellow-400" />
                      </div>
                      <a href="mailto:expertofficefurnish@yahoo.com" className="hover:text-yellow-400">expertofficefurnish@yahoo.com</a>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors duration-300">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-green-400" />
                      </div>
                      <span>Atomic Hills Estate Road, Near ASI PLAZA</span>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="text-xl font-semibold text-white mb-6 relative">
                    Quick Links
                    <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full"></div>
                  </h4>
                  <ul className="space-y-3">
                    {[
                      { name: "Home", path: "/home" },
                      { name: "Products", path: "/shop" },
                      { name: "Gallery", path: "/gallery" },
                      { name: "Our Services", path: "/services" },
                      { name: "Cart", path: "/cart" },
                    ].map((link, index) => (
                      <li key={index}>
                        <Link
                          to={link.path}
                          className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center gap-2 group"
                        >
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full group-hover:bg-yellow-400 transition-colors duration-300"></div>
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Support Links */}
                <div>
                  <h4 className="text-xl font-semibold text-white mb-6 relative">
                    Support
                    <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full"></div>
                  </h4>
                  <ul className="space-y-3">
                    {[
                      { name: "Contact Us", path: "/contact" },
                      { name: "Login", path: "/login" },
                      { name: "Sign Up", path: "/signup" },
                    ].map((link, index) => (
                      <li key={index}>
                        <Link
                          to={link.path}
                          className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center gap-2 group"
                        >
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full group-hover:bg-green-400 transition-colors duration-300"></div>
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Social Media Section */}
              <div className="border-t border-gray-700 pt-8 mb-8">
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-white mb-6">
                    Connect With Us
                  </h4>
                  <div className="flex justify-center space-x-6">
                    {[
                      {
                        icon: FaTwitter,
                        url: "https://x.com/expertfurnish?s=11",
                        color: "hover:bg-blue-500",
                        name: "Twitter",
                      },
                      {
                        icon: FaInstagram,
                        url: "https://www.instagram.com/expertofficefurnish?igsh=MW1kMHlyMXAyd24zMg==",
                        color: "hover:bg-pink-500",
                        name: "Instagram",
                      },
                      {
                        icon: FaFacebookF,
                        url: "https://www.facebook.com/expertofficefurnishgh/",
                        color: "hover:bg-blue-600",
                        name: "Facebook",
                      },
                      {
                        icon: FaLinkedinIn,
                        url: "https://www.linkedin.com/company/expert-office-furnish-company-limited/",
                        color: "hover:bg-blue-700",
                        name: "LinkedIn",
                      },
                    ].map((social, index) => {
                      const IconComponent = social.icon;
                      return (
                        <a
                          key={index}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.name}
                          className={`w-12 h-12 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center text-white ${social.color} transition-all duration-300 hover:scale-110 hover:shadow-lg border border-white/20`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="border-t border-gray-700 pt-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <span>
                      © 2025 Expert Office Furnish Ltd. All rights reserved.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <span>Made with</span>
                    <Heart className="w-4 h-4 text-red-400 animate-pulse" />
                    <span>in Ghana</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gradient-to-r from-green-500 to-yellow-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center justify-center animate-bounce"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
