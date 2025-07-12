// frontend/src/pages/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon, title, problem, solution, impact, link, linkText }) => (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col items-center text-center border border-gray-100">
        <div className="text-5xl mb-4 text-purple-600">{icon}</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-sm text-gray-600 mb-2 italic">Problem: {problem}</p>
        <p className="text-md text-gray-800 mb-3">{solution}</p>
        <p className="text-md font-semibold text-green-700 mb-4">Impact: {impact}</p>
        {link && (
            <Link to={link} className="mt-auto px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition duration-200 text-sm font-semibold shadow-md">
                {linkText || "Learn More"}
            </Link>
        )}
    </div>
);

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Reimagining Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Shopping Experience</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            In a world of endless choices, we believe shopping should be effortless, intelligent, and deeply personal. We're leveraging cutting-edge technologies to transform every interaction into a seamless, engaging, and highly relevant journey.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/" className="px-8 py-3 bg-purple-600 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-purple-700 transition duration-300 transform hover:scale-105">
              Explore Our Shop
            </Link>
            <Link to="/virtual-try-on-outfit" className="px-8 py-3 bg-white text-purple-600 text-lg font-semibold rounded-full shadow-lg border border-purple-600 hover:bg-purple-50 transition duration-300 transform hover:scale-105">
              Try On Outfits
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Our Innovative Solutions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            <FeatureCard
                icon="👗"
                title="Virtual Try-On & Outfit Builder"
                problem="Uncertainty about fit and style leads to high returns and hesitant purchases online."
                solution="Virtually try on clothes in real-time using AR. Capture and save full outfit snapshots to your dedicated 'Outfit Cart' for easy comparison."
                impact="Reduces returns, boosts buyer confidence, and makes online fashion shopping interactive and fun!"
                link="/virtual-try-on-outfit"
                linkText="Start Try-On"
            />

            <FeatureCard
                icon="💬"
                title="GenAI Style Advisor"
                problem="Generic recommendations don't provide personalized styling advice tailored to individual needs."
                solution="An interactive, conversational AI stylist offers hyper-personalized advice based on your preferences, body type, skin tone, and occasion."
                impact="Reduces decision fatigue, builds trust, and drives cross-selling by suggesting perfect complementary items."
                link="/outfit-cart" // Link to outfit cart where advisor is accessible
                linkText="Get Advice"
            />

            <FeatureCard
                icon="👯‍♀️"
                title="Shared Try-On Room"
                problem="Online shopping lacks the social interaction and immediate feedback of shopping with friends."
                solution="Share your virtual outfits with friends in a simulated real-time room, getting instant reactions (👍❤️🔥) and collective votes ('Wear It', 'Maybe', 'Nope')."
                impact="Enhances engagement, leverages social proof, and increases purchase confidence through collective decision-making."
                link="/outfit-cart" // Link to outfit cart where share button is
                linkText="Share Outfits"
            />

            <FeatureCard
                icon="🛒"
                title="Smart Grocery Refill Assistant"
                problem="Forgetting essentials and manual grocery list management wastes time and causes frustration."
                solution="Our AI assistant predicts when daily essentials are due for refill based on past purchase patterns, sending smart, proactive reminders."
                impact="Ensures you never run out of necessities, saves time, and transforms reactive shopping into effortless replenishment."
                link="/grocery-reminders"
                linkText="Set Reminders"
            />

            <FeatureCard
                icon="✍️➡️🛒"
                title="Shopping List Automation"
                problem="Typing long grocery lists is cumbersome, especially for elders or those with typing difficulties."
                solution="Simply upload a photo of your handwritten grocery list, and our AI vision (OCR + NLP) automatically populates your cart."
                impact="Eliminates typing barriers, makes online shopping accessible for all, and saves significant time."
                // No direct link, as this is a conceptual demo point
            />

            <FeatureCard
                icon="📱"
                title="Mobile Self-Checkout"
                problem="Long checkout lines and traditional payment methods create friction in physical stores."
                solution="Scan store QR codes to 'enter' a mobile cart, then scan product QR codes to add items and checkout directly from your phone."
                impact="Eliminates queues, modernizes the in-store experience, and redefines convenience for faster shopping."
                link="/scan-store"
                linkText="Try Self-Checkout"
            />

            <FeatureCard
                icon="📸"
                title="Image Search for Products"
                problem="Finding specific products seen online or in real life without knowing their name is difficult."
                solution="Upload an image of any product, and our system will instantly find similar items in Walmart's extensive catalog."
                impact="Simplifies product discovery, converts visual inspiration into direct shopping opportunities, and broadens accessibility."
                link="/image-search"
                linkText="Search by Image"
            />

            <FeatureCard
                icon="💸"
                title="Dynamic Discounts (Vision)"
                problem="Customers are bombarded with irrelevant promotions, leading to disengagement and missed value."
                solution="Leveraging GenAI, we envision providing hyper-personalized discounts based on your unique preferences, past purchases, and real-time cart contents."
                impact="Maximizes conversion, increases perceived value, and ensures you receive offers that are genuinely relevant to you."
                // No direct link, as this is a conceptual demo point
            />

          </div>
        </div>

        {/* Call to Action / Vision Statement */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">Our Vision: The Future of Retail, Today.</h2>
          <p className="text-xl mb-6">
            We're not just building features; we're crafting a **unified, intelligent, and deeply engaging shopping ecosystem** that anticipates your needs, empowers your choices, and makes every interaction effortless and relevant. Join us in experiencing the next generation of retail at Walmart.
          </p>
          <Link to="/" className="px-10 py-4 bg-white text-purple-700 text-xl font-bold rounded-full shadow-xl hover:bg-gray-100 transition duration-300 transform hover:scale-105">
            Start Your Journey
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;

