import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import {
  Clock,
  BarChart3,
  Shield,
  Focus,
  Brain,
  Download,
  Chrome,
  CheckCircle,
  Star,
  ArrowRight,
  Eye,
  Target,
  TrendingUp
} from 'lucide-react'
import './App.css'

function App() {
  const [isHovered, setIsHovered] = useState(false)

  const handleAddToChrome = () => {
    // Placeholder for Chrome Web Store URL
    window.open('https://chrome.google.com/webstore/detail/conscious-media-consumption/YOUR_EXTENSION_ID', '_blank');
  };

  const handleDownloadExtension = () => {
    // Assuming the zip file is in the public directory or accessible via a direct link
    window.open('/conscious-media-extension.zip', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-orange-500/10"></div>
        <div className="relative container mx-auto px-6 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-teal-500/20 text-teal-300 border-teal-500/30">
              🚀 Now Available for Chrome
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-teal-200 to-orange-200 bg-clip-text text-transparent">
              Conscious Media Consumption
            </h1>
            <p className="text-xl lg:text-2xl text-slate-300 mb-8 leading-relaxed">
              Reclaim your digital well-being with our intelligent Chrome extension.
              Track, analyze, and master your online habits with bias detection and focus tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleAddToChrome}
              >
                <Chrome className="mr-2 h-5 w-5" />
                Add to Chrome
                <ArrowRight className={`ml-2 h-5 w-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
              </Button>
              <Button
                variant="outline" size="lg" className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-4 text-lg"
                onClick={handleDownloadExtension}
              >
                <Download className="mr-2 h-5 w-5" />
                Download Extension
              </Button>
            </div>
            <p className="text-sm text-slate-400 mt-4">
              Free • No account required • Works offline
            </p>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">
                  Break Free from Digital Overwhelm
                </h2>
                <div className="space-y-4 text-slate-300">
                  <p className="text-lg">
                    In today's digital age, it's easy to get lost in endless scrolling, biased news,
                    and distracting content. This leads to wasted time, mental fatigue, and an uninformed perspective.
                  </p>
                  <p className="text-lg">
                    Our Chrome extension empowers you to become a mindful media consumer.
                    It provides the tools to understand your habits, identify biases, and regain control over your digital life.
                  </p>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-teal-400" />
                    <span className="text-sm text-slate-300">Real-time tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-teal-400" />
                    <span className="text-sm text-slate-300">Bias detection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-teal-400" />
                    <span className="text-sm text-slate-300">Focus tools</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-teal-400" />
                    <span className="text-sm text-slate-300">Privacy-first</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-8 border border-slate-600">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Today's Usage</span>
                      <Badge className="bg-orange-500/20 text-orange-300">2h 45m</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Social Media</span>
                        <span className="text-slate-300">1h 20m</span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full w-3/5"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">News</span>
                        <span className="text-slate-300">45m</span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div className="bg-teal-500 h-2 rounded-full w-2/5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
                Powerful Features for Digital Wellness
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Everything you need to understand, control, and improve your online habits
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-slate-800/50 border-slate-700 hover:border-teal-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <CardHeader>
                  <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-teal-400" />
                  </div>
                  <CardTitle className="text-white">Time Tracking</CardTitle>
                  <CardDescription className="text-slate-400">
                    Understand where your time goes online with automatic, categorized tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Automatic domain categorization</li>
                    <li>• Real-time session tracking</li>
                    <li>• Daily and weekly reports</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-teal-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <CardHeader>
                  <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-teal-400" />
                  </div>
                  <CardTitle className="text-white">Analytics Dashboard</CardTitle>
                  <CardDescription className="text-slate-400">
                    Visualize your digital diet with intuitive charts and detailed reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Interactive charts and graphs</li>
                    <li>• Category breakdowns</li>
                    <li>• Trend analysis</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-teal-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-orange-400" />
                  </div>
                  <CardTitle className="text-white">Source Bias Analysis</CardTitle>
                  <CardDescription className="text-slate-400">
                    Identify media bias and credibility in real-time, fostering informed consumption
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Real-time bias indicators</li>
                    <li>• Credibility scoring</li>
                    <li>• Visual bias overlays</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-teal-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Focus className="h-6 w-6 text-purple-400" />
                  </div>
                  <CardTitle className="text-white">Focus Mode & Nudges</CardTitle>
                  <CardDescription className="text-slate-400">
                    Minimize distractions and stay on track with customizable limits and smart alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Website blocking</li>
                    <li>• Smart notifications</li>
                    <li>• Custom time limits</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-teal-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-white">Personalized Insights</CardTitle>
                  <CardDescription className="text-slate-400">
                    Receive actionable recommendations to improve your digital well-being
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Daily digest reports</li>
                    <li>• Habit recommendations</li>
                    <li>• Progress tracking</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-teal-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Eye className="h-6 w-6 text-green-400" />
                  </div>
                  <CardTitle className="text-white">Privacy First</CardTitle>
                  <CardDescription className="text-slate-400">
                    All data stays on your device. No tracking, no data collection, complete privacy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Local data storage</li>
                    <li>• No external tracking</li>
                    <li>• Open source code</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-800/30">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
                How It Works
              </h2>
              <p className="text-xl text-slate-300">
                Get started in minutes with our simple 4-step process
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-400">1</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Install</h3>
                <p className="text-slate-400">
                  Add the "Conscious Media Consumption" extension to your Chrome browser
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-400">2</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Browse</h3>
                <p className="text-slate-400">
                  Go about your daily online activities – the extension works silently in the background
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-400">3</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Analyze</h3>
                <p className="text-slate-400">
                  Open the popup or dashboard to see your usage patterns and insights
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-400">4</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Control</h3>
                <p className="text-slate-400">
                  Use focus mode and nudges to guide your consumption towards healthier habits
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
                What Users Are Saying
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-slate-300">
                    "This extension changed how I interact with news. The bias indicators are a game-changer!"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400">— Sarah M., Journalist</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-slate-300">
                    "I never realized how much time I was wasting until I saw the dashboard. Highly recommend!"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400">— Mike T., Software Developer</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-slate-300">
                    "The focus mode has helped me stay productive during work hours. Simple but effective!"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400">— Lisa K., Marketing Manager</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-500/10 to-orange-500/10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              Ready to Take Control of Your Digital Life?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of users who have transformed their online habits with Conscious Media Consumption
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                onClick={handleAddToChrome}
              >
                <Chrome className="mr-2 h-5 w-5" />
                Add to Chrome - It's Free
              </Button>
              <Button variant="outline" size="lg" className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-4 text-lg"
                onClick={handleDownloadExtension}
              >
                <Download className="mr-2 h-5 w-5" />
                Download Extension
              </Button>
            </div>
            <div className="mt-8 flex justify-center items-center space-x-8 text-slate-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-teal-400" />
                <span>Free Forever</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-teal-400" />
                <span>No Account Required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-teal-400" />
                <span>Privacy First</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="col-span-2">
                <h3 className="text-xl font-bold text-white mb-4">Conscious Media Consumption</h3>
                <p className="text-slate-400 mb-4">
                  Empowering mindful digital habits through intelligent tracking and analysis.
                </p>
                <div className="flex space-x-4">
                  <Badge variant="outline" className="border-slate-600 text-slate-400">
                    Chrome Extension
                  </Badge>
                  <Badge variant="outline" className="border-slate-600 text-slate-400">
                    Privacy First
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Features</h4>
                <ul className="space-y-2 text-slate-400">
                  <li>Time Tracking</li>
                  <li>Bias Analysis</li>
                  <li>Focus Mode</li>
                  <li>Analytics Dashboard</li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
                <ul className="space-y-2 text-slate-400">
                  <li>Installation Guide</li>
                  <li>Documentation</li>
                  <li>Privacy Policy</li>
                  <li>Terms of Service</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
              <p>&copy; 2025 Conscious Media Consumption. Built with ❤️ by Manus AI.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

