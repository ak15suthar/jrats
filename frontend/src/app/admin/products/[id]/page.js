'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProductFormPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id && params.id !== 'new';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    stock: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    if (isEdit) {
      loadProduct();
    }
  }, [user, isEdit]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const product = await api.getProduct(params.id);
      setForm({
        name: product.name,
        description: product.description || '',
        price: product.price,
        image_url: product.image_url || '',
        category: product.category || '',
        stock: product.stock
      });
    } catch (error) {
      toast.error('Failed to load product');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const productData = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0
      };

      if (isEdit) {
        await api.updateProduct(params.id, productData);
        toast.success('Product updated successfully');
      } else {
        await api.createProduct(productData);
        toast.success('Product created successfully');
      }
      router.push('/admin/products');
    } catch (error) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/admin/products" className="text-primary-600 hover:underline text-sm mb-4 block">
        ← Back to Products
      </Link>
      
      <h1 className="text-3xl font-bold mb-8">
        {isEdit ? 'Edit Product' : 'Add New Product'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <label className="label">Product Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            className="input"
            placeholder="Wireless Headphones"
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            className="input min-h-[120px]"
            placeholder="Premium noise-cancelling wireless headphones..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Price *</label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
              className="input"
              placeholder="99.99"
            />
          </div>

          <div>
            <label className="label">Stock</label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm(prev => ({ ...prev, stock: e.target.value }))}
              className="input"
              placeholder="50"
            />
          </div>
        </div>

        <div>
          <label className="label">Category</label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
            className="input"
            placeholder="Electronics"
          />
        </div>

        <div>
          <label className="label">Image URL</label>
          <input
            type="url"
            value={form.image_url}
            onChange={(e) => setForm(prev => ({ ...prev, image_url: e.target.value }))}
            className="input"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {form.image_url && (
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={form.image_url}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full disabled:bg-gray-400"
        >
          {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}