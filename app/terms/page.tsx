import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Scale,
  FileText,
  Shield,
  Users,
  AlertTriangle,
  ArrowLeft,
  Mail,
  MessageCircle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import Footer from "@/components/footer"

export default function Terms() {
  const sections = [
    {
      title: "Acceptance of Terms",
      icon: CheckCircle,
      content:
        "By accessing and using EduResources, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
    },
    {
      title: "Use License",
      icon: FileText,
      content:
        "Permission is granted to temporarily download one copy of the materials on EduResources for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.",
    },
    {
      title: "User Content",
      icon: Users,
      content:
        "Users are responsible for the content they upload. By uploading content, you grant EduResources a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content on our platform.",
    },
    {
      title: "Prohibited Uses",
      icon: XCircle,
      content:
        "You may not use our service for any unlawful purpose, to upload copyrighted material without permission, to harass other users, or to distribute malicious software or inappropriate content.",
    },
    {
      title: "Privacy Policy",
      icon: Shield,
      content:
        "Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our service. By using our service, you agree to the collection and use of information in accordance with our Privacy Policy.",
    },
    {
      title: "Termination",
      icon: AlertTriangle,
      content:
        "We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever including without limitation if you breach the Terms.",
    },
  ]

  const userResponsibilities = [
    "Provide accurate and complete information when creating an account",
    "Maintain the security of your account credentials",
    "Only upload content you own or have permission to share",
    "Respect intellectual property rights of others",
    "Use the platform for educational purposes only",
    "Report any violations or inappropriate content",
    "Comply with all applicable laws and regulations",
  ]

  const platformRights = [
    "Moderate and remove content that violates our guidelines",
    "Suspend or terminate accounts for violations",
    "Update these terms with reasonable notice",
    "Maintain and improve our platform services",
    "Collect and use data as described in our Privacy Policy",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-purple-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" className="hover:bg-purple-50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="border-l border-purple-300 pl-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Terms of Service
                </h1>
                <p className="text-sm text-slate-600">Legal terms and conditions for using EduResources</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Effective: {new Date().toLocaleDateString()}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            These terms govern your use of EduResources and describe the rights and responsibilities of all users.
          </p>
        </div>

        {/* Important Notice */}
        <Alert className="border-blue-200 bg-blue-50 mb-12">
          <Scale className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Important:</strong> By using EduResources, you agree to these terms. Please read them carefully. If
            you don't agree with any part of these terms, you may not use our service.
          </AlertDescription>
        </Alert>

        {/* Main Terms Sections */}
        <div className="space-y-8 mb-12">
          {sections.map((section, index) => (
            <Card key={index} className="border-purple-200/50 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl text-slate-900">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed">{section.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User Responsibilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-green-100/50">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Your Responsibilities
              </CardTitle>
              <CardDescription>As a user of EduResources, you agree to:</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {userResponsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-green-800 text-sm">{responsibility}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-blue-100/50">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Our Rights
              </CardTitle>
              <CardDescription>EduResources reserves the right to:</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {platformRights.map((right, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-800 text-sm">{right}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Intellectual Property */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50 backdrop-blur-sm mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-purple-600" />
              Intellectual Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Your Content</h4>
                <p className="text-slate-600 text-sm">
                  You retain ownership of content you upload but grant us license to display and distribute it on our
                  platform for educational purposes.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Our Platform</h4>
                <p className="text-slate-600 text-sm">
                  The EduResources platform, including design, code, and branding, is protected by intellectual property
                  laws and owned by us.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Copyright Respect</h4>
                <p className="text-slate-600 text-sm">
                  We respect intellectual property rights and will remove content that infringes on others' copyrights
                  when properly notified.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Fair Use</h4>
                <p className="text-slate-600 text-sm">
                  Educational use of copyrighted material may be permitted under fair use doctrine, but users are
                  responsible for ensuring compliance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Alert className="border-yellow-200 bg-yellow-50 mb-12">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Disclaimer:</strong> EduResources is provided "as is" without warranties of any kind. We do not
            guarantee the accuracy, completeness, or reliability of any content on our platform. Use of educational
            materials is at your own risk.
          </AlertDescription>
        </Alert>

        {/* Changes to Terms */}
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50/50 to-yellow-50/50 backdrop-blur-sm mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900">Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700">
              We reserve the right to modify these terms at any time. When we make changes, we will:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-slate-700 text-sm">Update the "Effective Date" at the top of this page</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-slate-700 text-sm">Notify users through our platform or email</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-slate-700 text-sm">Provide reasonable notice before changes take effect</span>
              </li>
            </ul>
            <p className="text-slate-600 text-sm">
              Your continued use of EduResources after changes constitutes acceptance of the new terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-slate-900">Questions About These Terms?</CardTitle>
            <CardDescription className="text-lg">
              We're here to help clarify any legal questions you may have
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="mailto:legal@eduresources.com">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Legal Team
                </Button>
              </Link>
              <Link href="https://whatsapp.com/channel/0029VbAoenUEQIamfDBKsT2x" target="_blank">
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Support
                </Button>
              </Link>
            </div>
            <p className="text-sm text-slate-500">For legal inquiries, please allow 3-5 business days for a response</p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
