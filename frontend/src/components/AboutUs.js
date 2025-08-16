import React from 'react';
import './AboutUs.css';

const AboutUs = ({ onNavigateHome, onContactUs }) => {
  return (
    <div className="about-us">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1 className="hero-title">About SmartCart</h1>
          <p className="hero-subtitle">
            Revolutionizing fashion and lifestyle shopping with AI-powered recommendations
          </p>
          <div className="hero-image">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="Modern shopping experience"
            />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <h2 className="section-title">Our Mission</h2>
          <div className="mission-content">
            <div className="mission-text">
              <p>
                At SmartCart, we believe shopping should be personal, intuitive, and delightful. 
                Our mission is to transform the way people discover and purchase clothes and gifts 
                by leveraging cutting-edge artificial intelligence and machine learning technologies.
              </p>
              <p>
                We're committed to creating a seamless shopping experience that understands your 
                unique style, preferences, and needs, delivering personalized recommendations that 
                surprise and delight you every time.
              </p>
            </div>
            <div className="mission-image">
              <img 
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1926&q=80" 
                alt="Team collaboration"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2 className="section-title">Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <img 
                  src="https://images.unsplash.com/photo-1553484771-371a605b060b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Innovation"
                />
              </div>
              <h3>Innovation</h3>
              <p>
                We continuously push the boundaries of technology to create smarter, 
                more intuitive shopping experiences that adapt to your evolving needs.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <img 
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80" 
                  alt="Quality"
                />
              </div>
              <h3>Quality</h3>
              <p>
                Every product in our catalog is carefully curated to ensure exceptional 
                quality, style, and value that exceeds your expectations.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <img 
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80" 
                  alt="Customer Focus"
                />
              </div>
              <h3>Customer Focus</h3>
              <p>
                Your satisfaction is our priority. We listen, learn, and evolve 
                based on your feedback to deliver unparalleled service.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <img 
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop" 
                  alt="Sustainability"
                />
              </div>
              <h3>Sustainability</h3>
              <p>
                We're committed to responsible business practices that protect 
                our planet while delivering exceptional products and services.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <img 
                  src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80" 
                  alt="Trust"
                />
              </div>
              <h3>Trust & Security</h3>
              <p>
                Your privacy and security are paramount. We use industry-leading 
                protection to keep your data safe and transactions secure.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80" 
                  alt="Collaboration"
                />
              </div>
              <h3>Collaboration</h3>
              <p>
                We believe in the power of teamwork and partnerships to create 
                extraordinary experiences that benefit everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Quality Section */}
      <section className="service-quality">
        <div className="container">
          <h2 className="section-title">Service Excellence</h2>
          <div className="quality-content">
            <div className="quality-stats">
              <div className="stat-item">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Uptime Guarantee</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Customer Support</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">500K+</div>
                <div className="stat-label">Happy Customers</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">4.9/5</div>
                <div className="stat-label">Customer Rating</div>
              </div>
            </div>

            <div className="quality-features">
              <div className="feature-row">
                <div className="feature-item">
                  <div className="feature-icon">🚀</div>
                  <div className="feature-content">
                    <h4>Lightning Fast Delivery</h4>
                    <p>Express shipping options with real-time tracking for all orders</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🔄</div>
                  <div className="feature-content">
                    <h4>Easy Returns</h4>
                    <p>30-day hassle-free return policy with free return shipping</p>
                  </div>
                </div>
              </div>

              <div className="feature-row">
                <div className="feature-item">
                  <div className="feature-icon">🎯</div>
                  <div className="feature-content">
                    <h4>AI-Powered Recommendations</h4>
                    <p>Smart algorithms that learn your style and suggest perfect matches</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">💎</div>
                  <div className="feature-content">
                    <h4>Premium Quality</h4>
                    <p>Carefully vetted products from trusted brands and designers</p>
                  </div>
                </div>
              </div>

              <div className="feature-row">
                <div className="feature-item">
                  <div className="feature-icon">🔒</div>
                  <div className="feature-content">
                    <h4>Secure Payments</h4>
                    <p>Bank-level encryption and multiple payment options for your safety</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🌟</div>
                  <div className="feature-content">
                    <h4>Personalized Experience</h4>
                    <p>Tailored shopping journey based on your preferences and behavior</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2 className="section-title">Meet Our Team</h2>
          <p className="team-intro">
            Our diverse team of experts is passionate about creating exceptional shopping experiences
          </p>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-photo">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80" 
                  alt="CEO"
                />
              </div>
              <h4>Alex Johnson</h4>
              <p className="member-role">CEO & Founder</p>
              <p className="member-bio">
                Visionary leader with 15+ years in e-commerce and AI technology
              </p>
            </div>

            <div className="team-member">
              <div className="member-photo">
                <img 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face" 
                  alt="CTO"
                />
              </div>
              <h4>Sarah Chen</h4>
              <p className="member-role">CTO</p>
              <p className="member-bio">
                Machine learning expert driving our AI recommendation engine
              </p>
            </div>

            <div className="team-member">
              <div className="member-photo">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
                  alt="Head of Design"
                />
              </div>
              <h4>Michael Rodriguez</h4>
              <p className="member-role">Head of Design</p>
              <p className="member-bio">
                Creative director ensuring beautiful and intuitive user experiences
              </p>
            </div>

            <div className="team-member">
              <div className="member-photo">
                <img 
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1961&q=80" 
                  alt="Head of Operations"
                />
              </div>
              <h4>Emily Davis</h4>
              <p className="member-role">Head of Operations</p>
              <p className="member-bio">
                Operations expert ensuring seamless delivery and customer satisfaction
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="contact-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Shopping Experience?</h2>
            <p>
              Join thousands of satisfied customers who have discovered the future of fashion and lifestyle shopping
            </p>
            <div className="cta-buttons">
              <button 
                className="cta-primary"
                onClick={() => onNavigateHome && onNavigateHome()}
              >
                Start Shopping
              </button>
              <button 
                className="cta-secondary"
                onClick={() => onContactUs && onContactUs()}
              >
                Contact Us
              </button>
            </div>
          </div>
          <div className="cta-image">
            <img 
              src="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2415&q=80" 
              alt="Shopping experience"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
