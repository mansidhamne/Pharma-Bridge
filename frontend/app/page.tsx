import Image from "next/image"
import { Montserrat } from "next/font/google"
import { ArrowRight, Upload, Brain, Database } from "lucide-react"
import Navbar from "@/components/common/Navbar"

const montserrat = Montserrat({ subsets: ["latin"] })

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface WorkflowStepProps {
  number: number;
  title: string;
  description: string;
}

interface BenefitCardProps {
  title: string;
  description: string;
}

interface TestimonialCardProps {
  quote: string;
  author: string;
}

export default function Home() {
  return (
    <div className={`${montserrat.className} bg-gradient-to-b from-violet-50 to-white min-h-screen`}>
      {/* <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Image src={logo} alt="Pharma Bridge Logo" width={60} height={60} />
            <span className="ml-2 text-xl font-bold text-blue-600">Pharma Bridge</span>
          </div>
          <div className="hidden md:flex space-x-4">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition duration-300">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition duration-300">
              How It Works
            </a>
            <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition duration-300">
              Testimonials
            </a>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300">
            Get Started
          </button>
        </nav>
      </header> */}
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-5xl font-bold mb-4 text-gray-800">
            Bridging Pharmacy Excellence with Diagnostic Precision
          </h1>
          <p className="text-xl mb-8 text-gray-600">
            Transform healthcare with our all-in-one pharmacy and diagnostic assistant.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="hover:bg-violet-600 text-white px-6 py-3 rounded-full bg-indigo-900 transition duration-300 flex items-center">
              Request a Demo <ArrowRight className="ml-2" />
            </button>
            <button className="bg-white text-violet-600 px-6 py-3 rounded-full border border-violet-600 hover:bg-blue-50 transition duration-300">
              Learn More
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-slate-50 py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Key Features & Functions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Upload className="text-blue-600 w-12 h-12" />}
                title="Automated Prescription Matching"
                description="Utilize advanced OCR and handwriting recognition to accurately interpret handwritten prescriptions."
              />
              <FeatureCard
                icon={<Database className="text-blue-600 w-12 h-12" />}
                title="Efficient Order Management"
                description="Automatically generate, track, and manage patient orders to ensure timely delivery of medications."
              />
              <FeatureCard
                icon={<Brain className="text-blue-600 w-12 h-12" />}
                title="AI-Powered Diagnostic Assistance"
                description="Analyze diagnostic scans and medical images using state-of-the-art deep learning algorithms."
              />
              {/* Add more feature cards here */}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">How It Works</h2>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-8">
              <WorkflowStep
                number={1}
                title="Capture & Upload"
                description="Easily upload prescription images and patient data."
              />
              <WorkflowStep
                number={2}
                title="Intelligent Analysis"
                description="Our AI engine processes the data with precision."
              />
              <WorkflowStep
                number={3}
                title="Actionable Insights"
                description="Receive real-time diagnostic suggestions and alerts."
              />
              <WorkflowStep
                number={4}
                title="Seamless Integration"
                description="Integrate with your existing healthcare systems."
              />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-blue-600 text-white py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-center">Benefits</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <BenefitCard
                title="For Pharmacists"
                description="Streamline workflow, reduce manual errors, and enhance patient satisfaction."
              />
              <BenefitCard
                title="For Clinicians"
                description="Accelerate diagnosis with AI-driven insights and improve treatment outcomes."
              />
              <BenefitCard
                title="For Patients"
                description="Experience faster service, reduced wait times, and higher quality care."
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">What Our Users Say</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <TestimonialCard
                quote="Pharma Bridge has completely transformed our workflow. It significantly reduces prescription errors and elevates the quality of patient care."
                author="Dr. A. Kumar, Pharmacist"
              />
              <TestimonialCard
                quote="The integration of diagnostic insights with pharmacy operations has revolutionized our practice, leading to faster and more accurate diagnoses."
                author="Dr. S. Mehta, Clinician"
              />
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gray-100 py-16">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Ready to Transform Healthcare?</h2>
            <p className="text-xl mb-8 text-gray-600">Join the new era of integrated pharmacy and diagnostic care.</p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg hover:bg-blue-700 transition duration-300">
              Sign Up Now
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Image src="/logo-placeholder.svg" alt="Pharma Bridge Logo" width={40} height={40} />
              <span className="ml-2 text-xl font-bold">Pharma Bridge</span>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-400 transition duration-300">
                About Us
              </a>
              <a href="#" className="hover:text-blue-400 transition duration-300">
                Contact
              </a>
              <a href="#" className="hover:text-blue-400 transition duration-300">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-blue-400 transition duration-300">
                Terms of Use
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm">
            <p>&copy; 2023 Pharma Bridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function WorkflowStep({ number, title, description }: WorkflowStepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function BenefitCard({ title, description }: BenefitCardProps) {
  return (
    <div className="bg-white bg-opacity-10 p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p>{description}</p>
    </div>
  )
}

function TestimonialCard({ quote, author }: TestimonialCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <p className="text-gray-600 mb-4">&ldquo;{quote}&rdquo;</p>
      <p className="font-semibold text-gray-800">- {author}</p>
    </div>
  )
}

