import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import {
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Gift,
  ArrowRight,
  Sparkles,
  Star,
  Heart,
  Package,
  ShieldCheck,
  Clock,
  Truck,
  ArrowLeft,
  Check,
} from "lucide-react";
import Header from "../components/header";
import Footer from "../components/footer";
import RelatedProducts from "../components/RelatedProducts";

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    clearCoupon,
    coupon,
    errorMessage,
  } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [discountMessage, setDiscountMessage] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [removingItems, setRemovingItems] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log("CartPage mounted - checking access");
    setMounted(true);
  }, []);

  const handleProceedToInquire = () => {
    const hasProductItems = cartItems && cartItems.length > 0;
    navigate("/inquiry", {
      state: {
        fromCart: hasProductItems,
        includeProducts: hasProductItems,
        cartItems: hasProductItems ? cartItems : [],
      },
    });
  };

  const handleRemoveItem = (id) => {
    setRemovingItems((prev) => [...prev, id]);
    setTimeout(() => {
      removeFromCart(id);
      setRemovingItems((prev) => prev.filter((itemId) => itemId !== id));
    }, 500); // Match transition duration
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setDiscountMessage("Please enter a coupon code.");
      return;
    }

    setIsApplyingCoupon(true);
    setDiscountMessage("");

    try {
      const success = await applyCoupon(couponCode.trim());
      if (success) {
        setDiscountMessage(
          `Coupon "${couponCode.trim().toUpperCase()}" applied successfully!`
        );
        setCouponCode("");
      } else {
        setDiscountMessage(errorMessage || "Invalid or expired coupon code.");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setDiscountMessage("Error applying coupon. Please try again.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    clearCoupon();
    setDiscountMessage("");
    setCouponCode("");
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pt-16">
      <Header forceOpaque={true} />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/shop"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              Your Cart
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {totalItems} items
              </span>
            </h1>
          </div>
          <div className="hidden lg:flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Secure Inquiry</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span>Fast Response</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        {cartItems.length === 0 ? (
          // Empty State
          <div className="max-w-2xl mx-auto text-center py-16 animate-fadeInUp">
            <div className="relative w-48 h-48 mx-auto mb-8">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse opacity-50"></div>
              <div className="absolute inset-4 bg-white rounded-full shadow-lg flex items-center justify-center">
                <ShoppingCart className="w-20 h-20 text-green-600 opacity-80" />
              </div>
              <div className="absolute bottom-0 right-0 bg-yellow-400 p-3 rounded-full shadow-md animate-bounce">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Looks like you haven't added any furniture to your inquiry list yet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/shop"
                className="px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Start Shopping
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/gallery"
                className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-green-500 hover:text-green-600 transition-all hover:shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                View Gallery
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
            {/* Left Column: Cart Items */}
            <div className="flex-1 space-y-6">
              {/* Progress Bar (Gamification) */}
              <div className="bg-gradient-to-r from-green-50 to-yellow-50 border border-green-100 rounded-xl p-4 flex items-center gap-4 animate-fadeIn">
                <div className="p-2 bg-white rounded-full shadow-sm">
                  <Gift className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    Add{" "}
                    <span className="text-green-600 font-bold">2 more items</span> to
                    increase your bulk discount chance!
                  </p>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min((cartItems.length / 5) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`group bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-500 transform ${
                      removingItems.includes(item.id)
                        ? "opacity-0 -translate-x-full scale-95"
                        : "opacity-100 translate-x-0 scale-100"
                    }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <div className="flex gap-4 sm:gap-6">
                      {/* Image */}
                      <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-1 group-hover:text-green-600 transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              Premium office furniture
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-all"
                            title="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-end justify-between mt-4">
                          {/* Quantity Control */}
                          <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
                            <button
                              onClick={() => updateQuantity(item.id, "decrease")}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:text-green-600 disabled:opacity-50"
                              disabled={item.qty <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center font-semibold text-gray-900">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, "increase")}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:text-green-600"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              In Stock
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-2 hover:underline"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Cart
                </button>
                <Link
                  to="/shop"
                  className="text-gray-600 hover:text-green-600 text-sm font-medium flex items-center gap-2 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right Column: Summary */}
            <div className="lg:w-96 xl:w-[28rem] flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Summary Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6 bg-gray-900 text-white">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Package className="w-5 h-5 text-yellow-400" />
                      Inquiry Summary
                    </h2>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Total Items</span>
                        <span className="font-medium text-gray-900">
                          {totalItems}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Consultation</span>
                        <span className="font-medium text-green-600">Free</span>
                      </div>
                      {coupon && (
                        <div className="flex justify-between text-green-600 bg-green-50 p-2 rounded-lg">
                          <span className="flex items-center gap-1">
                            <Gift className="w-3 h-3" /> Coupon Applied
                          </span>
                          <span className="font-bold">{coupon.code}</span>
                        </div>
                      )}
                    </div>

                    {/* Coupon Input */}
                    <div className="pt-4 border-t border-gray-100">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                        Have a promo code?
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter code"
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={isApplyingCoupon || !couponCode}
                          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      {discountMessage && (
                        <p
                          className={`text-xs mt-2 ${
                            discountMessage.includes("success")
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {discountMessage}
                        </p>
                      )}
                      {coupon && (
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-xs text-red-500 hover:underline mt-2"
                        >
                          Remove Coupon
                        </button>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <button
                        onClick={handleProceedToInquire}
                        className="w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                      >
                        Proceed to Inquiry
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <p className="text-center text-xs text-gray-500 mt-3">
                        No payment required at this stage
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 text-center shadow-sm">
                    <ShieldCheck className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-xs font-medium text-gray-600">Secure</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 text-center shadow-sm">
                    <Truck className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <p className="text-xs font-medium text-gray-600">Delivery</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 text-center shadow-sm">
                    <Star className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-xs font-medium text-gray-600">Quality</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Related Products */}
        <div className="mt-20 border-t border-gray-200 pt-12">
          <RelatedProducts
            cartItems={cartItems}
            algorithm="similar"
            title="You Might Also Like"
            subtitle="Complete your office setup with these additions"
            limit={4}
            showAddToCart={true}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
