export const ITEM_CATEGORIES = [
  {
    category: 'Tops',
    items: ['T-Shirt', 'Shirt', 'Blouse', 'Hoodie', 'Sweater', 'Sweatshirt']
  },
  {
    category: 'Outerwear',
    items: ['Jacket', 'Coat', 'Suit Jacket', 'Blazer']
  },
  {
    category: 'Bottoms',
    items: ['Jeans', 'Pants', 'Shorts', 'Skirt', 'Leggings']
  },
  {
    category: 'Full Body',
    items: ['Dress', 'Saree', 'Salwar Suit', 'Jumpsuit']
  },
  {
    category: 'Kids',
    items: ['Kids Coat', 'Kids Shoes', 'Kids T-Shirt', 'Kids Dress', 'School Uniform']
  },
  {
    category: 'Footwear',
    items: ['Shoes', 'Boots', 'Sandals']
  },
  {
    category: 'Other',
    items: ['Blanket', 'Scarf', 'Undergarments (Unused Only)', 'Accessories']
  }
];

// Flat list of all item types
export const ALL_ITEM_TYPES = ITEM_CATEGORIES.flatMap(cat => cat.items);
