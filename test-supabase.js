// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ioqzspoaanccesvylnpe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvcXpzcG9hYW5jY2VzdnlsbnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNDI4OTcsImV4cCI6MjA2OTYxODg5N30.Ot0zqKEh6seOS2E6MFYxONZ3ZanGtihRU5lKtfM8Oxc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  
  try {
    const startTime = Date.now();
    
    // Test 1: Fetch products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .limit(5);
    
    const elapsed = Date.now() - startTime;
    
    if (productsError) {
      console.error('❌ Products query failed:', productsError.message);
    } else {
      console.log(`✅ Products query successful (${elapsed}ms)`);
      console.log(`   Found ${products.length} products:`);
      products.forEach(p => console.log(`   - ${p.name}`));
    }
    
    // Test 2: Fetch blog posts
    const { data: blogs, error: blogsError } = await supabase
      .from('blog_posts')
      .select('id, title')
      .limit(3);
    
    if (blogsError) {
      console.error('❌ Blog posts query failed:', blogsError.message);
    } else {
      console.log(`✅ Blog posts query successful`);
      console.log(`   Found ${blogs.length} blog posts`);
    }
    
    console.log('\n✅ Supabase connection is working!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
