import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Send,
  ArrowLeft,
  User,
  Mail,
  MessageSquare,
  Package,
  Phone,
  Building,
  DollarSign,
  Clock,
  MapPin,
  Heart,
} from "lucide-react";
import Header from "../components/header";
import Footer from "../components/footer";
import { useCart } from "../context/CartContext";
import { supabase } from "../supabase/supabaseClient";

export default function InquiryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();

  // Extract state from navigation
  const fromCart = location.state?.fromCart || false;
  const fromService = location.state?.fromService || false;
  const serviceName = location.state?.serviceName || "";
  const includeProducts = location.state?.includeProducts || false;

  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    phone: "",
    company: "",
    budget_range: "",
    timeline: "",
    location: "",
    requirements: "",
    preferred_contact_method: "email",
  });

  // Determine items to show based on context
  const itemsToShow = fromCart
    ? cartItems.filter((item) => item.selected)
    : includeProducts
    ? cartItems
    : [];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError(null);

    try {
      // Validate required fields
      if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
        setSubmitError("Please fill in all required fields.");
        setIsLoading(false);
        return;
      }

      // Additional validation for service inquiries
      if (fromService && serviceName) {
        if (!form.phone.trim()) {
          setSubmitError("Phone number is required for service inquiries.");
          setIsLoading(false);
          return;
        }
        if (!form.company.trim()) {
          setSubmitError("Company name is required for service inquiries.");
          setIsLoading(false);
          return;
        }
        if (!form.location.trim()) {
          setSubmitError("Location is required for service inquiries.");
          setIsLoading(false);
          return;
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        setSubmitError("Please enter a valid email address.");
        setIsLoading(false);
        return;
      }

      // Validate phone format for service inquiries (basic validation)
      if (fromService && serviceName && form.phone.trim()) {
        const phoneRegex = /^[\+]?[0-9][\d]{8,14}$/;
        const cleanPhone = form.phone.replace(/[\s\-\(\)\.]/g, "");
        if (cleanPhone.length < 9 || !phoneRegex.test(cleanPhone)) {
          setSubmitError("Please enter a valid phone number.");
          setIsLoading(false);
          return;
        }
      }

      // Determine if this is a service inquiry
      if (fromService && serviceName) {
        // Handle service inquiry - submit to service_inquiries table
        const serviceInquiryData = {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          company: form.company.trim(),
          service_type: serviceName.toLowerCase().replace(/\s+/g, "_"),
          message: form.message.trim(),
          requirements: form.requirements.trim() || null,
          budget_range: form.budget_range || null,
          timeline: form.timeline || null,
          location: form.location.trim() || null,
          preferred_contact_method: form.preferred_contact_method,
          status: "pending",
          priority: "medium",
        };

        console.log("Submitting service inquiry data:", serviceInquiryData);

        // Submit to service_inquiries table
        const { data, error } = await supabase
          .from("service_inquiries")
          .insert([serviceInquiryData])
          .select();

        if (error) {
          console.error("Error submitting service inquiry:", error);
          setSubmitError("Failed to submit service inquiry. Please try again.");
          setIsLoading(false);
          return;
        }

        console.log("Service inquiry submitted successfully:", data);
      } else {
        // Handle regular product inquiry
        const inquiryData = {
          name: form.name.trim(),
          email: form.email.trim(),
          contact: form.email.trim(),
          message: form.message.trim(),
        };

        // Add product information if this is a product inquiry
        if (includeProducts && itemsToShow.length > 0) {
          // For now, just use the first product if multiple items
          inquiryData.product_id = itemsToShow[0].id;

          // Enhance message with product details
          const productNames = itemsToShow.map((item) => item.name).join(", ");
          inquiryData.message += `\n\nProducts of interest: ${productNames}`;
        }

        console.log("Submitting product inquiry data:", inquiryData);

        // Submit to inquiries table
        const { data, error } = await supabase
          .from("inquiries")
          .insert([inquiryData])
          .select();

        if (error) {
          console.error("Error submitting inquiry:", error);
          setSubmitError("Failed to submit inquiry. Please try again.");
          setIsLoading(false);
          return;
        }

        console.log("Product inquiry submitted successfully:", data);
      }

      setIsSubmitted(true);

      // Reset form after success animation
      setTimeout(() => {
        setForm({
          name: "",
          email: "",
          message: "",
          phone: "",
          company: "",
          budget_range: "",
          timeline: "",
          location: "",
          requirements: "",
          preferred_contact_method: "email",
        });
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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
            className={`transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-100 to-yellow-100 rounded-full mb-8 border border-green-200">
              {fromService ? (
                <>
                  <Package className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-700 font-semibold">
                    {serviceName} Service Inquiry
                  </span>
                </>
              ) : fromCart ? (
                <>
                  <Heart className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-700 font-semibold">
                    Selected Items Inquiry
                  </span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-700 font-semibold">
                    General Inquiry
                  </span>
                </>
              )}
            </div>

            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-700 to-yellow-600 bg-clip-text text-transparent">
              {fromService
                ? "Request Service Quote"
                : fromCart
                ? "Inquire About Selected Items"
                : "Get In Touch"}
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              {fromService
                ? `Tell us about your ${serviceName.toLowerCase()} needs and we'll provide a customized solution for your workspace.`
                : fromCart
                ? "Share your requirements for the selected items and our team will assist you with pricing, customization, and delivery options."
                : "Whether you're looking for premium office furniture, workspace design, or custom solutions, we're here to help transform your office into a space of excellence."}
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Form Section */}
      <div className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-green-100 overflow-hidden">
            {/* Success Message */}
            {isSubmitted && (
              <div className="p-8 bg-gradient-to-r from-green-500 to-yellow-500 text-white text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  Inquiry Submitted Successfully!
                </h3>
                <p className="text-green-100">
                  Thank you for your inquiry. Our team will get back to you
                  within 24 hours.
                </p>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700 m-8 rounded-lg">
                <p className="font-medium">{submitError}</p>
              </div>
            )}

            {/* Selected Items Display */}
            {itemsToShow.length > 0 && (
              <div className="p-8 bg-gradient-to-r from-green-50 to-yellow-50 border-b border-green-100">
                <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  {fromCart ? "Selected Items" : "Products of Interest"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {itemsToShow.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center p-3 bg-white rounded-xl border border-green-200 shadow-sm"
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg mr-3"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {item.name}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <div className="p-8">
              {!isSubmitted && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <User className="w-4 h-4 mr-2 text-green-600" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white"
                        placeholder="Enter your full name"
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
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  {/* Service-specific fields */}
                  {fromService && serviceName && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-r from-green-50 to-yellow-50 rounded-2xl border border-green-200">
                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                          <Phone className="w-4 h-4 mr-2 text-green-600" />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={form.phone}
                          onChange={handleChange}
                          className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                          <Building className="w-4 h-4 mr-2 text-green-600" />
                          Company Name *
                        </label>
                        <input
                          type="text"
                          name="company"
                          required
                          value={form.company}
                          onChange={handleChange}
                          className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white"
                          placeholder="Enter your company name"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                          <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                          Budget Range
                        </label>
                        <select
                          name="budget_range"
                          value={form.budget_range}
                          onChange={handleChange}
                          className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white"
                        >
                          <option value="">Select budget range</option>
                          <option value="under_5000">Under $5,000</option>
                          <option value="5000_15000">$5,000 - $15,000</option>
                          <option value="15000_50000">$15,000 - $50,000</option>
                          <option value="50000_100000">
                            $50,000 - $100,000
                          </option>
                          <option value="over_100000">Over $100,000</option>
                        </select>
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                          <Clock className="w-4 h-4 mr-2 text-green-600" />
                          Project Timeline
                        </label>
                        <select
                          name="timeline"
                          value={form.timeline}
                          onChange={handleChange}
                          className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white"
                        >
                          <option value="">Select timeline</option>
                          <option value="immediate">
                            Immediate (1-2 weeks)
                          </option>
                          <option value="short_term">
                            Short term (1 month)
                          </option>
                          <option value="medium_term">
                            Medium term (2-3 months)
                          </option>
                          <option value="long_term">
                            Long term (3+ months)
                          </option>
                          <option value="planning">Just planning</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                          <MapPin className="w-4 h-4 mr-2 text-green-600" />
                          Project Location *
                        </label>
                        <input
                          type="text"
                          name="location"
                          required
                          value={form.location}
                          onChange={handleChange}
                          className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white"
                          placeholder="Enter project location (city, state)"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                          <Mail className="w-4 h-4 mr-2 text-green-600" />
                          Preferred Contact Method
                        </label>
                        <select
                          name="preferred_contact_method"
                          value={form.preferred_contact_method}
                          onChange={handleChange}
                          className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white"
                        >
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="both">Both Email and Phone</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      <MessageSquare className="w-4 h-4 mr-2 text-green-600" />
                      {fromService ? "Project Description" : "Message"} *
                    </label>
                    <textarea
                      name="message"
                      rows="6"
                      required
                      value={form.message}
                      onChange={handleChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white resize-none"
                      placeholder={
                        fromService
                          ? "Describe your project, goals, and any specific needs or challenges..."
                          : fromCart
                          ? "Share your requirements, specifications, or any questions about the selected items..."
                          : "Tell us about your project, timeline, budget, or any specific requirements..."
                      }
                    />
                  </div>

                  {/* Requirements field for service inquiries */}
                  {fromService && serviceName && (
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <Package className="w-4 h-4 mr-2 text-green-600" />
                        Specific Requirements
                      </label>
                      <textarea
                        name="requirements"
                        rows="4"
                        value={form.requirements}
                        onChange={handleChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white resize-none"
                        placeholder="Any specific requirements, preferences, or constraints for this service..."
                      />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 group relative px-8 py-4 bg-gradient-to-r from-green-600 to-yellow-600 text-white rounded-2xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                            Submit Inquiry
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-yellow-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>

                    <Link to="/shop" className="flex-1">
                      <button
                        type="button"
                        className="w-full group px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-green-200 text-green-700 rounded-2xl font-semibold hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <span className="flex items-center justify-center">
                          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                          Back to Shop
                        </span>
                      </button>
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
