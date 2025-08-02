import { FileText, Heart, Users, Mail, Twitter, Github, Linkedin, Sparkles, BookOpen, Globe } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-400/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/5 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  EduResources
                </h3>
                <p className="text-sm text-purple-200">Educational Excellence</p>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Empowering learners worldwide with free access to premium educational resources. Join our vibrant
              community of knowledge sharers and lifelong learners.
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-purple-200 bg-purple-800/30 px-3 py-2 rounded-full border border-purple-600/30">
                <Users className="w-4 h-4" />
                <span>Growing Community</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-pink-200 bg-pink-800/30 px-3 py-2 rounded-full border border-pink-600/30">
                <Heart className="w-4 h-4 text-pink-400" />
                <span>Free Forever</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-white flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
              Explore
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-slate-300 hover:text-blue-300 transition-all duration-300 flex items-center group"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Browse Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/upload"
                  className="text-slate-300 hover:text-purple-300 transition-all duration-300 flex items-center group"
                >
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Upload PDF
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-slate-300 hover:text-pink-300 transition-all duration-300 flex items-center group"
                >
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/recent"
                  className="text-slate-300 hover:text-indigo-300 transition-all duration-300 flex items-center group"
                >
                  <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Recent Uploads
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-white flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
              Support
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/help"
                  className="text-slate-300 hover:text-blue-300 transition-all duration-300 flex items-center group"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/guidelines"
                  className="text-slate-300 hover:text-purple-300 transition-all duration-300 flex items-center group"
                >
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Upload Guidelines
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-300 hover:text-pink-300 transition-all duration-300 flex items-center group"
                >
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-slate-300 hover:text-indigo-300 transition-all duration-300 flex items-center group"
                >
                  <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-white flex items-center">
              <Globe className="w-5 h-5 mr-2 text-pink-400" />
              Connect
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              Stay updated with the latest educational resources and join our global community of learners.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="mailto:hello@eduresources.com"
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-blue-500/25"
              >
                <Mail className="w-5 h-5 text-white" />
              </Link>
              <Link
                href="https://twitter.com/eduresources"
                className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-sky-500/25"
              >
                <Twitter className="w-5 h-5 text-white" />
              </Link>
              <Link
                href="https://github.com/eduresources"
                className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-gray-500/25"
              >
                <Github className="w-5 h-5 text-white" />
              </Link>
              <Link
                href="https://linkedin.com/company/eduresources"
                className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-blue-600/25"
              >
                <Linkedin className="w-5 h-5 text-white" />
              </Link>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 p-4 rounded-2xl border border-purple-600/30">
              <h5 className="text-white font-medium mb-2">Stay Updated</h5>
              <p className="text-purple-200 text-xs mb-3">Get notified about new resources</p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 rounded-lg text-white text-sm font-medium transition-all duration-300 hover:scale-105">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700/50 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-slate-400 text-sm text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                <Heart className="w-4 h-4 text-pink-400" />
                <span>
                  © {new Date().getFullYear()} EduResources. Made with love for the global learning community.
                </span>
              </div>
              <p className="text-xs text-slate-500">Empowering education through technology and community.</p>
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <Link href="/sitemap" className="hover:text-blue-300 transition-colors duration-300">
                Sitemap
              </Link>
              <Link href="/accessibility" className="hover:text-purple-300 transition-colors duration-300">
                Accessibility
              </Link>
              <Link href="/cookies" className="hover:text-pink-300 transition-colors duration-300">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
