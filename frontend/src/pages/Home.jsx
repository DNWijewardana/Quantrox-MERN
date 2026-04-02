import React from 'react'
import HeroSection from '../components/home/HeroSection'
import FeaturesSection from '../components/home/FeaturesSection'
import HowItWorksSection from '../components/home/HowItWorksSection'
import CTASection from '../components/home/CTASection'
import Header from '../components/layout/Header'


const Home = () => {
  return (
    <div>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
    </div>
  )
}

export default Home
