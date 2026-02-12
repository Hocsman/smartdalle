import { categorizeIngredient, getCategoryInfo, CATEGORIES } from '@/utils/categories';

describe('categorizeIngredient', () => {
  it('categorizes meat correctly', () => {
    expect(categorizeIngredient('poulet')).toBe('Viandes & Poissons');
    expect(categorizeIngredient('Saumon frais')).toBe('Viandes & Poissons');
    expect(categorizeIngredient('steak de boeuf')).toBe('Viandes & Poissons');
  });

  it('categorizes vegetables correctly', () => {
    expect(categorizeIngredient('tomate')).toBe('Fruits & Légumes');
    expect(categorizeIngredient('Oignon rouge')).toBe('Fruits & Légumes');
    expect(categorizeIngredient('Avocat mûr')).toBe('Fruits & Légumes');
  });

  it('categorizes starches correctly', () => {
    expect(categorizeIngredient('riz basmati')).toBe('Féculents & Céréales');
    expect(categorizeIngredient('Pâtes complètes')).toBe('Féculents & Céréales');
    expect(categorizeIngredient('semoule fine')).toBe('Féculents & Céréales');
  });

  it('categorizes dairy correctly', () => {
    expect(categorizeIngredient('lait entier')).toBe('Produits Laitiers');
    expect(categorizeIngredient('Fromage râpé')).toBe('Produits Laitiers');
    expect(categorizeIngredient('yaourt nature')).toBe('Produits Laitiers');
  });

  it('categorizes spices correctly', () => {
    expect(categorizeIngredient('cumin')).toBe('Épices & Condiments');
    expect(categorizeIngredient('Paprika fumé')).toBe('Épices & Condiments');
    expect(categorizeIngredient('harissa')).toBe('Épices & Condiments');
  });

  it('categorizes legumes correctly', () => {
    // Note: "pois chiche" matches Légumineuses, "fève" too
    expect(categorizeIngredient('pois chiche')).toBe('Légumineuses');
    expect(categorizeIngredient('fève sèche')).toBe('Légumineuses');
  });

  it('returns "Autres" for unknown ingredients', () => {
    expect(categorizeIngredient('xyz123')).toBe('Autres');
    expect(categorizeIngredient('')).toBe('Autres');
    expect(categorizeIngredient('ingrédient inconnu')).toBe('Autres');
  });

  it('is case insensitive', () => {
    expect(categorizeIngredient('POULET')).toBe('Viandes & Poissons');
    expect(categorizeIngredient('Tomate')).toBe('Fruits & Légumes');
    expect(categorizeIngredient('RIZ')).toBe('Féculents & Céréales');
  });
});

describe('getCategoryInfo', () => {
  it('returns correct emoji for meat category', () => {
    const info = getCategoryInfo('poulet');
    expect(info.name).toBe('Viandes & Poissons');
    expect(info.emoji).toBe('🥩');
  });

  it('returns correct emoji for vegetables', () => {
    const info = getCategoryInfo('tomate');
    expect(info.name).toBe('Fruits & Légumes');
    expect(info.emoji).toBe('🥬');
  });

  it('returns correct emoji for starches', () => {
    const info = getCategoryInfo('riz');
    expect(info.name).toBe('Féculents & Céréales');
    expect(info.emoji).toBe('🍚');
  });

  it('returns default for unknown', () => {
    const info = getCategoryInfo('unknown');
    expect(info.name).toBe('Autres');
    expect(info.emoji).toBe('📦');
  });
});

describe('CATEGORIES', () => {
  it('has all expected categories', () => {
    const categoryNames = CATEGORIES.map(c => c.name);
    expect(categoryNames).toContain('Viandes & Poissons');
    expect(categoryNames).toContain('Fruits & Légumes');
    expect(categoryNames).toContain('Féculents & Céréales');
    expect(categoryNames).toContain('Produits Laitiers');
    expect(categoryNames).toContain('Épices & Condiments');
    expect(categoryNames).toContain('Légumineuses');
    expect(categoryNames).toContain('Autres');
  });

  it('each category has emoji', () => {
    CATEGORIES.forEach(cat => {
      expect(cat.emoji).toBeDefined();
      expect(cat.emoji.length).toBeGreaterThan(0);
    });
  });
});
