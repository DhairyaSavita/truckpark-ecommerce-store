import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TruckIcon, ShieldCheckIcon, ClockIcon, CurrencyRupeeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const features = [
    {
      icon: TruckIcon,
      title: 'Fast Delivery',
      description: 'Free shipping on orders over ₹5000',
      color: 'bg-blue-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Genuine Parts',
      description: '100% authentic truck parts',
      color: 'bg-green-500'
    },
    {
      icon: ClockIcon,
      title: '24/7 Support',
      description: 'Round the clock customer service',
      color: 'bg-purple-500'
    },
    {
      icon: CurrencyRupeeIcon,
      title: 'Best Prices',
      description: 'Competitive pricing guaranteed',
      color: 'bg-orange-500'
    }
  ];

  const categories = [
    { name: 'Engine Parts', image: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=400', count: 45 },
    { name: 'Brake System', image: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=400', count: 32 },
    { name: 'Transmission', image: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=400', count: 28 },
    { name: 'Electrical', image: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=400', count: 24 },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="container-custom relative z-10 py-20 md:py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Quality Truck Parts at Your Fingertips
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Find genuine, high-quality truck parts from trusted sellers. Fast delivery, competitive prices, and expert support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-primary text-lg px-8 py-3">
                Shop Now
                <ArrowRightIcon className="h-5 w-5 inline ml-2" />
              </Link>
              <Link to="/contact" className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="section-title">Why Choose Us?</h2>
            <p className="section-subtitle">We provide the best service in the industry</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="card p-6 text-center"
              >
                <div className={`${feature.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Browse our wide range of truck parts</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {categories.map((category, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white text-xl font-bold">{category.name}</h3>
                  <p className="text-gray-300">{category.count} products</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="container-custom text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Find Your Perfect Part?
            </h2>
            <p className="text-primary-100 mb-8 text-lg">
              Join thousands of satisfied customers who trust us for their truck parts needs.
            </p>
            <Link to="/products" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center">
              Browse Products
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
