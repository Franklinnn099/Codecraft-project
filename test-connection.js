import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

// Hardcode values for testing to bypass env loading issues
const supabaseUrl = "https://ioqzspoaanccesvylnpe.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvcXpzcG9hYW5jY2VzdnlsbnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNDI4OTcsImV4cCI6MjA2OTYxODg5N30.Ot0zqKEh6seOS2E6MFYxONZ3ZanGtihRU5lKtfM8Oxc";

console.log("Testing connection to:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Attempting to fetch data...");
  const start = Date.now();
  
  try {
    // Try a simple health check or table select
    const { data, error } = await supabase.from('products').select('count').limit(1);
    
    const duration = (Date.now() - start) / 1000;
    console.log(`Request completed in ${duration}s`);

    if (error) {
      console.error("Supabase Error:", error);
    } else {
      console.log("Success! Connection is working.");
      console.log("Data received:", data);
    }
  } catch (err) {
    console.error("Network/System Error:", err);
  }
}

testConnection();
