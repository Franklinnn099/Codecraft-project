import React, { useState, useEffect } from "react";
import {
  Mail,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Send,
  FileText,
  Phone,
  MapPin,
  Building,
  DollarSign,
  Calendar,
  MessageCircle,
  Package,
  Target,
  Flag,
  Users,
  Filter,
  Search,
  ExternalLink,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function ServiceInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [replyData, setReplyData] = useState({
    subject: "",
    message: "",
    signature: `Best regards,

Customer Service Team
Expert Office Furnish Ltd.

📧 Email: expertofurnish@gmail.com
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
    contacted: 0,
    in_progress: 0,
    quoted: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchServiceInquiries();
  }, []);

  const fetchServiceInquiries = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("service_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching service inquiries:", error);
        // Set a fallback empty array if there's an error
        setInquiries([]);
        return;
      }

      // Ensure data is always an array
      const inquiriesData = Array.isArray(data) ? data : [];
      setInquiries(inquiriesData);

      // Calculate stats with better error handling
      const total = inquiriesData.length;
      const pending = inquiriesData.filter(
        (inq) => inq?.status === "pending"
      ).length;
      const contacted = inquiriesData.filter(
        (inq) => inq?.status === "contacted"
      ).length;
      const in_progress = inquiriesData.filter(
        (inq) => inq?.status === "in_progress"
      ).length;
      const quoted = inquiriesData.filter(
        (inq) => inq?.status === "quoted"
      ).length;
      const completed = inquiriesData.filter(
        (inq) => inq?.status === "completed"
      ).length;

      setStats({ total, pending, contacted, in_progress, quoted, completed });
    } catch (error) {
      console.error("Error fetching service inquiries:", error);
      // Ensure we set empty state even if there's an unexpected error
      setInquiries([]);
      setStats({
        total: 0,
        pending: 0,
        contacted: 0,
        in_progress: 0,
        quoted: 0,
        completed: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (inquiryId, newStatus) => {
    if (!inquiryId || !newStatus) {
      console.error("Missing inquiryId or newStatus");
      return;
    }

    try {
      const { error } = await supabase
        .from("service_inquiries")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", inquiryId);

      if (error) {
        console.error("Error updating inquiry status:", error);
        // You could add a toast notification here
        return false;
      }

      // Refresh the inquiries list
      await fetchServiceInquiries();
      return true;
    } catch (error) {
      console.error("Error updating inquiry status:", error);
      return false;
    }
  };

  const handleReply = (inquiry) => {
    setSelectedInquiry(inquiry);

    const customerName = inquiry.name || "Valued Customer";
    const serviceType =
      inquiry.service_type
        ?.replace(/_/g, " ")
        ?.replace(/\b\w/g, (l) => l.toUpperCase()) || "Service";

    setReplyData({
      subject: `Re: ${serviceType} Service Inquiry - Expert Office Furnish Response`,
      message: `Dear ${customerName},

Thank you for reaching out to Expert Office Furnish regarding our ${serviceType.toLowerCase()} services. We genuinely appreciate your interest in our premium office solutions and the trust you've placed in us.

We have carefully reviewed your service inquiry and are excited to assist you in creating the perfect workspace solution that enhances productivity, comfort, and reflects your professional standards.

Based on your inquiry for ${serviceType.toLowerCase()} services, our team of office design specialists can provide you with:

🏢 COMPREHENSIVE ${serviceType.toUpperCase()} SERVICES:
• Personalized consultation and workspace assessment
• Custom solutions tailored to your specific needs
• Competitive pricing with flexible payment options
• Professional implementation and setup
• Comprehensive warranty and dedicated after-sales support
• Ongoing maintenance and upgrade services

💼 WHY CHOOSE EXPERT OFFICE FURNISH:
• Over 15+ years of experience in office solutions
• Premium quality services from trusted professionals
• Ergonomic and innovative solutions
• Sustainable and environmentally conscious options
• Dedicated customer service team

We would be delighted to schedule a complimentary consultation at your convenience to discuss your specific requirements in detail and provide you with a comprehensive, tailored proposal.

Our office is open Monday through Friday, 8:00 AM to 6:00 PM, and Saturday 9:00 AM to 4:00 PM. You can reach us at your preferred time, or we can arrange a visit to your location for a detailed assessment.

Thank you once again for considering Expert Office Furnish for your ${serviceType.toLowerCase()} needs. We look forward to the opportunity to serve you and create an exceptional workspace solution together.`,
      signature: `Best regards,

Customer Service Team
Expert Office Furnish Ltd.

📧 Email: expertofurnish@gmail.com
📱 Phone: +233 XX XXX XXXX
🌐 Website: www.expertofficefurnish.com
📍 Location: Accra, Ghana

"Transforming Workspaces, Elevating Excellence"

---
Expert Office Furnish Ltd.
Your trusted partner for premium office furniture solutions.`,
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
      // Try to send email using Supabase Edge Function (if configured)
      let emailSent = false;

      // Update inquiry status to contacted
      await updateInquiryStatus(selectedInquiry.id, "contacted");

      // For now, provide manual email options since email service might not be configured
      const useEmailClient = confirm(
        `Would you like to:\n• Click OK to open your email client with the message pre-filled\n• Click Cancel to copy the message to clipboard`
      );

      if (useEmailClient) {
        // Open email client
        const emailBody = encodeURIComponent(
          `${replyData.message}\n\n${replyData.signature}`
        );
        const emailSubject = encodeURIComponent(replyData.subject);
        const emailTo = selectedInquiry.email;
        window.open(
          `mailto:${emailTo}?subject=${emailSubject}&body=${emailBody}`,
          "_blank"
        );
        alert("Email client opened with pre-filled message.");
      } else {
        // Copy to clipboard
        const emailContent = `To: ${selectedInquiry.email}\nSubject: ${replyData.subject}\n\n${replyData.message}\n\n${replyData.signature}`;
        navigator.clipboard
          .writeText(emailContent)
          .then(() => {
            alert("📋 Email content copied to clipboard!");
          })
          .catch(() => {
            alert(
              "Please manually copy the email content from the preview above."
            );
          });
      }

      setShowReplyModal(false);
      setReplyData({
        subject: "",
        message: "",
        signature: `Best regards,

Customer Service Team
Expert Office Furnish Ltd.

📧 Email: expertofurnish@gmail.com
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
      alert("Failed to send reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const deleteInquiry = async (inquiryId) => {
    if (
      !window.confirm("Are you sure you want to delete this service inquiry?")
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("service_inquiries")
        .delete()
        .eq("id", inquiryId);

      if (error) {
        console.error("Error deleting service inquiry:", error);
        return;
      }

      fetchServiceInquiries();
    } catch (error) {
      console.error("Error deleting service inquiry:", error);
    }
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || inquiry.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || inquiry.priority === priorityFilter;
    const matchesServiceType =
      serviceTypeFilter === "all" || inquiry.service_type === serviceTypeFilter;

    return (
      matchesSearch && matchesStatus && matchesPriority && matchesServiceType
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "contacted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "quoted":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "contacted":
        return <Phone className="w-4 h-4" />;
      case "in_progress":
        return <Target className="w-4 h-4" />;
      case "quoted":
        return <FileText className="w-4 h-4" />;
      case "accepted":
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />;
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-600" />
              Service Inquiries
            </h1>
            <p className="text-gray-600 mt-2">
              Manage customer service requests and consultations
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.contacted}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.in_progress}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Quoted</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.quoted}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.completed}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search inquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="in_progress">In Progress</option>
              <option value="quoted">Quoted</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <select
              value={serviceTypeFilter}
              onChange={(e) => setServiceTypeFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
            >
              <option value="all">All Services</option>
              <option value="furniture_providers">Furniture Providers</option>
              <option value="office_design">Office Design</option>
              <option value="office_fitouts">Office Fitouts</option>
              <option value="consultancy">Consultancy</option>
              <option value="office_refurbishment">Office Refurbishment</option>
              <option value="interior_decoration">Interior Decoration</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPriorityFilter("all");
                setServiceTypeFilter("all");
              }}
              className="px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Service Inquiries Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Service Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Priority
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
                        <p className="text-sm text-gray-600">{inquiry.email}</p>
                        {inquiry.company && (
                          <p className="text-sm text-gray-500">
                            {inquiry.company}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Target className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {inquiry.service_type
                            ?.replace(/_/g, " ")
                            ?.replace(/\b\w/g, (l) => l.toUpperCase())}
                        </p>
                        {inquiry.budget_range && (
                          <p className="text-sm text-gray-600">
                            Budget: {inquiry.budget_range.replace(/_/g, " ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900 max-w-xs truncate">
                      {inquiry.description}
                    </p>
                    {inquiry.timeline && (
                      <p className="text-sm text-gray-600">
                        Timeline: {inquiry.timeline.replace(/_/g, " ")}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                        inquiry.priority || "medium"
                      )}`}
                    >
                      <Flag className="w-3 h-3" />
                      {(inquiry.priority || "medium").charAt(0).toUpperCase() +
                        (inquiry.priority || "medium").slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        inquiry.status || "pending"
                      )}`}
                    >
                      {getStatusIcon(inquiry.status || "pending")}
                      {(inquiry.status || "pending").charAt(0).toUpperCase() +
                        (inquiry.status || "pending")
                          .slice(1)
                          .replace(/_/g, " ")}
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
                        title="Reply"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteInquiry(inquiry.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
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
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No service inquiries found
            </h3>
            <p className="text-gray-600">
              {searchTerm ||
              statusFilter !== "all" ||
              priorityFilter !== "all" ||
              serviceTypeFilter !== "all"
                ? "Try adjusting your filters"
                : "No customer service inquiries have been submitted yet"}
            </p>
          </div>
        )}
      </div>

      {/* Service Inquiry Detail Modal */}
      {showModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  Service Inquiry Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedInquiry.name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedInquiry.email}
                    </div>
                    {selectedInquiry.phone && (
                      <div>
                        <span className="font-medium">Phone:</span>{" "}
                        {selectedInquiry.phone}
                      </div>
                    )}
                    {selectedInquiry.company && (
                      <div>
                        <span className="font-medium">Company:</span>{" "}
                        {selectedInquiry.company}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Preferred Contact:</span>{" "}
                      {selectedInquiry.preferred_contact_method?.replace(
                        /_/g,
                        " "
                      )}
                    </div>
                  </div>
                </div>

                {/* Service Information */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Service Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Service Type:</span>{" "}
                      {selectedInquiry.service_type
                        ?.replace(/_/g, " ")
                        ?.replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                    <div>
                      <span className="font-medium">Priority:</span>{" "}
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                          selectedInquiry.priority
                        )}`}
                      >
                        {selectedInquiry.priority?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          selectedInquiry.status
                        )}`}
                      >
                        {selectedInquiry.status
                          ?.replace(/_/g, " ")
                          .toUpperCase()}
                      </span>
                    </div>
                    {selectedInquiry.budget_range && (
                      <div>
                        <span className="font-medium">Budget:</span>{" "}
                        {selectedInquiry.budget_range.replace(/_/g, " ")}
                      </div>
                    )}
                    {selectedInquiry.timeline && (
                      <div>
                        <span className="font-medium">Timeline:</span>{" "}
                        {selectedInquiry.timeline.replace(/_/g, " ")}
                      </div>
                    )}
                    {selectedInquiry.location && (
                      <div>
                        <span className="font-medium">Location:</span>{" "}
                        {selectedInquiry.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description & Requirements */}
              <div className="mt-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Project Description
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedInquiry.description}
                  </p>
                </div>

                {selectedInquiry.requirements && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Specific Requirements
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedInquiry.requirements}
                    </p>
                  </div>
                )}
              </div>

              {/* Status Update */}
              <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-3">
                  Update Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "pending",
                    "contacted",
                    "in_progress",
                    "quoted",
                    "accepted",
                    "completed",
                    "cancelled",
                  ].map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        updateInquiryStatus(selectedInquiry.id, status)
                      }
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        selectedInquiry.status === status
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      {status
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    handleReply(selectedInquiry);
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Reply
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  Reply to Service Inquiry
                </h2>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Customer Info Summary */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Replying to:
                </h3>
                <p className="text-blue-700">
                  {selectedInquiry.name} ({selectedInquiry.email}) -{" "}
                  {selectedInquiry.service_type
                    ?.replace(/_/g, " ")
                    ?.replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
                  Service
                </p>
              </div>

              {/* Reply Form */}
              <div className="space-y-4">
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
                    placeholder="Email subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
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
                    placeholder="Your reply message..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Signature
                  </label>
                  <textarea
                    value={replyData.signature}
                    onChange={(e) =>
                      setReplyData((prev) => ({
                        ...prev,
                        signature: e.target.value,
                      }))
                    }
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Email signature..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-4">
                <button
                  onClick={sendReply}
                  disabled={sending}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {sending ? "Sending..." : "Send Reply"}
                </button>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
