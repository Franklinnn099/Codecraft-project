import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { supabase } from "../supabase/supabaseClient";
import Header from "../components/header";
import Footer from "../components/footer";
import {
  Calendar,
  User,
  Clock,
  Share2,
  BookOpen,
  ArrowLeft,
  Eye,
  Heart,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  CheckCircle,
} from "lucide-react";

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [readTime, setReadTime] = useState(0);
  const [tableOfContents, setTableOfContents] = useState([]);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    fetchBlogPost();
  }, [id]);

  useEffect(() => {
    // Add scroll progress tracking
    const handleScroll = () => {
      const winScroll =
        document.body.scrollTop || document.documentElement.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;

      const progressBar = document.getElementById("reading-progress");
      if (progressBar) {
        progressBar.style.width = scrolled + "%";
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [blog]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);

      // Fetch the specific blog post
      const { data: blogData, error: blogError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .eq("status", "Published")
        .single();

      if (blogError) {
        throw blogError;
      }

      if (!blogData) {
        setError("Blog post not found");
        return;
      }

      setBlog(blogData);

      // Calculate reading time (assuming 200 words per minute)
      const wordCount = blogData.content.split(/\s+/).length;
      setReadTime(Math.ceil(wordCount / 200));

      // Extract table of contents from content
      const headings = extractHeadings(blogData.content);
      setTableOfContents(headings);

      // Fetch related posts (same tags or recent posts)
      const { data: relatedData } = await supabase
        .from("blog_posts")
        .select("id, title, excerpt, image_url, created_at, tags")
        .eq("status", "Published")
        .neq("id", id)
        .limit(3)
        .order("created_at", { ascending: false });

      setRelatedPosts(relatedData || []);
    } catch (err) {
      console.error("Error fetching blog post:", err);
      setError("Failed to load blog post");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = blog?.title || "Check out this article";

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url
          )}&text=${encodeURIComponent(title)}`
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            url
          )}`
        );
        break;
      case "copy":
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error("Failed to copy:", err);
        }
        break;
    }
  };

  const extractHeadings = (content) => {
    const headings = [];
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      const h1Match = line.match(/^# (.+)$/);
      const h2Match = line.match(/^## (.+)$/);
      const h3Match = line.match(/^### (.+)$/);

      if (h1Match) {
        headings.push({
          id: `heading-${index}`,
          text: h1Match[1],
          level: 1,
        });
      } else if (h2Match) {
        headings.push({
          id: `heading-${index}`,
          text: h2Match[1],
          level: 2,
        });
      } else if (h3Match) {
        headings.push({
          id: `heading-${index}`,
          text: h3Match[1],
          level: 3,
        });
      }
    });

    return headings;
  };

  const formatContent = (content) => {
    let index = 0;
    // Convert markdown-like content to HTML with IDs for headings
    return content
      .replace(/^# (.*$)/gim, (match, title) => {
        const id = `heading-${index++}`;
        return `<h1 id="${id}" class="text-3xl font-bold text-gray-800 mb-6 mt-8 scroll-mt-24">${title}</h1>`;
      })
      .replace(/^## (.*$)/gim, (match, title) => {
        const id = `heading-${index++}`;
        return `<h2 id="${id}" class="text-2xl font-bold text-gray-800 mb-4 mt-6 scroll-mt-24">${title}</h2>`;
      })
      .replace(/^### (.*$)/gim, (match, title) => {
        const id = `heading-${index++}`;
        return `<h3 id="${id}" class="text-xl font-semibold text-gray-800 mb-3 mt-5 scroll-mt-24">${title}</h3>`;
      })
      .replace(
        /^\* (.*$)/gim,
        '<li class="text-gray-700 leading-relaxed mb-2 ml-4">• $1</li>'
      )
      .replace(
        /^- (.*$)/gim,
        '<li class="text-gray-700 leading-relaxed mb-2 ml-4">• $1</li>'
      )
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-semibold text-gray-800">$1</strong>'
      )
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(
        /\n\n/g,
        '</p><p class="text-gray-700 leading-relaxed mb-6 text-lg">'
      )
      .replace(/\n/g, "<br>");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
        <Header />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-6"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/20 to-yellow-400/20 animate-pulse"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Loading Article
            </h3>
            <p className="text-gray-600">
              Please wait while we fetch the content...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
        <Header />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="text-red-500 text-6xl mb-6">⚠️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Article Not Found
            </h3>
            <p className="text-gray-600 mb-8">
              The article you're looking for doesn't exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-yellow-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105"
              >
                <BookOpen className="w-4 h-4" />
                Browse Articles
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
      <Header />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          id="reading-progress"
          className="h-full bg-gradient-to-r from-green-500 to-yellow-600 transition-all duration-300"
          style={{ width: "0%" }}
        ></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-bl from-yellow-100/40 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-tr from-green-100/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-50/20 to-yellow-50/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          {/* Header Content Container with subtle background */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-sm border border-white/50">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-gray-700 hover:text-gray-900 mb-6 transition-colors duration-200 drop-shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </button>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 mb-6 drop-shadow-sm">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(blog.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {readTime} min read
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Expert Office Furnish
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6 drop-shadow-sm">
              {blog.title}
            </h1>

            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-xl text-gray-700 leading-relaxed mb-8 drop-shadow-sm">
                {blog.excerpt}
              </p>
            )}

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Social Sharing */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-sm text-gray-600">Share this article:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShare("facebook")}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors duration-200"
                  title="Share on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleShare("twitter")}
                  className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-full transition-colors duration-200"
                  title="Share on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleShare("linkedin")}
                  className="p-2 text-green-700 hover:bg-green-50 rounded-full transition-colors duration-200"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors duration-200"
                  title="Copy link"
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            {/* End of header content container */}
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {blog.image_url && (
        <section className="max-w-4xl mx-auto px-6 mb-12">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={blog.image_url}
              alt={blog.title}
              className="w-full h-64 md:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </section>
      )}

      {/* Article Content */}
      <section className="max-w-7xl mx-auto px-6 mb-16 relative">
        <div className="flex gap-8">
          {/* Table of Contents - Fixed sidebar for larger screens */}
          {tableOfContents.length > 0 && (
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-32">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-green-600" />
                    Table of Contents
                  </h3>
                  <nav className="space-y-2">
                    {tableOfContents.map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block text-sm transition-colors duration-200 hover:text-green-600 ${
                          heading.level === 1
                            ? "font-semibold text-gray-800"
                            : heading.level === 2
                            ? "pl-4 text-gray-700"
                            : "pl-8 text-gray-600"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(heading.id)?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 max-w-4xl">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              {/* Reading progress bar */}
              <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-yellow-500 transition-all duration-300"
                  style={{ width: "0%" }}
                  id="reading-progress"
                ></div>
              </div>

              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    `<p class="text-gray-700 leading-relaxed mb-6 text-lg">${formatContent(
                      blog.content
                    )}</p>`,
                    { ADD_ATTR: ['class', 'id'] }
                  ),
                }}
              />

              {/* Article Footer */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setLiked(!liked)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                        liked
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${liked ? "fill-current" : ""}`}
                      />
                      <span className="text-sm font-medium">
                        {liked ? "Liked" : "Like this article"}
                      </span>
                    </button>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span>2.1k views</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Share:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShare("facebook")}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                        title="Share on Facebook"
                      >
                        <Facebook className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare("twitter")}
                        className="p-2 text-blue-400 hover:bg-blue-50 rounded-full transition-colors duration-200"
                        title="Share on Twitter"
                      >
                        <Twitter className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare("linkedin")}
                        className="p-2 text-blue-700 hover:bg-blue-50 rounded-full transition-colors duration-200"
                        title="Share on LinkedIn"
                      >
                        <Linkedin className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Related Articles
            </h2>
            <p className="text-gray-600">Discover more insights and tips</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="group">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2 overflow-hidden">
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white opacity-80" />
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/blog"
              className="inline-flex items-center bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
            >
              View All Articles
              <BookOpen className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
