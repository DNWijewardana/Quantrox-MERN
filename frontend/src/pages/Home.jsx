import React from 'react'
import HeroSection from '../components/home/HeroSection'
import FeaturesSection from '../components/home/FeaturesSection'
import HowItWorksSection from '../components/home/HowItWorksSection'
import CTASection from '../components/home/CTASection'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import RecentProjects from '@/components/home/RecentProjects'


const Home = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <RecentProjects />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  )
}

export default Home
