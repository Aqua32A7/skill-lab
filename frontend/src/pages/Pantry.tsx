import React, { useState } from 'react';
import {
  Refrigerator,
  Plus,
  Trash2,
  Edit2,
  Search,
  Sparkles,
  UtensilsCrossed,
  Check,
  X,
  Layers
} from 'lucide-react';
import { PantryItem } from '../types/recipe';

interface PantryProps {
  pantryItems: PantryItem[];
  onAddItem: (item: { name: string; quantity?: string; unit?: string; category?: string }) => Promise<void>;
  onUpdateItem: (id: number, data: { name?: string; quantity?: string; unit?: string; category?: string }) => Promise<void>;
  onDeleteItem: (id: number) => Promise<void>;
  onCookWithPantry: () => void;
}

const CATEGORIES = [
  'All',
  'Produce',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Grains & Pasta',
  'Spices & Pantry',
  'General',
];

export const Pantry: React.FC<PantryProps> = ({
  pantryItems,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onCookWithPantry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Produce');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit item state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('');

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddItem({
        name: newItemName.trim(),
        quantity: newItemQuantity.trim() || undefined,
        unit: newItemUnit.trim() || undefined,
        category: newItemCategory,
      });
      setNewItemName('');
      setNewItemQuantity('');
      setNewItemUnit('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (item: PantryItem) => {
    setEditingId(item.id);
    setEditQuantity(item.quantity || '');
    setEditUnit(item.unit || '');
  };

  const saveEdit = async (item: PantryItem) => {
    await onUpdateItem(item.id, {
      quantity: editQuantity.trim() || undefined,
      unit: editUnit.trim() || undefined,
    });
    setEditingId(null);
  };

  // Filter items
  const filteredItems = pantryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === 'All' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-24">
      {/* Header and Hero Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Refrigerator className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
              My Kitchen Pantry
            </h1>
            <p className="text-xs sm:text-sm text-stone-500">
              Manage items you currently have in stock. Stored in SQLite database.
            </p>
          </div>
        </div>

        {/* Cook With My Pantry Hero Button */}
        <button
          onClick={onCookWithPantry}
          disabled={pantryItems.length === 0}
          className="px-6 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-orange-600/25 flex items-center justify-center space-x-2 disabled:opacity-40 transition-all flex-shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Cook With My Pantry ({pantryItems.length} items)</span>
        </button>
      </div>

      {/* Add New Item Form */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider flex items-center space-x-2">
          <Plus className="w-4 h-4 text-orange-600" />
          <span>Add New Ingredient to Pantry</span>
        </h3>

        <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Name */}
          <div className="sm:col-span-4">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Ingredient name (e.g. Eggs, Rice)"
              required
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Quantity */}
          <div className="sm:col-span-2">
            <input
              type="text"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              placeholder="Qty (e.g. 2, 500)"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Unit */}
          <div className="sm:col-span-2">
            <input
              type="text"
              value={newItemUnit}
              onChange={(e) => setNewItemUnit(e.target.value)}
              placeholder="Unit (g, cups, pcs)"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Category */}
          <div className="sm:col-span-2">
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting || !newItemName.trim()}
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-sm transition-colors flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        </form>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pantry..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-2xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pantry List Table / Cards */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-stone-500 space-y-3">
            <Refrigerator className="w-12 h-12 text-stone-300 mx-auto" />
            <p className="font-semibold text-stone-700 text-sm">
              {pantryItems.length === 0 ? 'Your pantry is empty.' : 'No items match your filter.'}
            </p>
            <p className="text-xs text-stone-400">
              Add staple items like chicken, pasta, onions, and eggs to unlock instant recipes!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredItems.map((item) => {
              const isEditing = editingId === item.id;
              return (
                <div
                  key={item.id}
                  className="p-4 sm:px-6 flex items-center justify-between hover:bg-stone-50/80 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <div>
                      <div className="text-sm font-bold text-stone-900">{item.name}</div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center space-x-3">
                    {isEditing ? (
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="text"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          placeholder="Qty"
                          className="w-16 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          value={editUnit}
                          onChange={(e) => setEditUnit(e.target.value)}
                          placeholder="Unit"
                          className="w-16 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs"
                        />
                        <button
                          onClick={() => saveEdit(item)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 text-stone-400 hover:bg-stone-100 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-4">
                        <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-xl">
                          {item.quantity ? `${item.quantity} ${item.unit || ''}`.trim() : 'In stock'}
                        </span>
                        <button
                          onClick={() => startEdit(item)}
                          title="Edit Quantity"
                          className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          title="Remove Item"
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
