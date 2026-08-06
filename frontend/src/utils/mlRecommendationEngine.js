import clothingCatalog from '../data/clothing-catalog.json';
import footwearCatalog from '../data/footwear-catalog.json';

const ALL_PRODUCTS = [...clothingCatalog, ...footwearCatalog];

/**
 * Get initial default recommendations:
 * 50% highest-rated clothes + 50% highest-rated footwear (interleaved)
 */
export function getInitialTopRatedSuggestions(limit = 20) {
  const halfLimit = Math.floor(limit / 2);

  const topClothes = [...clothingCatalog]
    .sort((a, b) => {
      const rDiff = parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
      if (Math.abs(rDiff) > 0.01) return rDiff;
      return (b.rating_count || 0) - (a.rating_count || 0);
    })
    .slice(0, halfLimit);

  const topFootwear = [...footwearCatalog]
    .sort((a, b) => {
      const rDiff = parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
      if (Math.abs(rDiff) > 0.01) return rDiff;
      return (b.rating_count || 0) - (a.rating_count || 0);
    })
    .slice(0, halfLimit);

  const interleaved = [];
  for (let i = 0; i < halfLimit; i++) {
    if (topClothes[i]) interleaved.push(topClothes[i]);
    if (topFootwear[i]) interleaved.push(topFootwear[i]);
  }
  return interleaved;
}

/**
 * Compute Machine Learning Recommendation Scores based on User Experience:
 * Evaluates candidate products against user click & purchase history.
 */
export function getPersonalizedMLSuggestions(userExperience, limit = 20) {
  const { clickedProducts = [], boughtProducts = [], clickedCategories = {}, clickedColors = {} } = userExperience;

  const totalInteractions = clickedProducts.length + boughtProducts.length * 3;
  if (totalInteractions === 0) {
    return getInitialTopRatedSuggestions(limit);
  }

  // Calculate average target price
  const interactedItems = [...clickedProducts, ...boughtProducts];
  const avgPrice = interactedItems.length > 0
    ? interactedItems.reduce((acc, p) => acc + (p.discounted_price || p.price || 1000), 0) / interactedItems.length
    : 1500;

  const interactedIds = new Set(interactedItems.map(p => String(p.id || p._id)));

  // Score candidate products
  const scored = ALL_PRODUCTS.map(product => {
    const pidStr = String(product.id || product._id);
    // Slight penalty if already interacted to encourage diversity
    const interactionPenalty = interactedIds.has(pidStr) ? 0.3 : 1.0;

    // Category match score
    const catWeight = clickedCategories[product.category] || 0;
    const catScore = Math.min(catWeight / 5, 2.5);

    // Color match score
    const colorWeight = clickedColors[product.color] || 0;
    const colorScore = Math.min(colorWeight / 3, 1.5);

    // Price similarity score (Gaussian decay based on price difference)
    const pPrice = product.discounted_price || product.price || 1000;
    const priceDiffRatio = Math.abs(pPrice - avgPrice) / Math.max(avgPrice, 1);
    const priceScore = Math.exp(-priceDiffRatio * 1.5);

    // Base rating score
    const ratingVal = parseFloat(product.rating || product.ratings || 4.0);
    const ratingScore = ratingVal / 5.0;

    // Total recommendation score formula
    const mlScore = (
      (catScore * 3.5) +
      (colorScore * 2.0) +
      (priceScore * 1.5) +
      (ratingScore * 1.0)
    ) * interactionPenalty;

    return { product, mlScore };
  });

  scored.sort((a, b) => b.mlScore - a.mlScore);

  // Interleave to maintain half clothes and half footwear when possible
  const clothesRecs = scored.filter(s => s.product.type === 'clothes').map(s => s.product);
  const footwearRecs = scored.filter(s => s.product.type === 'footwear').map(s => s.product);

  const result = [];
  let ci = 0, fi = 0;

  while (result.length < limit && (ci < clothesRecs.length || fi < footwearRecs.length)) {
    if (ci < clothesRecs.length && (result.length % 2 === 0 || fi >= footwearRecs.length)) {
      result.push(clothesRecs[ci++]);
    } else if (fi < footwearRecs.length) {
      result.push(footwearRecs[fi++]);
    }
  }

  return result;
}
