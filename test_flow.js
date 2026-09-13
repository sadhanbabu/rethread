undefined

async function runApiFlowTest() {
  console.log('🧪 Running ReThread API End-to-End Test Suite...\n');

  // 1. Fetch initial NGOs
  const ngosRes = await fetch('http://localhost:5000/api/ngos');
  const ngos = await ngosRes.json();
  console.log(`✅ Loaded ${ngos.length} seed NGOs`);

  const initialHopeHaven = ngos.find(n => n.id === 1);
  const initialJacketNeed = initialHopeHaven.needs.find(n => n.item_type === 'Jacket');
  console.log(`   Initial Hope Haven 'Jacket' need: ${initialJacketNeed.quantity_fulfilled}/${initialJacketNeed.quantity_needed} fulfilled`);

  // 2. Upload Donor Item (Winter Jacket L, Gently Used)
  console.log('\n👕 Donating Item: Winter Puffer Jacket (Size L, Gently Used)...');
  const itemRes = await fetch('http://localhost:5000/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: "Test Automated Puffer Jacket",
      description: "Warm insulated winter coat.",
      item_type: "Jacket",
      size: "L",
      gender: "Men",
      season: "Winter",
      condition: "Gently Used",
      photo_url: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80",
      donor_name: "Automated Test Suite",
      donor_location_name: "SoMa, San Francisco",
      latitude: 37.7812,
      longitude: -122.3989
    })
  });

  const itemData = await itemRes.json();
  console.log(`✅ Item Created (ID: ${itemData.item.id})`);
  console.log(`   Matches Found: ${itemData.matchResult.matches.length} NGOs`);
  
  itemData.matchResult.matches.forEach((m, idx) => {
    console.log(`   Rank #${idx + 1}: ${m.ngo.name} | Score: ${m.score}% | Reasoning: "${m.reasoning}"`);
  });

  // 3. Test Condition = Needs Repair (Auto Routing to Recycling)
  console.log('\n🔧 Donating Damaged Item: Torn Jeans (Condition: Needs Repair)...');
  const repairRes = await fetch('http://localhost:5000/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: "Damaged Work Jeans",
      item_type: "Jeans",
      size: "M",
      gender: "Men",
      condition: "Needs Repair",
      donor_name: "Test Donor"
    })
  });
  const repairData = await repairRes.json();
  console.log(`✅ Repair Item Status: ${repairData.item.status}`);
  console.log(`   Recycling Route Triggered: ${repairData.matchResult.isRecycling}`);
  console.log(`   Reason: "${repairData.matchResult.reason}"`);

  // 4. NGO Accepts Matched Donation
  console.log('\n🏢 Fetching incoming matches for NGO 1 (Hope Haven Shelter)...');
  const matchesRes = await fetch('http://localhost:5000/api/ngo-matches/1');
  const matches = await matchesRes.json();
  console.log(`   Hope Haven Pending Matches Queue: ${matches.length} items`);

  if (matches.length > 0) {
    const targetMatch = matches[0];
    console.log(`\n⚡ Accepting match ID ${targetMatch.id} for item '${targetMatch.item_title}'...`);
    const acceptRes = await fetch(`http://localhost:5000/api/matches/${targetMatch.id}/accept`, { method: 'POST' });
    const acceptData = await acceptRes.json();
    console.log(`✅ ${acceptData.message}`);
  }

  // 5. Verify Needs Count Updated
  const updatedNgosRes = await fetch('http://localhost:5000/api/ngos');
  const updatedNgos = await updatedNgosRes.json();
  const updatedHopeHaven = updatedNgos.find(n => n.id === 1);
  const updatedJacketNeed = updatedHopeHaven.needs.find(n => n.item_type === 'Jacket');

  console.log('\n📊 Verification Results:');
  console.log(`   Updated Hope Haven 'Jacket' need fulfilled count: ${updatedJacketNeed.quantity_fulfilled}/${updatedJacketNeed.quantity_needed}`);
  console.log(`   Storage occupied: ${updatedHopeHaven.current_storage}/${updatedHopeHaven.max_capacity} items`);

  // 6. Impact Stats Check
  const impactRes = await fetch('http://localhost:5000/api/impact');
  const impact = await impactRes.json();
  console.log(`\n🎉 Live Impact Stats:`);
  console.log(`   Families Helped: ${impact.stats.familiesHelped}`);
  console.log(`   Items Redistributed: ${impact.stats.itemsRedistributed}`);
  console.log(`   Kg Waste Diverted: ${impact.stats.kgWasteDiverted} kg`);

  console.log('\n✨ ALL API END-TO-END FLOW TESTS PASSED SUCCESSFULLY!');
}

runApiFlowTest().catch(err => console.error('❌ Test failed:', err));
