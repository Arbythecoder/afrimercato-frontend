import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Mock recipe data - would come from API
const mockRecipes = [
  {
    id: 1,
    name: 'Jollof Rice',
    description: 'Classic West African rice dish cooked in a rich tomato sauce with spices',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400',
    cuisine: 'Nigerian',
    prepTime: '15 min',
    cookTime: '45 min',
    servings: 6,
    difficulty: 'Medium',
    rating: 4.8,
    reviewCount: 234,
    calories: 350,
    tags: ['Rice', 'One-Pot', 'Party'],
    ingredients: [
      { name: 'Long grain rice', quantity: '2 cups', available: true, price: 2.50 },
      { name: 'Tomato paste', quantity: '3 tbsp', available: true, price: 1.20 },
      { name: 'Fresh tomatoes', quantity: '4 large', available: true, price: 1.80 },
      { name: 'Onions', quantity: '2 medium', available: true, price: 0.80 },
      { name: 'Scotch bonnet', quantity: '2', available: true, price: 0.50 },
      { name: 'Chicken stock', quantity: '3 cups', available: true, price: 1.50 }
    ]
  },
  {
    id: 2,
    name: 'Egusi Soup',
    description: 'Traditional Nigerian soup made with ground melon seeds and leafy greens',
    image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400',
    cuisine: 'Nigerian',
    prepTime: '20 min',
    cookTime: '40 min',
    servings: 4,
    difficulty: 'Medium',
    rating: 4.7,
    reviewCount: 189,
    calories: 420,
    tags: ['Soup', 'Protein-Rich', 'Traditional'],
    ingredients: [
      { name: 'Egusi (melon seeds)', quantity: '2 cups', available: true, price: 4.50 },
      { name: 'Spinach or Ugu', quantity: '500g', available: true, price: 2.50 },
      { name: 'Palm oil', quantity: '1/2 cup', available: true, price: 3.00 },
      { name: 'Stockfish', quantity: '200g', available: false, price: 5.00 },
      { name: 'Crayfish', quantity: '2 tbsp', available: true, price: 2.00 }
    ]
  },
  {
    id: 3,
    name: 'Suya Skewers',
    description: 'Spicy grilled beef skewers with traditional suya spice blend',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    cuisine: 'Nigerian',
    prepTime: '30 min',
    cookTime: '15 min',
    servings: 4,
    difficulty: 'Easy',
    rating: 4.9,
    reviewCount: 312,
    calories: 280,
    tags: ['Grill', 'Protein', 'Quick'],
    ingredients: [
      { name: 'Beef sirloin', quantity: '500g', available: true, price: 8.00 },
      { name: 'Suya spice', quantity: '4 tbsp', available: true, price: 2.50 },
      { name: 'Groundnut oil', quantity: '3 tbsp', available: true, price: 1.50 },
      { name: 'Onions', quantity: '2 medium', available: true, price: 0.80 }
    ]
  },
  {
    id: 4,
    name: 'Injera with Doro Wat',
    description: 'Ethiopian sourdough flatbread served with spicy chicken stew',
    image: 'https://images.unsplash.com/photo-1567364816519-cbc9c4ffe1eb?w=400',
    cuisine: 'Ethiopian',
    prepTime: '24 hours',
    cookTime: '2 hours',
    servings: 6,
    difficulty: 'Hard',
    rating: 4.6,
    reviewCount: 145,
    calories: 480,
    tags: ['Traditional', 'Fermented', 'Special Occasion'],
    ingredients: [
      { name: 'Teff flour', quantity: '3 cups', available: true, price: 6.00 },
      { name: 'Chicken pieces', quantity: '1 kg', available: true, price: 7.50 },
      { name: 'Berbere spice', quantity: '4 tbsp', available: true, price: 3.50 },
      { name: 'Niter kibbeh', quantity: '1/4 cup', available: false, price: 4.00 }
    ]
  },
  {
    id: 5,
    name: 'Puff Puff',
    description: 'Sweet Nigerian fried dough balls - perfect snack or dessert',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
    cuisine: 'Nigerian',
    prepTime: '1 hour',
    cookTime: '20 min',
    servings: 20,
    difficulty: 'Easy',
    rating: 4.8,
    reviewCount: 278,
    calories: 120,
    tags: ['Snack', 'Sweet', 'Party'],
    ingredients: [
      { name: 'All-purpose flour', quantity: '3 cups', available: true, price: 1.50 },
      { name: 'Sugar', quantity: '1/2 cup', available: true, price: 0.80 },
      { name: 'Yeast', quantity: '1 packet', available: true, price: 0.50 },
      { name: 'Vegetable oil', quantity: 'For frying', available: true, price: 2.00 }
    ]
  },
  {
    id: 6,
    name: 'Moroccan Tagine',
    description: 'Slow-cooked lamb with apricots, almonds and aromatic spices',
    image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=400',
    cuisine: 'Moroccan',
    prepTime: '20 min',
    cookTime: '2 hours',
    servings: 4,
    difficulty: 'Medium',
    rating: 4.7,
    reviewCount: 167,
    calories: 520,
    tags: ['Slow-Cook', 'Lamb', 'Aromatic'],
    ingredients: [
      { name: 'Lamb shoulder', quantity: '800g', available: true, price: 12.00 },
      { name: 'Dried apricots', quantity: '1 cup', available: true, price: 3.50 },
      { name: 'Ras el hanout', quantity: '2 tbsp', available: true, price: 2.50 },
      { name: 'Almonds', quantity: '1/2 cup', available: true, price: 2.00 }
    ]
  }
]

const cuisines = ['All', 'Nigerian', 'Ethiopian', 'Moroccan', 'Ghanaian', 'South African']
const difficulties = ['All', 'Easy', 'Medium', 'Hard']
const mealTypes = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']

function RecipeRecommendations() {
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [filters, setFilters] = useState({
    cuisine: 'All',
    difficulty: 'All',
    mealType: 'All',
    search: ''
  })
  const [mealPlan, setMealPlan] = useState([])

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRecipes(mockRecipes)
      setLoading(false)
    }, 500)
  }, [])

  const filteredRecipes = recipes.filter(recipe => {
    if (filters.cuisine !== 'All' && recipe.cuisine !== filters.cuisine) return false
    if (filters.difficulty !== 'All' && recipe.difficulty !== filters.difficulty) return false
    if (filters.search && !recipe.name.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const addToMealPlan = (recipe) => {
    if (!mealPlan.find(r => r.id === recipe.id)) {
      setMealPlan([...mealPlan, recipe])
    }
  }

  const removeFromMealPlan = (recipeId) => {
    setMealPlan(mealPlan.filter(r => r.id !== recipeId))
  }

  const addAllIngredientsToCart = (recipe) => {
    const cart = JSON.parse(localStorage.getItem('afrimercato_cart') || '[]')

    recipe.ingredients.forEach(ing => {
      if (ing.available) {
        const existingIndex = cart.findIndex(item => item.name === ing.name)
        if (existingIndex < 0) {
          cart.push({
            _id: `ing-${Date.now()}-${Math.random()}`,
            name: ing.name,
            price: ing.price,
            quantity: 1,
            unit: ing.quantity
          })
        }
      }
    })

    localStorage.setItem('afrimercato_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
    alert('Available ingredients added to cart!')
  }

  const getTotalIngredientsCost = (recipe) => {
    return recipe.ingredients
      .filter(i => i.available)
      .reduce((sum, i) => sum + i.price, 0)
      .toFixed(2)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-afri-green to-afri-green-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-2">African Recipe Collection</h1>
          <p className="text-afri-green-light text-lg">Discover authentic dishes and plan your meals</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search & Filters */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-afri-green"
                  />
                </div>
                <select
                  value={filters.cuisine}
                  onChange={(e) => setFilters({ ...filters, cuisine: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-afri-green"
                >
                  {cuisines.map(c => <option key={c} value={c}>{c} Cuisine</option>)}
                </select>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-afri-green"
                >
                  {difficulties.map(d => <option key={d} value={d}>{d === 'All' ? 'Any Difficulty' : d}</option>)}
                </select>
              </div>
            </div>

            {/* Recipe Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                    <div className="bg-gray-200 h-5 rounded w-2/3 mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map(recipe => (
                  <div
                    key={recipe.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <div className="relative">
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {recipe.difficulty}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="bg-white/90 px-2 py-1 rounded-full text-xs font-semibold">
                          {recipe.cuisine}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{recipe.name}</h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{recipe.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>⏱️ {recipe.prepTime} + {recipe.cookTime}</span>
                        <span>👥 {recipe.servings}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span className="font-semibold">{recipe.rating}</span>
                          <span className="text-gray-400 text-sm">({recipe.reviewCount})</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); addToMealPlan(recipe) }}
                          className="text-afri-green hover:text-afri-green-dark font-semibold text-sm"
                        >
                          + Add to Plan
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meal Plan Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                My Meal Plan ({mealPlan.length})
              </h2>

              {mealPlan.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl">📝</span>
                  <p className="text-gray-500 mt-2">Add recipes to your meal plan</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mealPlan.map(recipe => (
                    <div key={recipe.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{recipe.name}</p>
                        <p className="text-xs text-gray-500">{recipe.servings} servings</p>
                      </div>
                      <button
                        onClick={() => removeFromMealPlan(recipe.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <div className="pt-4 border-t space-y-2">
                    <button
                      onClick={() => {
                        mealPlan.forEach(recipe => addAllIngredientsToCart(recipe))
                      }}
                      className="w-full py-3 bg-afri-green text-white rounded-lg font-semibold hover:bg-afri-green-dark"
                    >
                      🛒 Shop All Ingredients
                    </button>
                    <button
                      onClick={() => setMealPlan([])}
                      className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Clear Plan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.name}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedRecipe.name}</h2>
                  <p className="text-gray-500">{selectedRecipe.cuisine} Cuisine</p>
                </div>
                <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
                  <span className="text-yellow-500">★</span>
                  <span className="font-semibold">{selectedRecipe.rating}</span>
                </div>
              </div>

              <p className="text-gray-600 mb-6">{selectedRecipe.description}</p>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl">⏱️</p>
                  <p className="text-sm font-semibold">{selectedRecipe.prepTime}</p>
                  <p className="text-xs text-gray-500">Prep</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl">🍳</p>
                  <p className="text-sm font-semibold">{selectedRecipe.cookTime}</p>
                  <p className="text-xs text-gray-500">Cook</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl">👥</p>
                  <p className="text-sm font-semibold">{selectedRecipe.servings}</p>
                  <p className="text-xs text-gray-500">Servings</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl">🔥</p>
                  <p className="text-sm font-semibold">{selectedRecipe.calories}</p>
                  <p className="text-xs text-gray-500">Calories</p>
                </div>
              </div>

              {/* Ingredients */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold">Ingredients</h3>
                  <span className="text-afri-green font-semibold">
                    Est. £{getTotalIngredientsCost(selectedRecipe)}
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${
                      ing.available ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span>{ing.available ? '✓' : '✗'}</span>
                        <div>
                          <p className="font-medium">{ing.name}</p>
                          <p className="text-sm text-gray-500">{ing.quantity}</p>
                        </div>
                      </div>
                      <span className="font-semibold">£{ing.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => addAllIngredientsToCart(selectedRecipe)}
                  className="flex-1 py-3 bg-afri-green text-white rounded-xl font-semibold hover:bg-afri-green-dark"
                >
                  🛒 Add Ingredients to Cart
                </button>
                <button
                  onClick={() => { addToMealPlan(selectedRecipe); setSelectedRecipe(null) }}
                  className="px-6 py-3 border-2 border-afri-green text-afri-green rounded-xl font-semibold hover:bg-afri-green hover:text-white"
                >
                  📝 Add to Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecipeRecommendations
