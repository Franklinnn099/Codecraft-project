import { supabase } from "../supabase/supabaseClient";
import dataCache, { CACHE_KEYS } from "./dataCache";

// Prefetch products for faster navigation
export const prefetchProducts = async () => {
  try {
    if (dataCache.has(CACHE_KEYS.HOME_PRODUCTS)) {
      return; // Already cached
    }

    const { data, error } = await supabase
      .from("products")
      .select("id, name, image_url, category_id, description")
      .limit(8); // Fetch a few more for product page navigation

    if (!error && data) {
      dataCache.set(CACHE_KEYS.HOME_PRODUCTS, data.slice(0, 4));

      // Cache individual products for instant product page loads
      data.forEach((product) => {
        dataCache.set(CACHE_KEYS.PRODUCT(product.id), product);
      });
    }
  } catch (error) {
    console.log("Prefetch products failed:", error);
  }
};

// Prefetch blogs for faster navigation
export const prefetchBlogs = async () => {
  try {
    if (dataCache.has(CACHE_KEYS.ALL_BLOGS)) {
      return; // Already cached
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, excerpt, content, created_at, image_url, tags")
      .eq("status", "Published")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      dataCache.set(CACHE_KEYS.ALL_BLOGS, data);
      dataCache.set(CACHE_KEYS.HOME_BLOGS, data.slice(0, 3));

      // Cache individual blog posts
      data.forEach((blog) => {
        dataCache.set(CACHE_KEYS.BLOG_POST(blog.id), blog);
      });
    }
  } catch (error) {
    console.log("Prefetch blogs failed:", error);
  }
};

// Prefetch all data when app starts
export const prefetchAllData = async () => {
  // Run prefetching in parallel
  await Promise.all([prefetchProducts(), prefetchBlogs()]);
};

// Background prefetching - runs with low priority
export const backgroundPrefetch = () => {
  // Use requestIdleCallback if available, otherwise setTimeout
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      prefetchAllData();
    });
  } else {
    setTimeout(() => {
      prefetchAllData();
    }, 1000);
  }
};

export default {
  prefetchProducts,
  prefetchBlogs,
  prefetchAllData,
  backgroundPrefetch,
};
