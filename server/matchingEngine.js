// Haversine distance formula in kilometers
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function scoreMatch(item, ngo, need) {
  let score = 0;
  const reasonParts = [];

  // 1. Distance Calculation
  const distanceKm = calculateHaversineDistance(
    item.latitude,
    item.longitude,
    ngo.latitude,
    ngo.longitude
  );

  reasonParts.push(`${distanceKm}km away`);

  // Distance Score (max 25 pts)
  const distanceScore = Math.max(0, 25 - distanceKm * 2.5);
  score += distanceScore;

  // 2. Attribute Matching
  const itemTypeNorm = item.item_type.toLowerCase();
  const needTypeNorm = need.item_type.toLowerCase();
  
  if (itemTypeNorm === needTypeNorm || itemTypeNorm.includes(needTypeNorm) || needTypeNorm.includes(itemTypeNorm)) {
    score += 30;
    reasonParts.push(`${item.item_type} match`);
  } else {
    score += 10;
  }

  // Size Match
  if (item.size.toLowerCase() === need.size.toLowerCase() || need.size === 'Any') {
    score += 20;
    reasonParts.push(`Size ${item.size}`);
  } else {
    score += 5;
  }

  // Gender Match
  if (item.gender.toLowerCase() === need.gender.toLowerCase() || need.gender === 'Unisex' || item.gender === 'Unisex') {
    score += 15;
    reasonParts.push(`${need.gender} category`);
  }

  // Season Match
  if (item.season === need.season || need.season === 'All-Season') {
    score += 10;
  }

  // 3. Demand Urgency
  if (need.urgency === 'High') {
    score += 30;
    reasonParts.push('Urgent shelter need');
  } else if (need.urgency === 'Medium') {
    score += 15;
    reasonParts.push('Medium priority');
  } else {
    score += 5;
  }

  // 4. Storage Capacity Penalty
  const capacityRatio = ngo.max_capacity > 0 ? (ngo.current_storage / ngo.max_capacity) : 0;
  if (capacityRatio >= 0.95) {
    score -= 45;
    reasonParts.push('Storage critical (95% full)');
  } else if (capacityRatio >= 0.8) {
    score -= 20;
    reasonParts.push('Storage high (80% full)');
  } else {
    reasonParts.push('Storage available');
  }

  // 5. Need fulfilled check
  const remainingNeeded = need.quantity_needed - (need.quantity_fulfilled || 0);
  if (remainingNeeded <= 0) {
    score -= 100;
  }

  const finalScore = Math.min(99, Math.max(10, Math.round(score)));
  const reasoning = reasonParts.slice(0, 4).join(' • ');

  return {
    score: finalScore,
    distanceKm,
    reasoning,
    ngo,
    need
  };
}

export function findTopMatches(db, item) {
  if (item.condition === 'Needs Repair') {
    return {
      isRecycling: true,
      reason: 'Item requires repair/upcycling before distribution'
    };
  }

  const needs = db.prepare(`
    SELECT n.*, g.name as ngo_name, g.address as ngo_address, g.latitude as ngo_lat, 
           g.longitude as ngo_lng, g.max_capacity, g.current_storage, g.image_url as ngo_image, g.phone, g.contact_email
    FROM ngo_needs n
    JOIN ngos g ON n.ngo_id = g.id
    WHERE n.status = 'active' AND (n.quantity_needed - n.quantity_fulfilled) > 0
  `).all();

  const matchCandidates = [];

  for (const need of needs) {
    const ngoObj = {
      id: need.ngo_id,
      name: need.ngo_name,
      address: need.ngo_address,
      latitude: need.ngo_lat,
      longitude: need.ngo_lng,
      max_capacity: need.max_capacity,
      current_storage: need.current_storage,
      image_url: need.ngo_image,
      phone: need.phone,
      contact_email: need.contact_email
    };

    const result = scoreMatch(item, ngoObj, need);
    matchCandidates.push(result);
  }

  const bestPerNgo = new Map();
  for (const candidate of matchCandidates) {
    const existing = bestPerNgo.get(candidate.ngo.id);
    if (!existing || candidate.score > existing.score) {
      bestPerNgo.set(candidate.ngo.id, candidate);
    }
  }

  const ranked = Array.from(bestPerNgo.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return {
    isRecycling: false,
    matches: ranked
  };
}
