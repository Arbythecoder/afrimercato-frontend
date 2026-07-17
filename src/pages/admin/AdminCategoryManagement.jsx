import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Search, Plus, Pencil, EyeOff, Eye, Check, X } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deactivateCategory } from '../../services/api';

/**
 * Admin Category Management Page
 * List, add, rename, and deactivate product categories
 */
function AdminCategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      if (res?.success) setCategories(res.data || []);
      else setError(res?.message || 'Failed to load categories');
    } catch (err) {
      setError(err?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setAddingCategory(true);
      setError('');
      const res = await createCategory(newCategoryName.trim());
      if (res?.success) {
        setCategories(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
        setNewCategoryName('');
      } else {
        setError(res?.message || 'Failed to create category');
      }
    } catch (err) {
      setError(err?.message || 'Failed to create category');
    } finally {
      setAddingCategory(false);
    }
  };

  const startEditing = (category) => {
    setEditingId(category._id);
    setEditingName(category.name);
    setError('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleRename = async (categoryId) => {
    if (!editingName.trim()) return;

    try {
      setSavingId(categoryId);
      const res = await updateCategory(categoryId, { name: editingName.trim() });
      if (res?.success) {
        setCategories(prev => prev.map(c => c._id === categoryId ? res.data : c));
        cancelEditing();
      } else {
        setError(res?.message || 'Failed to rename category');
      }
    } catch (err) {
      setError(err?.message || 'Failed to rename category');
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleActive = async (category) => {
    try {
      setSavingId(category._id);
      const res = category.isActive
        ? await deactivateCategory(category._id)
        : await updateCategory(category._id, { isActive: true });

      if (res?.success) {
        setCategories(prev => prev.map(c => c._id === category._id ? res.data : c));
      } else {
        setError(res?.message || 'Failed to update category');
      }
    } catch (err) {
      setError(err?.message || 'Failed to update category');
    } finally {
      setSavingId(null);
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Tag className="w-8 h-8 mr-3 text-afri-green" />
            Category Management
          </h1>
          <p className="text-gray-600">Add, rename, or deactivate product categories</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Add Category */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <form onSubmit={handleAddCategory} className="flex gap-3">
            <input
              type="text"
              placeholder="New category name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent"
            />
            <button
              type="submit"
              disabled={addingCategory || !newCategoryName.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-afri-green text-white rounded-lg font-semibold hover:bg-afri-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Plus className="w-4 h-4" />
              {addingCategory ? 'Adding...' : 'Add Category'}
            </button>
          </form>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-afri-green mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No categories found</h3>
            <p className="text-gray-500">Add your first category above</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <AnimatePresence>
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50"
                >
                  {editingId === category._id ? (
                    <div className="flex items-center gap-2 flex-1 mr-3">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                        className="flex-1 px-3 py-1.5 border border-afri-green rounded-lg focus:ring-2 focus:ring-afri-green"
                      />
                      <button
                        onClick={() => handleRename(category._id)}
                        disabled={savingId === category._id}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">{category.name}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  )}

                  {editingId !== category._id && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing(category)}
                        className="p-2 text-gray-500 hover:text-afri-green hover:bg-afri-green-pale rounded-lg transition"
                        title="Rename"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(category)}
                        disabled={savingId === category._id}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title={category.isActive ? 'Deactivate' : 'Reactivate'}
                      >
                        {category.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCategoryManagement;
