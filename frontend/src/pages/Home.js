import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TruckIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  ArrowRightIcon,
  StarIcon,
  UserGroupIcon,
  CubeIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { products as productsApi } from '../services/api';

/* ─── Animation Variants ─── */
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

/* ─── Static Data ─── */
const features = [
  {
    icon: TruckIcon,
    title: 'Pan-India Delivery',
    description: 'Free shipping on orders above ₹5,000. Express delivery available.',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: ShieldCheckIcon,
    title: '100% Genuine Parts',
    description: 'Every part verified by our quality assurance team.',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: ClockIcon,
    title: '24/7 Expert Support',
    description: 'Round-the-clock assistance from certified truck mechanics.',
    gradient: 'from-violet-500 to-violet-600',
  },
  {
    icon: CurrencyRupeeIcon,
    title: 'Best Price Guarantee',
    description: "We'll match any lower price you find anywhere.",
    gradient: 'from-orange-500 to-orange-600',
  },
];

const categories = [
  {
    name: 'Engine Parts',
    description: 'Pistons, crankshafts, gaskets & more',
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop',
    link: '/products?categoryName=Engine+Parts',
    count: 45,
    badge: '🔥 Best Seller',
  },
  {
    name: 'Brake System',
    description: 'Drums, pads, discs & hydraulic kits',
    image:
      'https://images.unsplash.com/photo-1600186500707-bdb71becd3e0?w=600&auto=format&fit=crop',
    link: '/products?categoryName=Brake+System',
    count: 32,
    badge: '⚡ Fast Delivery',
  },
  {
    name: 'Transmission',
    description: 'Gearboxes, clutch kits & differentials',
    image:
      'https://images.unsplash.com/photo-1617469767611-15c6b7960c2b?w=600&auto=format&fit=crop',
    link: '/products?categoryName=Transmission',
    count: 28,
    badge: '🔧 OEM Quality',
  },
  {
    name: 'Electrical & Lighting',
    description: 'Alternators, batteries, wiring & LEDs',
    image:
      'https://images.unsplash.com/photo-1647872556498-4db53a90e2d9?w=600&auto=format&fit=crop',
    link: '/products?categoryName=Electrical',
    count: 24,
    badge: '✨ New Arrivals',
  },
];

const stats = [
  { value: '50,000+', label: 'Spare Parts', icon: CubeIcon },
  { value: '500+', label: 'Verified Sellers', icon: CheckBadgeIcon },
  { value: '1,20,000+', label: 'Happy Customers', icon: UserGroupIcon },
  { value: '4.8 ★', label: 'Average Rating', icon: StarIcon },
];

/* ─── Star Rating Component ─── */
const StarRating = ({ rating = 4.5 }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((s) =>
        s <= Math.floor(rating) ? (
          <StarSolid key={s} className="h-4 w-4 text-amber-400" />
        ) : (
          <StarIcon key={s} className="h-4 w-4 text-amber-300" />
        )
      )}
    </div>
  );
};

/* ─── Featured Product Card ─── */
const FeaturedCard = ({ product }) => {
  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(p);

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -6 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <Link to={`/products/${product.id}`}>
        <div className="relative h-44 bg-gray-100 overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <TruckIcon className="h-16 w-16 text-gray-300" />
            </div>
          )}
          {product.stock_quantity < 10 && product.stock_quantity > 0 && (
            <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
              Low Stock
            </span>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide mb-1">
            {product.brand || 'Genuine Part'}
          </p>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold text-indigo-600">{formatPrice(product.price)}</span>
            <StarRating rating={product.rating || 4.5} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

/* ─── Main Component ─── */
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await productsApi.getAll({ limit: 8, sort: 'newest' });
        setFeaturedProducts(res.data?.slice(0, 8) || []);
      } catch {
        setFeaturedProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1600&auto=format&fit=crop')",
          }}
        />
        {/* Overlay: dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-900/80 to-transparent" />

        {/* Animated mesh blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl" />
        </div>

        <div className="container-custom relative z-10 py-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-2xl"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                India's #1 Truck Spare Parts Marketplace
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6"
            >
              Genuine Truck Parts,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
                Delivered Fast
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg text-gray-300 mb-8 leading-relaxed">
              Find OEM-quality spare parts for Tata, Ashok Leyland, Mahindra, BharatBenz and
              more. 50,000+ parts from 500+ trusted sellers across India.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60 hover:-translate-y-0.5"
              >
                Shop All Parts
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link
                to="/compatibility"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/20 transition-all duration-200 backdrop-blur-sm"
              >
                <ShieldCheckIcon className="h-5 w-5" />
                Check Compatibility
              </Link>
            </motion.div>

            {/* Trust Signals */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-6 mt-10">
              {['Free Returns', 'GST Invoice', 'Warranty Assured', 'COD Available'].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <CheckBadgeIcon className="h-4 w-4 text-emerald-400" />
                  {t}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-indigo-700 py-8">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeInUp} className="text-center">
                <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                <p className="text-indigo-200 text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Why 1,20,000+ Truck Owners Choose Us
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Built specifically for the Indian trucking industry, from the ground up.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeInUp}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <f.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section className="py-20">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Shop by Category</h2>
            <p className="text-gray-500 text-lg">Browse our wide range of OEM & aftermarket parts</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {categories.map((cat) => (
              <motion.div
                key={cat.name}
                variants={fadeInUp}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl cursor-pointer transition-all duration-300"
              >
                <Link to={cat.link}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Badge */}
                  <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
                    {cat.badge}
                  </span>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white text-xl font-bold mb-1">{cat.name}</h3>
                    <p className="text-gray-300 text-sm mb-2">{cat.description}</p>
                    <span className="inline-flex items-center gap-1 text-indigo-300 text-xs font-medium group-hover:gap-2 transition-all">
                      {cat.count} products <ArrowRightIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex justify-between items-end mb-10"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Latest Products
              </h2>
              <p className="text-gray-500">Freshly added parts from our verified sellers</p>
            </div>
            <Link
              to="/products"
              className="hidden md:inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
            >
              View All <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </motion.div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-64" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {featuredProducts.map((product) => (
                <FeaturedCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl">
              <CubeIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Products loading soon...</p>
            </div>
          )}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mt-8 text-center md:hidden"
          >
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-indigo-600 font-semibold"
            >
              View All Products <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Marketplace Services ── */}
      <section className="py-20">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              More Than Just Parts
            </h2>
            <p className="text-gray-500 text-lg">
              A complete ecosystem for India's trucking industry
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                title: 'Live Auctions',
                desc: 'Bid on quality refurbished parts at unbeatable prices.',
                link: '/auctions',
                emoji: '🔨',
                color: 'from-pink-500 to-rose-600',
              },
              {
                title: 'Mechanic Booking',
                desc: 'Book certified technicians for on-site installation & repair.',
                link: '/installations',
                emoji: '🔧',
                color: 'from-indigo-500 to-blue-600',
              },
              {
                title: 'B2B Bulk Quotes',
                desc: 'Get custom pricing for large fleet orders. Negotiate directly.',
                link: '/b2b/quotes',
                emoji: '📋',
                color: 'from-emerald-500 to-teal-600',
              },
            ].map((s) => (
              <motion.div
                key={s.title}
                variants={fadeInUp}
                whileHover={{ y: -6 }}
                className="group"
              >
                <Link to={s.link}>
                  <div className={`rounded-2xl bg-gradient-to-br ${s.color} p-8 text-white shadow-lg hover:shadow-2xl transition-all duration-300`}>
                    <span className="text-5xl mb-5 block">{s.emoji}</span>
                    <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                    <p className="text-white/80 text-sm leading-relaxed mb-5">{s.desc}</p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all">
                      Learn More <ArrowRightIcon className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24 bg-gradient-to-br from-indigo-700 via-indigo-800 to-blue-900 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.p variants={fadeInUp} className="text-indigo-300 font-semibold mb-4 tracking-widest uppercase text-sm">
              Ready to get started?
            </motion.p>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              Find Your Perfect Part Today
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-indigo-200 text-lg mb-10 max-w-xl mx-auto">
              Join over 1,20,000 fleet owners, workshops, and drivers who trust TruckParts Market
              for all their spare parts needs.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:-translate-y-0.5"
              >
                Browse All Parts <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-transparent text-white font-bold px-8 py-4 rounded-xl border-2 border-white/30 hover:bg-white/10 transition-all"
              >
                Create Free Account
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
