import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import HeroImage from "../assets/chairs1.jpg";
import InsetImage from "../assets/sofa.png";

const ShopHero = () => {
  const scrollToProducts = () => {
    window.scrollTo({ top: 800, behavior: "smooth" });
  };

  return (
    <section className="relative pt-32 pb-20 px-6 bg-gray-50 min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Decorative Blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-100/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-100/40 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

      <div className="max-w-[1700px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Section */}
        <div className="space-y-10 animate-fadeInUp">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm cursor-default">
             <Sparkles className="w-4 h-4 text-yellow-500" />
             <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Premium Collection</span>
          </div>

          {/* Headlines */}
          <div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-gray-900 mb-6">
              Shape <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-yellow-500 to-orange-400 italic font-serif pr-2">
                Your
              </span>
              <br />
              Legacy.
            </h1>
            <p className="text-xl text-gray-600 max-w-lg font-light leading-relaxed border-l-4 border-green-500 pl-6">
              Furniture designed for the visionaries. Where definitive style meets uncompromising ergonomic function.
            </p>
          </div>

          {/* Button & Inset Image Group */}
          <div className="flex flex-col sm:flex-row items-center gap-8">
             {/* CTA Button */}
            <button 
                onClick={scrollToProducts}
                className="group px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-green-500/30 hover:scale-105 transition-all flex items-center gap-3"
            >
              Explore Catalog 
              <div className="bg-white/20 rounded-full p-1 group-hover:rotate-45 transition-transform duration-300">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>

            {/* Inset Image Box */}
            <div className="group relative flex items-center gap-4 p-4 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 min-w-[280px] hover:-translate-y-1 transition-transform duration-300">
               <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 relative">
                   <img 
                      src={InsetImage} 
                      alt="Featured Piece" 
                      className="w-full h-full object-contain mix-blend-multiply p-2 transition-transform duration-500 group-hover:scale-110" 
                   />
               </div>
               <div>
                   <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Top Pick</p>
                   <p className="text-base font-bold text-gray-900 leading-none mb-1">The Executive</p>
                   <div className="flex text-yellow-400 text-xs">
                       ★★★★★
                   </div>
               </div>
            </div>
          </div>

        </div>

        {/* Right Section - Hero Image */}
        <div className="relative h-[600px] lg:h-[700px] w-full rounded-[3rem] overflow-hidden shadow-2xl animate-fadeInUp animation-delay-200 group">
           {/* Image Container */}
           <img 
              src={HeroImage} 
              alt="Modern Office Setup" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" 
           />
           
           {/* Gradient Overlay for Text Readability if needed, though minimal requested */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

           {/* Floating Tag */}
           <div className="absolute top-12 left-12 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-xl transform transition-transform duration-500 group-hover:translate-x-2">
               <p className="text-white font-serif text-2xl italic">New Season</p>
               <p className="text-white/80 text-sm font-bold uppercase tracking-widest mt-1">Arrivals</p>
           </div>
        </div>

      </div>
    </section>
  );
};

export default ShopHero;
