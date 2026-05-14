/**
 * Test data factories.
 *
 * Each factory only sets the fields the unit-under-test actually reads, so it's
 * obvious from the call site what the test depends on. Anything missing falls
 * back to model defaults.
 */
import ProductModel from '../../src/models/productModel.js';
import VarietyModel from '../../src/models/varietyModel.js';

export async function createVariety(overrides = {}) {
  return VarietyModel.create({
    name: `Variety ${Date.now()}-${Math.random()}`,
    image: 'test.jpg',
    description: 'test',
    category: `cat-${Date.now()}-${Math.random()}`,
    ...overrides,
  });
}

export async function createProduct(overrides = {}) {
  const variety = overrides.variety || (await createVariety())._id;
  return ProductModel.create({
    name: `Product ${Date.now()}-${Math.random()}`,
    image: 'p.jpg',
    price: 10,
    originalPrice: 12,
    description: 'desc',
    category: 'Original',
    productType: 'yak-milk',
    variety,
    trackStock: false,
    stockQuantity: 100,
    ...overrides,
  });
}
