import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase/supabaseClient";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  User,
  MessageSquare,
  Sparkles,
  Award,
  Users,
  Star,
  ArrowRight,
} from "lucide-react";
import Header from "../components/header";
import Footer from "../components/footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    message: "",
    type: "",
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: "", type: "" });

    const { name, email, phone, subject, message } = formData;

    if (!name || !email || !subject || !message) {
      setStatus({
        loading: false,
        message: "All required fields must be filled.",
        type: "error",
      });
      return;
    }

    try {
      // Insert into contact_messages table using the correct schema
      const { error } = await supabase.from("contact_messages").insert([
        {
          name: name.trim(),
          email: email.trim(),
          phone_numbers: phone ? parseFloat(phone.replace(/\D/g, "")) : null, // Convert phone to numeric, remove non-digits
          subject: subject.trim(),
          message: message.trim(),
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Contact form error:", error);
        setStatus({
          loading: false,
          message: "Failed to send message. Please try again.",
          type: "error",
        });
      } else {
        setStatus({ loading: false, message: "", type: "success" });
        setIsSubmitted(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });

        // Reset form after success animation
        setTimeout(() => {
          setIsSubmitted(false);
          setStatus({ loading: false, message: "", type: "" });
        }, 3000);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setStatus({
        loading: false,
        message: "An unexpected error occurred. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 text-gray-900 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-40 h-40 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-gradient-to-r from-green-300 to-yellow-300 rounded-full blur-2xl animate-bounce"></div>
      </div>

      <Header />

      {/* Enhanced Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-yellow-600/10"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div
            className={`inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6 transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <Mail className="w-4 h-4 mr-2" />
            Get In Touch
          </div>

          <h1
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 transition-all duration-700 delay-200 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            Ready to Transform{" "}
            <span className="bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              Your Space?
            </span>
          </h1>

          <p
            className={`text-xl text-gray-600 mb-8 max-w-2xl mx-auto transition-all duration-700 delay-400 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            We're here to help bring your vision to life. Connect with our
            experts for personalized solutions.
          </p>
        </div>
      </section>
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information Sidebar */}
          <div
            className={`lg:col-span-1 transition-all duration-700 delay-600 ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-10 opacity-0"
            }`}
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-100 p-8 sticky top-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-yellow-500 rounded-2xl mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent mb-2">
                  Contact Information
                </h3>
                <p className="text-gray-600">Let's start a conversation</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-2xl hover:shadow-lg transition-all duration-300">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-semibold text-gray-800">Call Us</p>
                    <a href="tel:0244371593" className="text-green-600 hover:underline md:pointer-events-none">0244371593</a>
                    <a href="tel:0244280532" className="text-green-600 hover:underline md:pointer-events-none">0244280532</a>
                    <a href="tel:0571386600" className="text-green-600 hover:underline md:pointer-events-none">0571386600</a>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-2xl hover:shadow-lg transition-all duration-300">
                  <div className="p-2 bg-yellow-100 rounded-xl">
                    <Mail className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Email Us</p>
                    <a href="mailto:expertofficefurnish@yahoo.com" className="text-yellow-600 hover:underline">expertofficefurnish@yahoo.com</a>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-2xl hover:shadow-lg transition-all duration-300">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Visit Us</p>
                    <p className="text-green-600">
                      Atomic Hills Estate St, Accra
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-2xl hover:shadow-lg transition-all duration-300">
                  <div className="p-2 bg-yellow-100 rounded-xl">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      Business Hours
                    </p>
                    <p className="text-yellow-600">
                      Mon-Fri: 8AM-5PM
                      <br />
                      Sat: 9AM-2PM
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-yellow-50 rounded-2xl border border-green-100">
                <div className="flex items-center mb-4">
                  <Award className="w-6 h-6 text-green-600 mr-2" />
                  <h4 className="font-bold text-gray-800">Why Choose Us?</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-2" />
                    15+ Years Experience
                  </li>
                  <li className="flex items-center">
                    <Users className="w-4 h-4 text-green-500 mr-2" />
                    50K+ Happy Clients
                  </li>
                  <li className="flex items-center">
                    <Sparkles className="w-4 h-4 text-yellow-500 mr-2" />
                    Premium Quality
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div
            className={`lg:col-span-2 transition-all duration-700 delay-800 ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "translate-x-10 opacity-0"
            }`}
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-100 p-8">
              {isSubmitted ? (
                <div className="text-center py-12 animate-fadeIn">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    Thank You!
                  </h3>
                  <p className="text-gray-600 text-lg mb-8">
                    Your message has been sent successfully. We'll get back to
                    you within 24 hours.
                  </p>
                </div>
              ) : (
                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent mb-2">
                      Send Us a Message
                    </h3>
                    <p className="text-gray-600">
                      Fill out the form and we'll respond promptly
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <User className="w-4 h-4 mr-2 text-green-600" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <Mail className="w-4 h-4 mr-2 text-green-600" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <Phone className="w-4 h-4 mr-2 text-green-600" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      <Sparkles className="w-4 h-4 mr-2 text-green-600" />
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white"
                      placeholder="What's this about?"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      <MessageSquare className="w-4 h-4 mr-2 text-green-600" />
                      Your Message *
                    </label>
                    <textarea
                      name="message"
                      rows="6"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white resize-none"
                      placeholder="Tell us how we can help you..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status.loading}
                    className="w-full group relative px-8 py-4 bg-gradient-to-r from-green-600 to-yellow-600 text-white rounded-2xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      {status.loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                          Send Message
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-yellow-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>

                  {status.message && (
                    <p
                      className={`text-sm text-center p-4 rounded-2xl ${
                        status.type === "success"
                          ? "text-green-600 bg-green-50 border border-green-200"
                          : "text-red-600 bg-red-50 border border-red-200"
                      }`}
                    >
                      {status.message}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Location Section */}
        <section
          className={`mt-20 transition-all duration-700 delay-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent mb-4">
              Find Us
            </h2>
            <p className="text-gray-600 text-lg">
              Visit our showroom to experience our furniture firsthand
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-100 p-8">
              <div className="flex items-center mb-6">
                <MapPin className="w-8 h-8 text-green-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-800">
                  Our Showroom
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-green-100 rounded-xl mt-1">
                    <MapPin className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Address</p>
                    <p className="text-gray-600">
                      Expert Office Furnish
                      <br />
                      Atomic Hills Estate St, Accra
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-yellow-100 rounded-xl mt-1">
                    <Clock className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Hours</p>
                    <p className="text-gray-600">
                      Monday - Friday: 8:00 AM - 5:00 PM
                      <br />
                      Saturday: 9:00 AM - 2:00 PM
                      <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <a 
                  href="https://www.google.com/maps/dir//Atomic+Hills+Estate+St,+Accra/@5.6802412,-0.3141089,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0xfdf9f59f1bee637:0x4d77b3c520395c25!2m2!1d-0.2317069!2d5.680247?entry=ttu&g_ep=EgoyMDI1MTExNy4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-yellow-600 text-white rounded-2xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Get Directions
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Enhanced Map Section */}
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-100 p-4 overflow-hidden">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <MapPin className="w-5 h-5 text-green-600 mr-2" />
                  Find Us Here
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Expert Office Furnish Location
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <iframe
                  title="Expert Office Furnish Location - Atomic Hills Estate St, Accra"
                  src="https://www.google.com/maps?q=Atomic+Hills+Estate+St,+Accra&output=embed"
                  className="w-full h-80 border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ filter: "grayscale(0.1)" }}
                ></iframe>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-xl">
                <p className="text-sm text-green-700">
                  <strong>📍 Address:</strong> Atomic Hills Estate St, Accra
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Click on the map to get directions
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
