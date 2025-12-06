// User behavior tracking for enhanced product recommendations
import { supabase } from "../supabase/supabaseClient";

class UserBehaviorTracker {
  constructor() {
    this.viewHistory = this.loadViewHistory();
    this.sessionViews = new Set();
  }

  // Load view history from localStorage
  loadViewHistory() {
    try {
      const stored = localStorage.getItem("product_view_history");
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Error loading view history:", error);
      return {};
    }
  }

  // Save view history to localStorage
  saveViewHistory() {
    try {
      localStorage.setItem(
        "product_view_history",
        JSON.stringify(this.viewHistory)
      );
    } catch (error) {
      console.error("Error saving view history:", error);
    }
  }

  // Track a product view with enhanced data
  trackView(
    productId,
    categoryId = null,
    productName = null,
    subcategoryId = null
  ) {
    if (!productId || this.sessionViews.has(productId)) return;

    // Add to session views to prevent duplicate tracking in same session
    this.sessionViews.add(productId);

    const now = new Date().toISOString();

    // Update view history with enhanced tracking
    if (!this.viewHistory[productId]) {
      this.viewHistory[productId] = {
        count: 0,
        lastViewed: null,
        categoryId: categoryId,
        subcategoryId: subcategoryId,
        productName: productName,
        firstViewed: now,
        viewSessions: [],
        timeSpent: 0,
        interactionScore: 0,
      };
    }

    this.viewHistory[productId].count += 1;
    this.viewHistory[productId].lastViewed = now;
    this.viewHistory[productId].viewSessions.push({
      timestamp: now,
      sessionId: this.getSessionId(),
      timeSpent: Math.floor(Math.random() * 120 + 30), // Simulate 30-150 seconds
    });

    // Update category and subcategory if provided
    if (categoryId) this.viewHistory[productId].categoryId = categoryId;
    if (subcategoryId)
      this.viewHistory[productId].subcategoryId = subcategoryId;
    if (productName) this.viewHistory[productId].productName = productName;

    // Calculate interaction score (frequency + recency + time spent)
    this.calculateInteractionScore(productId);

    this.saveViewHistory();
    this.trackViewInDatabase(productId, categoryId);
  }

  // Calculate interaction score for better recommendations
  calculateInteractionScore(productId) {
    const history = this.viewHistory[productId];
    if (!history) return;

    const now = new Date();
    const lastViewed = new Date(history.lastViewed);
    const daysSinceLastView = (now - lastViewed) / (1000 * 60 * 60 * 24);

    // Score components
    const frequencyScore = Math.min(history.count * 10, 50); // Max 50 points for frequency
    const recencyScore = Math.max(50 - daysSinceLastView * 5, 0); // Decay over time
    const totalTimeSpent = history.viewSessions.reduce(
      (sum, session) => sum + (session.timeSpent || 30),
      0
    );
    const timeScore = Math.min(totalTimeSpent / 10, 30); // Max 30 points for time spent

    history.interactionScore = frequencyScore + recencyScore + timeScore;
  }

  // Track user interests and preferences
  trackInterest(categoryId, subcategoryId = null, action = "view") {
    if (!this.interests) this.interests = {};

    const key = subcategoryId ? `${categoryId}_${subcategoryId}` : categoryId;

    if (!this.interests[key]) {
      this.interests[key] = {
        categoryId,
        subcategoryId,
        viewCount: 0,
        addToCartCount: 0,
        inquiryCount: 0,
        lastInteraction: null,
        score: 0,
      };
    }

    this.interests[key][`${action}Count`] =
      (this.interests[key][`${action}Count`] || 0) + 1;
    this.interests[key].lastInteraction = new Date().toISOString();

    // Calculate interest score
    this.interests[key].score =
      this.interests[key].viewCount * 1 +
      this.interests[key].addToCartCount * 5 +
      this.interests[key].inquiryCount * 10;

    this.saveViewHistory();
  }

  // Track view in database (optional, for cross-device tracking)
  async trackViewInDatabase(productId, categoryId) {
    try {
      // This would require a user_views table in your database
      // For now, we'll just log it
      console.log("Tracking view:", {
        productId,
        categoryId,
        timestamp: new Date(),
      });

      // Uncomment and implement if you want database tracking:
      /*
      const { data, error } = await supabase
        .from('user_views')
        .insert({
          product_id: productId,
          category_id: categoryId,
          viewed_at: new Date().toISOString(),
          user_agent: navigator.userAgent,
          session_id: this.getSessionId()
        });
      */
    } catch (error) {
      console.error("Error tracking view in database:", error);
    }
  }

  // Get frequently viewed products
  getFrequentlyViewed(limit = 10) {
    return Object.entries(this.viewHistory)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, limit)
      .map(([productId, data]) => ({
        productId,
        ...data,
      }));
  }

  // Get recently viewed products
  getRecentlyViewed(limit = 10) {
    return Object.entries(this.viewHistory)
      .filter(([, data]) => data.lastViewed)
      .sort(([, a], [, b]) => new Date(b.lastViewed) - new Date(a.lastViewed))
      .slice(0, limit)
      .map(([productId, data]) => ({
        productId,
        ...data,
      }));
  }

  // Get preferred categories based on view history
  getPreferredCategories() {
    const categoryViews = {};

    Object.values(this.viewHistory).forEach((data) => {
      if (data.categoryId) {
        categoryViews[data.categoryId] =
          (categoryViews[data.categoryId] || 0) + data.count;
      }
    });

    return Object.entries(categoryViews)
      .sort(([, a], [, b]) => b - a)
      .map(([categoryId, count]) => ({ categoryId, count }));
  }

  // Clear view history
  clearHistory() {
    this.viewHistory = {};
    this.sessionViews.clear();
    this.saveViewHistory();
  }

  // Get recommendations based on viewing behavior
  async getPersonalizedRecommendations(limit = 8) {
    try {
      const preferredCategories = this.getPreferredCategories().slice(0, 3);
      const recentlyViewed = this.getRecentlyViewed(5);

      if (preferredCategories.length === 0) {
        // If no history, return popular products
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit);

        return data || [];
      }

      // Get products from preferred categories, excluding recently viewed
      const excludeIds = recentlyViewed
        .map((item) => item.productId)
        .filter(Boolean);
      const categoryIds = preferredCategories
        .map((cat) => cat.categoryId)
        .filter(Boolean);

      if (categoryIds.length === 0) {
        // Fallback to popular products if no categories
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit);

        return data || [];
      }

      let query = supabase
        .from("products")
        .select("*")
        .in("category_id", categoryIds);

      // Only add exclusion if there are IDs to exclude
      if (excludeIds.length > 0) {
        query = query.not("id", "in", `(${excludeIds.join(",")})`);
      }

      const { data, error } = await query.limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting personalized recommendations:", error);
      return [];
    }
  }

  // Get session ID for tracking
  getSessionId() {
    let sessionId = sessionStorage.getItem("session_id");
    if (!sessionId) {
      sessionId =
        "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem("session_id", sessionId);
    }
    return sessionId;
  }

  // Get adaptive recommendations based on current browsing patterns
  async getAdaptiveRecommendations(currentProductId = null, limit = 8) {
    try {
      const sessionViews = Array.from(this.sessionViews);
      const recentViews = this.getRecentlyViewed(3);
      const frequentViews = this.getFrequentlyViewed(3);

      // Determine recommendation strategy based on user behavior
      let strategy = "popular"; // default fallback

      if (sessionViews.length >= 3) {
        strategy = "trending"; // User is actively browsing
      } else if (recentViews.length >= 2) {
        strategy = "similar"; // User has some history
      } else if (frequentViews.length >= 2) {
        strategy = "personalized"; // User has established preferences
      }

      console.log(
        `Using adaptive strategy: ${strategy} based on session:${sessionViews.length}, recent:${recentViews.length}, frequent:${frequentViews.length}`
      );

      // Use the determined strategy to get recommendations
      const recommendations = await this.getRecommendationsByStrategy(
        strategy,
        currentProductId,
        limit
      );

      // If primary strategy fails, fall back to popular products
      if (!recommendations || recommendations.length === 0) {
        console.log("Falling back to popular products");
        return await this.getRecommendationsByStrategy(
          "popular",
          currentProductId,
          limit
        );
      }

      return recommendations;
    } catch (error) {
      console.error("Error getting adaptive recommendations:", error);
      return [];
    }
  }

  // Get recommendations by specific strategy
  async getRecommendationsByStrategy(
    strategy,
    currentProductId = null,
    limit = 8
  ) {
    try {
      let query = supabase
        .from("products")
        .select(
          "id, name, description, images, category_id, subcategory_id, stock_quantity"
        )
        .eq("is_active", true)
        .gt("stock_quantity", 0);

      // Exclude current product if provided
      if (currentProductId) {
        query = query.neq("id", currentProductId);
      }

      switch (strategy) {
        case "trending":
          // Products from recently viewed categories
          const recentCategories = this.getRecentlyViewed(3)
            .map((item) => item.categoryId)
            .filter(Boolean);
          if (recentCategories.length > 0) {
            query = query.in("category_id", recentCategories);
          }
          break;

        case "similar":
          // Products similar to frequently viewed ones
          const frequentCategories = this.getFrequentlyViewed(3)
            .map((item) => item.categoryId)
            .filter(Boolean);
          if (frequentCategories.length > 0) {
            query = query.in("category_id", frequentCategories);
          }
          break;

        case "personalized":
          // Use personalized recommendations
          return await this.getPersonalizedRecommendations(limit);

        case "popular":
        default:
          // No specific filtering for popular products
          break;
      }

      query = query.limit(limit * 2); // Get extra to allow for filtering

      const { data: products, error } = await query;

      if (error) {
        console.error(`Error fetching ${strategy} recommendations:`, error);
        return [];
      }

      if (!products || products.length === 0) {
        return [];
      }

      // Filter out already viewed products
      const viewedProductIds = Object.keys(this.viewHistory).map((id) =>
        parseInt(id)
      );
      const filteredProducts = products.filter(
        (product) => !viewedProductIds.includes(product.id)
      );

      // Return shuffled results for variety
      const shuffled = filteredProducts.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, limit);
    } catch (error) {
      console.error(`Error getting ${strategy} recommendations:`, error);
      return [];
    }
  }
}

// Create singleton instance
const behaviorTracker = new UserBehaviorTracker();

// Export convenience functions
export const trackProductView = (productId, categoryId) => {
  behaviorTracker.trackView(productId, categoryId);
};

export const getPersonalizedRecommendations = (limit) => {
  return behaviorTracker.getPersonalizedRecommendations(limit);
};

export const getRecentlyViewed = (limit) => {
  return behaviorTracker.getRecentlyViewed(limit);
};

export const getFrequentlyViewed = (limit) => {
  return behaviorTracker.getFrequentlyViewed(limit);
};

export const clearViewHistory = () => {
  behaviorTracker.clearHistory();
};

export const getAdaptiveRecommendations = (currentProductId, limit) => {
  return behaviorTracker.getAdaptiveRecommendations(currentProductId, limit);
};

export const trackInterest = (categoryId, subcategoryId, action) => {
  behaviorTracker.trackInterest(categoryId, subcategoryId, action);
};

export default behaviorTracker;
