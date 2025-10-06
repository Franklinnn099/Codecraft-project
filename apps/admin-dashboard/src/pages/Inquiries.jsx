import React, { useState, useEffect } from "react";
import {
  Mail,
  User,
  MessageSquare,
  Phone,
  Calendar,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  ExternalLink,
  Package,
  Send,
  FileText,
  Building2,
  MapPin,
  Globe,
  X,
  Sparkles,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyData, setReplyData] = useState({
    subject: "",
    message: `Dear [Customer Name],

Thank you for reaching out to Expert Office Furnish. We appreciate your interest in our premium office furniture solutions.

We have carefully reviewed your inquiry and are excited to assist you in creating the perfect workspace that enhances productivity and reflects your professional standards.

Our team of office design specialists is ready to provide you with:
• Personalized consultation services
• Competitive pricing and flexible payment options
• Professional installation and setup
• Comprehensive warranty and after-sales support
• Custom solutions tailored to your specific needs

We would be delighted to schedule a consultation at your convenience to discuss your requirements in detail and provide you with a comprehensive proposal.

Please feel free to contact us at your earliest convenience. We look forward to partnering with you in creating an exceptional workspace.`,
    signature: `Best regards,

Customer Service Team
Expert Office Furnish Ltd.

📧 Email: info@expertofficefurnish.com
📱 Phone: +233 XX XXX XXXX
🌐 Website: www.expertofficefurnish.com
📍 Location: Accra, Ghana

"Transforming Workspaces, Elevating Excellence"

---
Expert Office Furnish Ltd.
Your trusted partner for premium office furniture solutions.`,
  });
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    responded: 0,
    resolved: 0,
  });

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);

      // Fetch inquiries with product information if available
      const { data, error } = await supabase
        .from("inquiries")
        .select(
          `
          *,
          products (
            id,
            name,
            image_url
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching inquiries:", error);
        return;
      }

      setInquiries(data || []);

      // Calculate stats
      const total = data?.length || 0;
      const pending =
        data?.filter((inq) => inq.status === "pending").length || 0;
      const responded =
        data?.filter((inq) => inq.status === "responded").length || 0;
      const resolved =
        data?.filter((inq) => inq.status === "resolved").length || 0;

      setStats({ total, pending, responded, resolved });
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      const { error } = await supabase
        .from("inquiries")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", inquiryId);

      if (error) {
        console.error("Error updating inquiry status:", error);
        return;
      }

      // Refresh inquiries after update
      fetchInquiries();
    } catch (error) {
      console.error("Error updating inquiry status:", error);
    }
  };

  const handleReply = (inquiry) => {
    setSelectedInquiry(inquiry);

    // Create personalized response based on inquiry type
    const customerName = inquiry.name || "Valued Customer";
    const inquiryType = inquiry.subject?.toLowerCase().includes("product")
      ? "product inquiry"
      : "service inquiry";

    setReplyData({
      subject: `Re: ${
        inquiry.subject || "Your Inquiry"
      } - Expert Office Furnish Response`,
      message: `Dear ${customerName},

Thank you for reaching out to Expert Office Furnish. We genuinely appreciate your interest in our premium office furniture solutions and the trust you've placed in us.

We have carefully reviewed your ${inquiryType} and are excited to assist you in creating the perfect workspace that enhances productivity, comfort, and reflects your professional standards.

Based on your inquiry, our team of office design specialists can provide you with:

🏢 COMPREHENSIVE SERVICES:
• Personalized consultation and workspace assessment
• Custom furniture solutions tailored to your needs
• Competitive pricing with flexible payment options
• Professional delivery, installation, and setup
• Comprehensive warranty and dedicated after-sales support
• Ongoing maintenance and upgrade services

💼 WHY CHOOSE EXPERT OFFICE FURNISH:
• Over [X] years of experience in office furniture solutions
• Premium quality products from trusted manufacturers
• Ergonomic designs that promote health and productivity
• Sustainable and environmentally conscious options
• Dedicated customer service team

We would be delighted to schedule a complimentary consultation at your convenience to discuss your specific requirements in detail and provide you with a comprehensive, tailored proposal.

Our office is open Monday through Friday, 8:00 AM to 6:00 PM, and Saturday 9:00 AM to 4:00 PM. You can reach us at your preferred time, or we can arrange a visit to your location for a workspace assessment.

Thank you once again for considering Expert Office Furnish for your office furniture needs. We look forward to the opportunity to serve you and create an exceptional workspace together.`,
      signature: `Best regards,

Customer Service Team
Expert Office Furnish Ltd.

📧 Email: info@expertofficefurnish.com
📱 Phone: +233 XX XXX XXXX
🌐 Website: www.expertofficefurnish.com
📍 Location: Accra, Ghana

"Transforming Workspaces, Elevating Excellence"

---
Expert Office Furnish Ltd.
Your trusted partner for premium office furniture solutions.

Follow us on social media for design inspiration and updates!`,
    });
    setShowReplyModal(true);
  };

  const sendReply = async () => {
    if (!replyData.subject.trim() || !replyData.message.trim()) {
      alert("Please fill in both subject and message fields.");
      return;
    }

    setSending(true);
    try {
      // Try to send email using Supabase Edge Function
      let emailSent = false;
      let emailError = null;

      try {
        const { data: emailResult, error } = await supabase.functions.invoke(
          "send-reply-email",
          {
            body: {
              to: selectedInquiry.email || selectedInquiry.contact,
              subject: replyData.subject,
              message: replyData.message,
              signature: replyData.signature,
              customerName: selectedInquiry.name,
              companyInfo: {
                name: "Expert Office Furnish Ltd.",
                email: "info@expertofficefurnish.com",
                phone: "+233 XX XXX XXXX",
                website: "www.expertofficefurnish.com",
                location: "Accra, Ghana",
              },
            },
          }
        );

        if (!error && emailResult?.success) {
          emailSent = true;
        } else {
          emailError = error;
        }
      } catch (err) {
        emailError = err;
      }

      // Update inquiry status to responded
      await updateInquiryStatus(selectedInquiry.id, "responded");

      // Store reply in database for tracking
      const { error: dbError } = await supabase.from("inquiry_replies").insert({
        inquiry_id: selectedInquiry.id,
        subject: replyData.subject,
        message: replyData.message + "\n\n" + replyData.signature,
        sent_at: new Date().toISOString(),
        sent_to: selectedInquiry.email || selectedInquiry.contact,
        email_id: emailSent ? "sent_via_api" : "fallback_required",
        status: emailSent ? "sent" : "pending",
      });

      if (dbError) {
        console.log("Note: Reply tracking not available:", dbError);
      }

      if (emailSent) {
        // Email was sent successfully
        alert(
          `✅ Email sent successfully to ${selectedInquiry.name} (${
            selectedInquiry.email || selectedInquiry.contact
          })\n\nThe customer should receive the reply in their inbox within a few minutes.`
        );
      } else {
        // Email service not configured, provide fallback options
        const useEmailClient = confirm(
          `⚠️ Email service not configured yet.\n\nWould you like to:\n• Click OK to open your email client with the message pre-filled\n• Click Cancel to copy the message to clipboard\n\nNote: Please follow the EMAIL_SETUP_GUIDE.md to enable automatic email sending.`
        );

        if (useEmailClient) {
          // Open email client
          const emailBody = encodeURIComponent(
            `${replyData.message}\n\n${replyData.signature}`
          );
          const emailSubject = encodeURIComponent(replyData.subject);
          const emailTo = selectedInquiry.email || selectedInquiry.contact;
          window.open(
            `mailto:${emailTo}?subject=${emailSubject}&body=${emailBody}`,
            "_blank"
          );
        } else {
          // Copy to clipboard
          const emailContent = `To: ${
            selectedInquiry.email || selectedInquiry.contact
          }\nSubject: ${replyData.subject}\n\n${replyData.message}\n\n${
            replyData.signature
          }`;
          navigator.clipboard
            .writeText(emailContent)
            .then(() => {
              alert(
                "📋 Email content copied to clipboard! You can paste it into your email client."
              );
            })
            .catch(() => {
              alert(
                "Please manually copy the email content from the preview above."
              );
            });
        }
      }

      setShowReplyModal(false);
      setReplyData({
        subject: "",
        message: `Dear [Customer Name],

Thank you for reaching out to Expert Office Furnish. We appreciate your interest in our premium office furniture solutions.

We have carefully reviewed your inquiry and are excited to assist you in creating the perfect workspace that enhances productivity and reflects your professional standards.

Our comprehensive services include:
• Personalized consultation and design services
• Wide range of premium office furniture
• Competitive pricing with flexible payment options
• Professional delivery and installation
• Comprehensive warranty and after-sales support

We would be delighted to schedule a consultation to discuss your specific requirements and provide you with a tailored proposal.

Please feel free to contact us at your earliest convenience.`,
        signature: `Best regards,

Customer Service Team
Expert Office Furnish Ltd.

📧 Email: info@expertofficefurnish.com
📱 Phone: +233 XX XXX XXXX
🌐 Website: www.expertofficefurnish.com
📍 Location: Accra, Ghana

"Transforming Workspaces, Elevating Excellence"

---
Expert Office Furnish Ltd.
Your trusted partner for premium office furniture solutions.`,
      });
    } catch (error) {
      console.error("Error sending reply:", error);
      alert(
        "Failed to send reply. Please check your internet connection and try again."
      );
    } finally {
      setSending(false);
    }
  };

  const deleteInquiry = async (inquiryId) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("inquiries")
        .delete()
        .eq("id", inquiryId);

      if (error) {
        console.error("Error deleting inquiry:", error);
        return;
      }

      // Refresh inquiries after deletion
      fetchInquiries();
    } catch (error) {
      console.error("Error deleting inquiry:", error);
    }
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || inquiry.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "responded":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "responded":
        return <AlertCircle className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Inquiries
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and respond to customer inquiries and product questions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInquiries}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Inquiries
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Responded</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.responded}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.resolved}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search inquiries by name, contact, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="responded">Responded</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Message
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {inquiry.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {inquiry.contact}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {inquiry.products ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            inquiry.products.image_url ||
                            "/api/placeholder/40/40"
                          }
                          alt={inquiry.products.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {inquiry.products.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Product Inquiry
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <MessageSquare className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-gray-600">General Inquiry</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900 max-w-xs truncate">
                      {inquiry.message}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        inquiry.status || "pending"
                      )}`}
                    >
                      {getStatusIcon(inquiry.status || "pending")}
                      {(inquiry.status || "pending").charAt(0).toUpperCase() +
                        (inquiry.status || "pending").slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">
                      {formatDate(inquiry.created_at)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedInquiry(inquiry);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReply(inquiry)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Reply to Inquiry"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <div className="relative group">
                        <select
                          value={inquiry.status || "pending"}
                          onChange={(e) =>
                            updateInquiryStatus(inquiry.id, e.target.value)
                          }
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="responded">Responded</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                      <button
                        onClick={() => deleteInquiry(inquiry.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInquiries.length === 0 && (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No inquiries found
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "No customer inquiries have been submitted yet"}
            </p>
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {showModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Inquiry Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Name
                    </label>
                    <p className="text-gray-900">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Contact
                    </label>
                    <p className="text-gray-900">{selectedInquiry.contact}</p>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              {selectedInquiry.products && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Product Information
                  </h3>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={
                        selectedInquiry.products.image_url ||
                        "/api/placeholder/60/60"
                      }
                      alt={selectedInquiry.products.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {selectedInquiry.products.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Product ID: {selectedInquiry.product_id}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Message
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{selectedInquiry.message}</p>
                </div>
              </div>

              {/* Status & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        selectedInquiry.status || "pending"
                      )}`}
                    >
                      {getStatusIcon(selectedInquiry.status || "pending")}
                      {(selectedInquiry.status || "pending")
                        .charAt(0)
                        .toUpperCase() +
                        (selectedInquiry.status || "pending").slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Date Submitted
                  </label>
                  <p className="text-gray-900">
                    {formatDate(selectedInquiry.created_at)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <select
                  value={selectedInquiry.status || "pending"}
                  onChange={(e) => {
                    updateInquiryStatus(selectedInquiry.id, e.target.value);
                    setSelectedInquiry({
                      ...selectedInquiry,
                      status: e.target.value,
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Mark as Pending</option>
                  <option value="responded">Mark as Responded</option>
                  <option value="resolved">Mark as Resolved</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header with Company Branding */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white rounded-lg p-2 shadow-sm">
                    <img
                      src="../../pics/Company logo.png"
                      alt="Expert Office Furnish"
                      className="h-10 w-auto"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%234F46E5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='16' font-weight='bold'%3EEOF%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Expert Office Furnish
                    </h2>
                    <p className="text-blue-100">
                      Professional Office Solutions
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Company Details Section */}
            <div className="bg-gray-50 p-4 border-b">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold">
                    Expert Office Furnish Ltd.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Accra, Ghana</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>info@expertofficefurnish.com</span>
                </div>
              </div>
            </div>

            {/* Reply Form */}
            <div className="p-6">
              {/* Customer Information */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Original Inquiry
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">From:</span>{" "}
                    {selectedInquiry?.name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>{" "}
                    {selectedInquiry?.email}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedInquiry?.phone}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>{" "}
                    {selectedInquiry?.created_at
                      ? new Date(
                          selectedInquiry.created_at
                        ).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-medium">Subject:</span>{" "}
                  {selectedInquiry?.subject}
                </div>
                <div className="mt-2 bg-white p-3 rounded border">
                  <span className="font-medium">Message:</span>
                  <p className="mt-1 text-gray-700">
                    {selectedInquiry?.message}
                  </p>
                </div>
              </div>

              {/* Reply Composition */}
              <div className="space-y-4">
                {/* Quick Templates */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Quick Response Templates
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <button
                      onClick={() =>
                        setReplyData((prev) => ({
                          ...prev,
                          subject: `Product Consultation Invitation - Expert Office Furnish`,
                          message: `Dear ${
                            selectedInquiry?.name || "Valued Customer"
                          },\n\nThank you for your interest in our office furniture solutions. We would like to invite you for a complimentary consultation to discuss your workspace needs.\n\nOur design specialists are available to provide personalized recommendations that will transform your office into a productive and inspiring environment.\n\nPlease let us know your preferred time for a consultation.`,
                        }))
                      }
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Consultation Invite
                    </button>
                    <button
                      onClick={() =>
                        setReplyData((prev) => ({
                          ...prev,
                          subject: `Product Information & Pricing - Expert Office Furnish`,
                          message: `Dear ${
                            selectedInquiry?.name || "Valued Customer"
                          },\n\nThank you for your inquiry about our office furniture products. We're excited to share detailed information about our premium solutions.\n\nAttached you'll find our latest catalog and pricing information. Our team is ready to provide customized quotes based on your specific requirements.\n\nWe offer competitive pricing, flexible payment terms, and comprehensive warranty coverage on all our products.`,
                        }))
                      }
                      className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      Product Info
                    </button>
                    <button
                      onClick={() =>
                        setReplyData((prev) => ({
                          ...prev,
                          subject: `Thank You for Your Interest - Expert Office Furnish`,
                          message: `Dear ${
                            selectedInquiry?.name || "Valued Customer"
                          },\n\nThank you for reaching out to Expert Office Furnish. We appreciate the opportunity to serve your office furniture needs.\n\nOur team is currently reviewing your requirements and will provide you with a comprehensive proposal within 24 hours.\n\nIn the meantime, please feel free to browse our showroom or visit our website for inspiration.`,
                        }))
                      }
                      className="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                    >
                      Follow-up
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={replyData.subject}
                    onChange={(e) =>
                      setReplyData((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Re: Your inquiry about office furniture"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reply Message
                  </label>
                  <textarea
                    value={replyData.message}
                    onChange={(e) =>
                      setReplyData((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    rows={12}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dear [Customer Name],

Thank you for reaching out to Expert Office Furnish. We appreciate your interest in our premium office furniture solutions.

We have carefully reviewed your inquiry and are excited to assist you in creating the perfect workspace that enhances productivity and reflects your professional standards.

Our comprehensive services include:
• Personalized consultation and design services
• Wide range of premium office furniture
• Competitive pricing with flexible payment options
• Professional delivery and installation
• Comprehensive warranty and after-sales support

We would be delighted to schedule a consultation to discuss your specific requirements and provide you with a tailored proposal.

Please feel free to contact us at your earliest convenience."
                  />
                </div>

                {/* Professional Signature */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">
                    Email Signature
                  </h4>
                  <textarea
                    value={replyData.signature}
                    onChange={(e) =>
                      setReplyData((prev) => ({
                        ...prev,
                        signature: e.target.value,
                      }))
                    }
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Best regards,

[Your Name]
[Your Title]
Expert Office Furnish Ltd.

📧 Email: info@expertofficefurnish.com
📱 Phone: +233 XX XXX XXXX
🌐 Website: www.expertofficefurnish.com
📍 Location: Accra, Ghana

'Transforming Workspaces, Elevating Excellence'

---
Expert Office Furnish Ltd.
Your trusted partner for premium office furniture solutions.

Follow us on social media for the latest updates and design inspiration!"
                  />
                </div>
              </div>

              {/* Email Preview */}
              <div className="mt-6 border-t pt-6">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Email Preview
                </h4>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Email Header with Logo */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white rounded p-1">
                        <img
                          src="../../pics/Company logo.png"
                          alt="Expert Office Furnish"
                          className="h-8 w-auto"
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%234F46E5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='12' font-weight='bold'%3EEOF%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          Expert Office Furnish
                        </h3>
                        <p className="text-blue-100 text-sm">
                          Professional Office Solutions
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Email Content */}
                  <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
                    <div className="border-b border-gray-100 pb-3">
                      <div className="text-sm text-gray-600 mb-1">
                        <strong>To:</strong> {selectedInquiry?.email}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <strong>From:</strong> Expert Office Furnish
                        &lt;info@expertofficefurnish.com&gt;
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Subject:</strong>{" "}
                        {replyData.subject || "Re: Your Inquiry"}
                      </div>
                    </div>

                    <div className="email-content">
                      <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                        {replyData.message}
                      </div>
                      {replyData.signature && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <div className="whitespace-pre-wrap text-sm text-gray-600 leading-relaxed">
                            {replyData.signature}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Email Footer */}
                    <div className="mt-6 pt-4 border-t border-gray-200 bg-gray-50 -mx-4 -mb-4 px-4 py-3">
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <Building2 className="w-3 h-3" />
                        <span>Expert Office Furnish Ltd. | Accra, Ghana</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Open email client as fallback
                    const emailBody = encodeURIComponent(
                      `${replyData.message}\n\n${replyData.signature}`
                    );
                    const emailSubject = encodeURIComponent(replyData.subject);
                    const emailTo =
                      selectedInquiry?.email || selectedInquiry?.contact;
                    window.open(
                      `mailto:${emailTo}?subject=${emailSubject}&body=${emailBody}`,
                      "_blank"
                    );
                  }}
                  className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Open in Email Client
                </button>
                <button
                  onClick={sendReply}
                  disabled={sending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {sending ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
