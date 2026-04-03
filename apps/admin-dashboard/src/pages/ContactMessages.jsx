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
  Send,
  FileText,
  X,
  Sparkles,
  Reply,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyData, setReplyData] = useState({
    subject: "",
    message: `Dear [Customer Name],

Thank you for reaching out to Expert Office Furnish. We appreciate your message and are committed to providing you with excellent customer service.

We have received your inquiry and our team is reviewing it carefully. We will get back to you within 24 hours with a comprehensive response.

If you have any urgent concerns, please don't hesitate to contact us directly.`,
    signature: `Best regards,

Customer Service Team
Expert Office Furnish Ltd.

📧 Email: expertofurnish@gmail.com
📱 Phone: +233 XX XXX XXXX
🌐 Website: www.expertofficefurnish.com
📍 Location: Accra, Ghana

"Transforming Workspaces, Elevating Excellence"`,
  });
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    replied: 0,
    resolved: 0,
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);

      // Fetch contact messages
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching contact messages:", error);
        return;
      }

      setMessages(data || []);

      // Calculate stats
      const total = data?.length || 0;
      const unread =
        data?.filter((msg) => !msg.status || msg.status === "unread").length ||
        0;
      const replied =
        data?.filter((msg) => msg.status === "replied").length || 0;
      const resolved =
        data?.filter((msg) => msg.status === "resolved").length || 0;

      setStats({ total, unread, replied, resolved });
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId, status) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", messageId);

      if (error) {
        console.error("Error updating message status:", error);
        return false;
      }

      // Update local state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, status, updated_at: new Date().toISOString() }
            : msg
        )
      );

      fetchMessages(); // Refresh to update stats
      return true;
    } catch (error) {
      console.error("Error updating message status:", error);
      return false;
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyData.subject || !replyData.message) {
      alert("Please fill in all required fields");
      return;
    }

    setSending(true);
    try {
      // In a real app, you would send an actual email here
      // For now, we'll just mark as replied and store the reply

      const replyRecord = {
        message_id: selectedMessage.id,
        subject: replyData.subject,
        message: replyData.message + "\n\n" + replyData.signature,
        sent_to: selectedMessage.email,
        sent_at: new Date().toISOString(),
        sent_by: "admin", // You can get this from auth context
      };

      // You would store this in a 'message_replies' table
      console.log("Reply to be sent:", replyRecord);

      // Update message status to replied
      await updateMessageStatus(selectedMessage.id, "replied");

      setShowReplyModal(false);
      setReplyData({
        subject: "",
        message: `Dear [Customer Name],

Thank you for reaching out to Expert Office Furnish. We appreciate your message and are committed to providing you with excellent customer service.

We have received your inquiry and our team is reviewing it carefully. We will get back to you within 24 hours with a comprehensive response.

If you have any urgent concerns, please don't hesitate to contact us directly.`,
        signature: `Best regards,

Customer Service Team
Expert Office Furnish Ltd.

📧 Email: expertofurnish@gmail.com
📱 Phone: +233 XX XXX XXXX
🌐 Website: www.expertofficefurnish.com
📍 Location: Accra, Ghana

"Transforming Workspaces, Elevating Excellence"`,
      });

      alert("Reply sent successfully!");
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Failed to send reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId) => {
    if (!confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", messageId);

      if (error) {
        console.error("Error deleting message:", error);
        return;
      }

      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      fetchMessages(); // Refresh stats
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const exportToCSV = () => {
    const headers = ["Date", "Name", "Email", "Subject", "Message", "Status"];
    const rows = filteredMessages.map((msg) => [
      new Date(msg.created_at).toLocaleDateString(),
      msg.name,
      msg.email,
      msg.subject,
      msg.message.replace(/,/g, ";"), // Replace commas to avoid CSV issues
      msg.status || "unread",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contact-messages-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "replied":
        return "bg-green-100 text-green-800";
      case "resolved":
        return "bg-blue-100 text-blue-800";
      case "unread":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "replied":
        return <CheckCircle className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      case "unread":
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unread" &&
        (!message.status || message.status === "unread")) ||
      message.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Contact Messages
              </h1>
              <p className="text-gray-600">
                Manage customer contact messages and inquiries
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={fetchMessages}
                className="flex items-center gap-2 px-4 py-2 border border-green-600 text-green-600 rounded-xl hover:bg-green-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Messages</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.total}
                </p>
              </div>
              <MessageSquare className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.unread}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Replied</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.replied}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.resolved}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg border border-white/20">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search messages by name, email, subject, or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="replied">Replied</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Date</th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">Subject</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((message, index) => (
                  <tr
                    key={message.id}
                    className={`border-b border-gray-100 hover:bg-green-50/50 transition-colors ${
                      index % 2 === 0 ? "bg-gray-50/30" : "bg-white/50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(message.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {message.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {message.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {message.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800 truncate max-w-xs">
                        {message.subject}
                      </p>
                      <p className="text-sm text-gray-600 truncate max-w-xs">
                        {message.message?.substring(0, 100)}...
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          message.status || "unread"
                        )}`}
                      >
                        {getStatusIcon(message.status || "unread")}
                        {message.status || "unread"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowModal(true);
                            if (
                              !message.status ||
                              message.status === "unread"
                            ) {
                              updateMessageStatus(message.id, "replied");
                            }
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Message"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMessage(message);
                            setReplyData((prev) => ({
                              ...prev,
                              subject: `Re: ${message.subject}`,
                              message: prev.message.replace(
                                "[Customer Name]",
                                message.name
                              ),
                            }));
                            setShowReplyModal(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Reply to Message"
                        >
                          <Reply className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/customers?search=${message.email}`}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Customer Details"
                        >
                          <UserCheck className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(message.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Message"
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

          {filteredMessages.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No messages found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No contact messages have been received yet."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* View Message Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Message Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Customer Name
                    </label>
                    <p className="text-gray-900 font-medium">
                      {selectedMessage.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-gray-900">{selectedMessage.email}</p>
                  </div>
                  {selectedMessage.phone_numbers && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Phone Number
                      </label>
                      <p className="text-gray-900">
                        {selectedMessage.phone_numbers}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Subject
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedMessage.subject}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Message
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4 mt-2">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Date Received
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <div className="mt-1">
                      <select
                        value={selectedMessage.status || "unread"}
                        onChange={(e) => {
                          updateMessageStatus(
                            selectedMessage.id,
                            e.target.value
                          );
                          setSelectedMessage((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }));
                        }}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="unread">Unread</option>
                        <option value="replied">Replied</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setReplyData((prev) => ({
                      ...prev,
                      subject: `Re: ${selectedMessage.subject}`,
                      message: prev.message.replace(
                        "[Customer Name]",
                        selectedMessage.name
                      ),
                    }));
                    setShowModal(false);
                    setShowReplyModal(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200"
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </button>
                <Link
                  to={`/customers?search=${selectedMessage.email}`}
                  className="flex items-center gap-2 px-6 py-3 border border-green-500 text-green-600 rounded-xl hover:bg-green-50 transition-colors"
                >
                  <UserCheck className="w-4 h-4" />
                  View Customer
                </Link>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Reply to Message
                </h3>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-2">Replying to:</p>
                  <p className="font-medium">
                    {selectedMessage.name} ({selectedMessage.email})
                  </p>
                  <p className="text-sm text-gray-600">
                    "{selectedMessage.subject}"
                  </p>
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter reply subject"
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
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your reply message"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Signature
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your signature"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleReply}
                  disabled={sending}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {sending ? "Sending..." : "Send Reply"}
                </button>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
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
