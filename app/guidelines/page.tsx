import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  FileText,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Clock,
  Users,
  Heart,
} from "lucide-react"
import Link from "next/link"
import Footer from "@/components/footer"

export default function Guidelines() {
  const guidelines = [
    {
      title: "File Requirements",
      icon: FileText,
      color: "blue",
      rules: [
        "Only PDF files are accepted",
        "Maximum file size: 10MB",
        "File must be readable and not corrupted",
        "No password-protected PDFs",
      ],
    },
    {
      title: "Content Standards",
      icon: Shield,
      color: "purple",
      rules: [
        "Educational content only",
        "No copyrighted material without permission",
        "No inappropriate or offensive content",
        "Original work or properly attributed sources",
      ],
    },
    {
      title: "Quality Guidelines",
      icon: CheckCircle,
      color: "green",
      rules: [
        "Clear, readable text and images",
        "Proper formatting and structure",
        "Relevant to educational purposes",
        "Complete documents (not partial/incomplete)",
      ],
    },
    {
      title: "Metadata Requirements",
      icon: Users,
      color: "pink",
      rules: [
        "Descriptive and accurate title",
        "Helpful description of content",
        "Appropriate categorization",
        "No misleading information",
      ],
    },
  ]

  const approvalProcess = [
    {
      step: 1,
      title: "Upload",
      description: "Submit your PDF with title and description",
      icon: Upload,
      time: "Instant",
    },
    {
      step: 2,
      title: "Review",
      description: "Our admin team reviews for quality and compliance",
      icon: Shield,
      time: "1-24 hours",
    },
    {
      step: 3,
      title: "Approval",
      description: "Approved PDFs become visible to all users",
      icon: CheckCircle,
      time: "Instant",
    },
  ]

  const examples = {
    good: [
      "Mathematics Calculus Study Guide - Chapter 1-5",
      "Introduction to Python Programming - Complete Tutorial",
      "World History Timeline - Ancient Civilizations",
      "Chemistry Lab Safety Procedures and Protocols",
    ],
    bad: ["untitled.pdf", "document", "my file", "test123"],
  }

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
                  Upload Guidelines
                </h1>
                <p className="text-sm text-slate-600">Best practices for sharing educational resources</p>
              </div>
            </div>
            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Upload className="w-4 h-4 mr-2" />
                Start Uploading
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Upload Guidelines</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Follow these guidelines to ensure your educational resources are approved quickly and help others learn
            effectively
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 text-center">
            <CardContent className="pt-6">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">95%</div>
              <p className="text-green-700 text-sm">Approval Rate</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 text-center">
            <CardContent className="pt-6">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">12h</div>
              <p className="text-blue-700 text-sm">Average Review Time</p>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 text-center">
            <CardContent className="pt-6">
              <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">4.8</div>
              <p className="text-purple-700 text-sm">Average Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Guidelines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {guidelines.map((guideline, index) => (
            <Card
              key={index}
              className="border-purple-200/50 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all"
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-${guideline.color}-100 to-${guideline.color}-200 rounded-xl flex items-center justify-center`}
                  >
                    <guideline.icon className={`w-6 h-6 text-${guideline.color}-600`} />
                  </div>
                  <CardTitle className="text-xl text-slate-900">{guideline.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {guideline.rules.map((rule, ruleIndex) => (
                    <li key={ruleIndex} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{rule}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Approval Process */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50 backdrop-blur-sm mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-slate-900">Approval Process</CardTitle>
            <CardDescription className="text-lg">Here's what happens after you upload your PDF</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {approvalProcess.map((process, index) => (
                <div key={index} className="text-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <process.icon className="w-8 h-8 text-white" />
                    </div>
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white">
                      {process.step}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{process.title}</h3>
                  <p className="text-slate-600 mb-2">{process.description}</p>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    {process.time}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Title Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-green-100/50">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Good Title Examples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {examples.good.map((title, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-green-800 font-medium">{title}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-gradient-to-br from-red-50/50 to-red-100/50">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                Poor Title Examples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {examples.bad.map((title, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-red-800 font-medium">{title}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Important Notes */}
        <div className="space-y-4 mb-12">
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Copyright Notice:</strong> Only upload content you own or have permission to share. Copyrighted
              material without proper authorization will be removed.
            </AlertDescription>
          </Alert>

          <Alert className="border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Quality Assurance:</strong> Our admin team reviews all uploads to maintain high-quality
              educational content for our community.
            </AlertDescription>
          </Alert>
        </div>

        {/* CTA Section */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50 backdrop-blur-sm text-center">
          <CardContent className="pt-8 pb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to Share Your Knowledge?</h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Join thousands of educators and students sharing valuable resources on EduResources
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your First PDF
                </Button>
              </Link>
              <Link href="/help">
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
                >
                  Need Help?
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
