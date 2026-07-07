import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { UploadCloud, X, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]); // Array of File objects
  const [imagePreviews, setImagePreviews] = useState([]); // Array of Object URLs
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Baby Toys',
    ageGroup: 'All',
    price: '',
    originalPrice: '',
    stock: 10,
    description: '',
    inStock: true,
    isNewProduct: true,
    isSale: false
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setImages(prev => [...prev, ...files]);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const uploadImagesToCloudinary = async () => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName || !uploadPreset || cloudName.includes('your_cloud_name')) {
      alert("Cloudinary credentials missing in .env");
      return null;
    }

    const uploadedUrls = [];

    for (const file of images) {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("upload_preset", uploadPreset);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: uploadData
        });
        const data = await res.json();
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url);
        }
      } catch (err) {
        console.error("Cloudinary upload failed", err);
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    setLoading(true);
    
    const uploadedImageUrls = await uploadImagesToCloudinary();
    
    if (!uploadedImageUrls || uploadedImageUrls.length === 0) {
      alert("Failed to upload images. Check credentials.");
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      stock: Number(formData.stock),
      images: uploadedImageUrls, // New array field
      image: uploadedImageUrls[0] // Fallback for old frontend
    };

    try {
      await api.post('/products', payload);
      navigate('/products');
    } catch (err) {
      alert("Failed to create product");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/products" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main Details) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. Wooden Toy" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Mother & Toddler" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                <select name="ageGroup" value={formData.ageGroup} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="0-1">Newborns (0 - 1 Years)</option>
                  <option value="1-3">Toddlers (1 - 3 Years)</option>
                  <option value="3-6">Preschoolers (3 - 6 Years)</option>
                  <option value="6-10">Big Kids (6 - 10 Years)</option>
                  <option value="All">All Ages</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" required value={formData.description} onChange={handleChange} rows="5" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Describe the product..."></textarea>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <h3 className="font-semibold text-gray-900">Media</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-900">Drop your images here, or <span className="text-primary-600">click to browse</span></p>
              <p className="text-xs text-gray-500 mt-1">1600 x 1200 (4:3) recommended. PNG, JPG.</p>
            </div>
            
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden group">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <h3 className="font-semibold text-gray-900">Pricing</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input type="number" name="price" required value={formData.price} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="999" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹) - Optional</label>
              <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="1299" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <h3 className="font-semibold text-gray-900">Organization</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="Baby Toys">Baby Toys</option>
                <option value="Baby Dresses">Baby Dresses</option>
                <option value="Feeding Accessories">Feeding Accessories</option>
                <option value="Baby Basics">Baby Basics</option>
                <option value="Educational Toys">Educational Toys</option>
                <option value="Maternity Wear">Maternity Wear</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="inStock" checked={formData.inStock} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                <span className="text-sm font-medium text-gray-700">Track Quantity / In Stock</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="isNewProduct" checked={formData.isNewProduct} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                <span className="text-sm font-medium text-gray-700">Mark as "New"</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="isSale" checked={formData.isSale} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                <span className="text-sm font-medium text-gray-700">On Sale badge</span>
              </label>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-primary-600 text-white font-medium py-3 px-4 rounded-xl shadow-sm hover:bg-primary-700 transition-colors flex justify-center items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Publishing Product...' : 'Publish Product'}
          </button>

        </div>
      </form>
    </div>
  );
};

export default AddProduct;
