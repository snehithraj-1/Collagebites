import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  UtensilsCrossed,
  Sparkles,
  AlertCircle,
  Save,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function MenuManagerModal({
  isOpen,
  onClose,
  restaurants = [],
  assignedRestaurantId = null
}) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState(assignedRestaurantId || 'all');
  const [togglingId, setTogglingId] = useState(null);

  // Edit / Add Item State
  const [editingItem, setEditingItem] = useState(null); // null = modal closed, {} = new item, item = edit
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Main Course',
    restaurant_id: 'local-home-kitchen',
    description: '',
    is_available: true,
    is_veg: true
  });
  const [savingItem, setSavingItem] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadMenu();
    }
  }, [isOpen]);

  const loadMenu = async () => {
    setLoading(true);
    try {
      const items = await api.getMenu();
      setMenuItems(items);
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Categories extracted from items
  const categories = ['all', ...new Set(menuItems.map((i) => i.category || 'General').filter(Boolean))];

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesRest = selectedRestaurant === 'all' || item.restaurant_id === selectedRestaurant;
    return matchesSearch && matchesCat && matchesRest;
  });

  // Toggle availability
  const handleToggleAvailability = async (item) => {
    setTogglingId(item.id);
    const nextState = !item.is_available;
    try {
      await api.toggleItemAvailability(item.id, nextState);
      setMenuItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_available: nextState } : i))
      );
    } catch (err) {
      alert(`Failed to update availability: ${err.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  // Delete Item
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this dish from the menu?')) return;
    try {
      await api.deleteMenuItem(itemId);
      setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      alert(`Failed to delete item: ${err.message}`);
    }
  };

  // Open Edit Form
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      price: item.price || '',
      category: item.category || 'Main Course',
      restaurant_id: item.restaurant_id || 'local-home-kitchen',
      description: item.description || '',
      is_available: item.is_available !== false,
      is_veg: item.is_veg !== false
    });
    setFormError('');
  };

  // Open Add Form
  const handleOpenAdd = () => {
    setEditingItem({});
    setFormData({
      name: '',
      price: '',
      category: 'Main Course',
      restaurant_id: assignedRestaurantId || (restaurants[0]?.id || 'local-home-kitchen'),
      description: '',
      is_available: true,
      is_veg: true
    });
    setFormError('');
  };

  // Save Item (Add or Edit)
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      setFormError('Name and Price are required.');
      return;
    }

    setSavingItem(true);
    setFormError('');

    try {
      const payload = {
        name: formData.name.trim(),
        price: Number(formData.price),
        category: formData.category,
        restaurant_id: formData.restaurant_id,
        description: formData.description.trim(),
        is_available: formData.is_available,
        is_veg: formData.is_veg
      };

      if (editingItem.id) {
        // Update existing
        await api.updateMenuItem(editingItem.id, payload);
        setMenuItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? { ...i, ...payload } : i))
        );
      } else {
        // Create new
        const created = await api.createMenuItem(payload);
        setMenuItems((prev) => [created.item || { ...payload, id: `item-${Date.now()}` }, ...prev]);
      }
      setEditingItem(null);
    } catch (err) {
      setFormError(err.message || 'Failed to save menu dish.');
    } finally {
      setSavingItem(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-5xl bg-[#0F172A] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-5 border-b border-slate-800 bg-[#111C34] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white text-lg shadow-lg border border-amber-400/30">
              🍽️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black font-['Outfit'] text-white">
                Menu & Stock Management
              </h2>
              <p className="text-xs text-slate-400">
                {menuItems.length} authentic dishes loaded from Neon DB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF5722] to-amber-600 hover:from-[#F4511E] hover:to-amber-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer border-none"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add New Dish</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dish name or category..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FF5722]"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Restaurant Selector */}
            <select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none"
            >
              <option value="all">All Kitchens</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>

            {/* Category Selector */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dish Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-2">
              <div className="w-8 h-8 border-3 border-[#FF5722] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold">Loading menu inventory...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              No dishes found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredItems.map((item) => {
                const isAvail = item.is_available !== false;
                const isToggling = togglingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isAvail
                        ? 'bg-slate-900/80 border-slate-800'
                        : 'bg-slate-950/60 border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${item.is_veg !== false ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                            <h4 className="font-extrabold text-white text-xs sm:text-sm">
                              {item.name}
                            </h4>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                            {item.category || 'Main Course'}
                          </span>
                        </div>
                        <span className="text-sm font-black font-['Outfit'] text-emerald-400">
                          ₹{item.price}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Actions Row */}
                    <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      {/* In Stock / Sold Out Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item)}
                        disabled={isToggling}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          isAvail
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                        }`}
                      >
                        {isAvail ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        <span>{isToggling ? 'Updating...' : isAvail ? 'In Stock' : 'Sold Out'}</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Edit Dish"
                      >
                        <Edit2 size={13} />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors"
                        title="Delete Dish"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add/Edit Modal Layer */}
        {editingItem !== null && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-20 flex items-center justify-center p-4">
            <div className="bg-[#0F172A] border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-extrabold text-white">
                  {editingItem.id ? 'Edit Dish' : 'Add New Menu Item'}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-950 text-rose-300 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Dish Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Diet Type</label>
                    <select
                      value={formData.is_veg ? 'veg' : 'nonveg'}
                      onChange={(e) => setFormData({ ...formData, is_veg: e.target.value === 'veg' })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    >
                      <option value="veg">🟢 Veg</option>
                      <option value="nonveg">🔴 Non-Veg</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Restaurant</label>
                    <select
                      value={formData.restaurant_id}
                      onChange={(e) => setFormData({ ...formData, restaurant_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    >
                      {restaurants.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="rounded border-slate-700 text-[#FF5722]"
                  />
                  <label htmlFor="is_available" className="text-white font-semibold">Available for ordering</label>
                </div>

                <button
                  type="submit"
                  disabled={savingItem}
                  className="w-full py-2.5 mt-2 rounded-xl bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  {savingItem ? 'Saving Dish...' : 'Save Menu Item'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
