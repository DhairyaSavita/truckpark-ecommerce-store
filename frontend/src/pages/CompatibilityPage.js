import React, { useState } from 'react';
import { compatibilityAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const CompatibilityPage = () => {
  const [vehicle, setVehicle] = useState({
    make: '',
    model: '',
    year: '',
    engine: ''
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  const makes = ['Volvo', 'Scania', 'Mercedes-Benz', 'MAN', 'DAF', 'Kenworth', 'Peterbilt', 'Freightliner'];
  
  const models = {
    'Volvo': ['FH16', 'FM', 'FH', 'FMX'],
    'Scania': ['R-Series', 'S-Series', 'G-Series', 'P-Series'],
    'Mercedes-Benz': ['Actros', 'Arocs', 'Antos', 'Axor'],
    'MAN': ['TGX', 'TGS', 'TGM', 'TGL'],
    'Kenworth': ['T680', 'T880', 'W900', 'T800'],
    'Peterbilt': ['579', '389', '567', '579 UltraLoft']
  };

  const handleChange = (e) => {
    setVehicle({ ...vehicle, [e.target.name]: e.target.value });
    setChecked(false);
  };

  const checkCompatibility = async () => {
    if (!vehicle.make || !vehicle.model) {
      toast.error('Please select vehicle make and model');
      return;
    }

    setLoading(true);
    try {
      const response = await compatibilityAPI.getCompatibleProducts(vehicle);
      setProducts(response.data);
      setChecked(true);
      if (response.data.length === 0) {
        toast.info('No compatible products found for this vehicle');
      } else {
        toast.success(`Found ${response.data.length} compatible products`);
      }
    } catch (error) {
      toast.error('Failed to check compatibility');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Vehicle Compatibility Checker</h1>
        <p className="text-gray-600">Find parts that fit your truck perfectly</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Make *</label>
            <select
              name="make"
              value={vehicle.make}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Make</option>
              {makes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Model *</label>
            <select
              name="model"
              value={vehicle.model}
              onChange={handleChange}
              disabled={!vehicle.make}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Model</option>
              {vehicle.make && models[vehicle.make]?.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Year</label>
            <input
              type="number"
              name="year"
              placeholder="e.g., 2020"
              value={vehicle.year}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Engine</label>
            <input
              type="text"
              name="engine"
              placeholder="e.g., D13"
              value={vehicle.engine}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        
        <button
          onClick={checkCompatibility}
          disabled={loading}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Checking...' : 'Find Compatible Parts'}
        </button>
      </div>

      {checked && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Compatible Products ({products.length})
          </h2>
          {products.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <p className="text-yellow-800">No compatible products found for your vehicle.</p>
              <p className="text-gray-600 mt-2">Try adjusting your search criteria or contact us for assistance.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompatibilityPage;
