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

  // 1. Distance Calculation (max 20 pts) - 6 pts penalty per km
  const distanceScore = Math.max(0, 20 - distanceKm * 6.0);
  score += distanceScore;

  // 2. Attribute Matching (max 25 pts)
  const itemTypeNorm = item.item_type.toLowerCase();
  const needTypeNorm = need.item_type.toLowerCase();
  
  if (itemTypeNorm === needTypeNorm) {
    score += 25;
    reasonParts.push(`${item.item_type} match`);
  } else if (itemTypeNorm.includes(needTypeNorm) || needTypeNorm.includes(itemTypeNorm)) {
    score += 15;
    reasonParts.push(`${item.item_type} similar fit`);
  } else {
    score += 5;
  }

  // Size Match (max 15 pts)
  if (item.size.toLowerCase() === need.size.toLowerCase()) {
    score += 15;
    reasonParts.push(`Size ${item.size}`);
  } else if (need.size === 'Any') {
    score += 10;
    reasonParts.push(`Flexible size`);
  } else {
    score += 3;
  }

  // Gender Match (max 12 pts)
  if (item.gender.toLowerCase() === need.gender.toLowerCase()) {
    score += 12;
    reasonParts.push(`${need.gender} category`);
  } else if (need.gender === 'Unisex' || item.gender === 'Unisex') {
    score += 8;
    reasonParts.push(`Unisex category`);
  } else {
    score += 2;
  }

  // Season Match (max 8 pts)
  if (item.season === need.season) {
    score += 8;
  } else if (need.season === 'All-Season') {
    score += 5;
  } else {
    score += 2;
  }

  // 3. Demand Urgency (max 20 pts)
  if (need.urgency === 'High') {
    score += 20;
    reasonParts.push('Urgent shelter need');
  } else if (need.urgency === 'Medium') {
    score += 10;
    reasonParts.push('Medium priority');
  } else {
    score += 4;
  }

  // 4. Storage Capacity & Batch Quantity Fit Check
  const batchQuantity = Math.max(1, parseInt(item.quantity, 10) || 1);
  const remainingCapacity = Math.max(0, (ngo.max_capacity || 0) - (ngo.current_storage || 0));
  const capacityRatio = ngo.max_capacity > 0 ? (ngo.current_storage / ngo.max_capacity) : 0;

  if (remainingCapacity < batchQuantity) {
    // Heavy penalty if recipient cannot physically store the requested batch quantity
    const deficit = batchQuantity - remainingCapacity;
    score -= Math.min(80, 40 + Math.ceil(deficit / 2));
    reasonParts.push(`Insufficient capacity for ${batchQuantity} items (has ${remainingCapacity} free)`);
  } else if (capacityRatio >= 0.95) {
    score -= 35;
    reasonParts.push('Storage critical (95% full)');
  } else if (capacityRatio >= 0.8) {
    score -= 15;
    reasonParts.push('Storage high (80% full)');
  } else {
    reasonParts.push(`Storage available (${remainingCapacity} slots free)`);
  }

  // 5. Need fulfilled check
  const remainingNeeded = need.quantity_needed - (need.quantity_fulfilled || 0);
  if (remainingNeeded <= 0) {
    score -= 100;
  }

  const finalScore = Math.min(98, Math.max(10, Math.round(score)));
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
    SELECT n.*, g.name as ngo_name, g.type as ngo_type, g.address as ngo_address, g.latitude as ngo_lat, 
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
      type: need.ngo_type || 'ngo',
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
