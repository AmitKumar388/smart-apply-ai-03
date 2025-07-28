import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Twitter, 
  Linkedin, 
  Facebook,
  Heart
} from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/50 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 bg-primary-foreground rounded-sm flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary rounded-xs"></div>
                </div>
              </div>
              <span className="text-lg font-bold text-foreground">SmartApply.AI</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AI-powered resume optimization and job application tracking platform. 
              Get hired faster with smart resume tailoring and interview preparation.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Product</h3>
            <ul className="space-y-3">
              <li><Link to="/dashboard/resume-optimizer" className="text-muted-foreground hover:text-primary transition-colors text-sm">Resume Optimizer</Link></li>
              <li><Link to="/dashboard/interview-practice" className="text-muted-foreground hover:text-primary transition-colors text-sm">Interview Practice</Link></li>
              <li><Link to="/dashboard/application-tracker" className="text-muted-foreground hover:text-primary transition-colors text-sm">Application Tracker</Link></li>
              <li><Link to="/dashboard/portfolio" className="text-muted-foreground hover:text-primary transition-colors text-sm">Portfolio Builder</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">API Documentation</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Contact Support</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Feature Requests</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Status Page</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Community Forum</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">support@smartapply.ai</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Cookie Policy</a>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>© 2024 SmartApply.AI. All rights reserved.</span>
            </div>
          </div>
        </div>

        {/* Newsletter & Trust Signals */}
        <div className="bg-gradient-primary/10 rounded-xl p-8 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Stay Ahead of the Competition</h3>
              <p className="text-muted-foreground">Get the latest job market insights, resume optimization tips, and exclusive features delivered to your inbox.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button className="px-8 py-3 bg-gradient-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all font-semibold shadow-glow">
                  Get Started Free
                </button>
              </div>
              <p className="text-xs text-muted-foreground">No spam. Unsubscribe anytime. Join 50,000+ job seekers.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">50K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">1M+</div>
                <div className="text-sm text-muted-foreground">Resumes Optimized</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">4.9★</div>
                <div className="text-sm text-muted-foreground">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};