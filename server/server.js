import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import db from './db.js';
import { findTopMatches } from './matchingEngine.js';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'https://rethread-sigma.vercel.app',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Helper for session token generation (simple token format for hackathon scope)
function generateToken(userId) {
  return Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');
}

function parseToken(token) {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8');
    const parsed = JSON.parse(raw);
    return parsed.userId;
  } catch (e) {
    return null;
  }
}

// ----------------------------------------------------
// AUTH ENDPOINTS
// ----------------------------------------------------

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, accountType, fullName, location, finderType, organizationName, storageCapacity, householdSize } = req.body;

    if (!email || !password || !accountType) {
      return res.status(400).json({ error: 'Email, password, and accountType are required' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const insertUserStmt = db.prepare('INSERT INTO users (email, password_hash, account_type) VALUES (?, ?, ?)');
    const info = insertUserStmt.run(email.toLowerCase(), password_hash, accountType);
    const userId = info.lastInsertRowid;

    let profileRecord = null;

    if (accountType === 'receiver') {
      const type = finderType || 'ngo';
      const name = type === 'individual' ? (fullName || 'Individual Recipient') : (organizationName || 'Shelter Organization');
      const capacity = Number(storageCapacity) || (type === 'individual' ? 20 : 300);
      const addr = location || 'San Francisco, CA';

      const insertNgo = db.prepare(`
        INSERT INTO ngos (user_id, name, type, description, address, latitude, longitude, max_capacity, current_storage, contact_email, phone, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
      `);

      const ngoInfo = insertNgo.run(
        userId,
        name,
        type,
        type === 'individual' ? `Household Size: ${householdSize || 1}` : 'Registered Receiver Organization',
        addr,
        37.7749,
        -122.4194,
        capacity,
        email.toLowerCase(),
        '',
        type === 'individual'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
          : 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80'
      );

      profileRecord = db.prepare('SELECT * FROM ngos WHERE id = ?').get(ngoInfo.lastInsertRowid);
    } else {
      profileRecord = {
        name: fullName || 'Valued Donor',
        location: location || 'San Francisco, CA'
      };
    }

    const token = generateToken(userId);

    res.status(201).json({
      token,
      user: {
        id: userId,
        email: email.toLowerCase(),
        accountType,
        fullName: fullName || (profileRecord ? profileRecord.name : 'User'),
        location: location || 'San Francisco, CA',
        profile: profileRecord
      }
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create user account' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let profileRecord = null;
    if (user.account_type === 'receiver') {
      profileRecord = db.prepare('SELECT * FROM ngos WHERE user_id = ?').get(user.id);
      if (!profileRecord) {
        profileRecord = db.prepare('SELECT * FROM ngos ORDER BY id ASC LIMIT 1').get();
      }
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        accountType: user.account_type,
        fullName: profileRecord ? profileRecord.name : user.email.split('@')[0],
        profile: profileRecord
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const userId = parseToken(token);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const user = db.prepare('SELECT id, email, account_type FROM users WHERE id = ?').get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let profileRecord = null;
  if (user.account_type === 'receiver') {
    profileRecord = db.prepare('SELECT * FROM ngos WHERE user_id = ?').get(user.id);
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      accountType: user.account_type,
      fullName: profileRecord ? profileRecord.name : user.email.split('@')[0],
      profile: profileRecord
    }
  });
});

// ----------------------------------------------------
// NGO ENDPOINTS
// ----------------------------------------------------

// Get all NGOs with their active needs & capacity stats (optional ?type= filter)
app.get('/api/ngos', (req, res) => {
  try {
    const { type } = req.query;
    let ngos;
    if (type) {
      ngos = db.prepare('SELECT * FROM ngos WHERE type = ? ORDER BY id ASC').all(type);
    } else {
      ngos = db.prepare('SELECT * FROM ngos ORDER BY id ASC').all();
    }

    const needsStmt = db.prepare('SELECT * FROM ngo_needs WHERE ngo_id = ? ORDER BY urgency DESC');

    const result = ngos.map(ngo => {
      const needs = needsStmt.all(ngo.id);
      return {
        ...ngo,
        needs
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch NGOs' });
  }
});

// Register / Create a new Finder Record
app.post('/api/finders', (req, res) => {
  try {
    const { finderType, displayName, name, location, address, latitude, longitude, max_capacity, contact_email, phone, image_url, description } = req.body;
    const nameToUse = displayName || name;

    if (!finderType || !nameToUse) {
      return res.status(400).json({ error: 'finderType and name are required' });
    }

    const validTypes = ['ngo', 'individual', 'community'];
    const type = validTypes.includes(finderType) ? finderType : 'ngo';

    const defaultAddress = address || location || 'San Francisco, CA';
    const defaultLat = latitude || 37.7749;
    const defaultLng = longitude || -122.4194;
    const capacity = max_capacity || (type === 'individual' ? 10 : 300);
    const img = image_url || (type === 'individual'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
      : 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80');

    const stmt = db.prepare(`
      INSERT INTO ngos (name, type, description, address, latitude, longitude, max_capacity, current_storage, contact_email, phone, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
    `);

    const info = stmt.run(
      nameToUse,
      type,
      description || `${type.toUpperCase()} Finder Account`,
      defaultAddress,
      defaultLat,
      defaultLng,
      capacity,
      contact_email || '',
      phone || '',
      img
    );

    const newFinder = db.prepare('SELECT * FROM ngos WHERE id = ?').get(info.lastInsertRowid);
    const needs = db.prepare('SELECT * FROM ngo_needs WHERE ngo_id = ?').all(newFinder.id);

    res.status(201).json({
      ...newFinder,
      needs
    });
  } catch (err) {
    console.error('Error creating new finder:', err);
    res.status(500).json({ error: 'Failed to create new finder profile' });
  }
});

// Update NGO Max Storage Capacity
app.post('/api/ngos/:id/capacity', (req, res) => {
  try {
    const { max_capacity } = req.body;
    const { id } = req.params;

    if (!max_capacity || isNaN(max_capacity)) {
      return res.status(400).json({ error: 'Valid max_capacity is required' });
    }

    db.prepare('UPDATE ngos SET max_capacity = ? WHERE id = ?').run(max_capacity, id);
    const updatedNgo = db.prepare('SELECT * FROM ngos WHERE id = ?').get(id);
    res.json(updatedNgo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update NGO capacity' });
  }
});

// Add a new Need for an NGO
app.post('/api/ngos/:id/needs', (req, res) => {
  try {
    const { id } = req.params;
    const { item_type, size, gender, season, quantity_needed, urgency, notes } = req.body;

    if (!item_type || !size || !quantity_needed) {
      return res.status(400).json({ error: 'item_type, size, and quantity_needed are required' });
    }

    const ngoExists = db.prepare('SELECT id FROM ngos WHERE id = ?').get(id);
    if (!ngoExists) {
      return res.status(404).json({ error: 'NGO profile not found' });
    }

    const stmt = db.prepare(`
      INSERT INTO ngo_needs (ngo_id, item_type, size, gender, season, quantity_needed, quantity_fulfilled, urgency, notes)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
    `);

    const info = stmt.run(id, item_type, size, gender || 'Unisex', season || 'All-Season', quantity_needed, urgency || 'Medium', notes || '');
    const newNeed = db.prepare('SELECT * FROM ngo_needs WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newNeed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create NGO need' });
  }
});

// Delete an NGO Need
app.delete('/api/ngos/needs/:needId', (req, res) => {
  try {
    const { needId } = req.params;
    db.prepare('DELETE FROM ngo_needs WHERE id = ?').run(needId);
    res.json({ message: 'Need deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete need' });
  }
});

// ----------------------------------------------------
// ITEM & DONOR FLOW ENDPOINTS
// ----------------------------------------------------

// Fetch all donated items (optionally filtered by userId or auth token)
app.get('/api/items', (req, res) => {
  try {
    let userId = req.query.userId;
    if (!userId && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      userId = parseToken(token);
    }

    let items;
    if (userId) {
      items = db.prepare('SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    } else {
      items = db.prepare('SELECT * FROM items ORDER BY created_at DESC').all();
    }

    // Attach recipient NGO info for items if confirmed or matched
    const itemsWithRecipient = items.map(item => {
      let recipientNgo = null;
      if (item.confirmed_ngo_id) {
        const ngo = db.prepare('SELECT name FROM ngos WHERE id = ?').get(item.confirmed_ngo_id);
        if (ngo) recipientNgo = ngo.name;
      }
      if (!recipientNgo && item.status === 'accepted') {
        const match = db.prepare(`
          SELECT n.name 
          FROM matches m 
          JOIN ngos n ON m.ngo_id = n.id 
          WHERE m.item_id = ? AND m.status = 'accepted' 
          LIMIT 1
        `).get(item.id);
        if (match) {
          recipientNgo = match.name;
        }
      }
      return {
        ...item,
        recipientNgo
      };
    });

    res.json(itemsWithRecipient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Create item (supports quantity > 1 for bulk/batch donations)
app.post('/api/items', (req, res) => {
  try {
    const {
      title,
      description,
      item_type,
      size,
      gender,
      season,
      condition,
      photo_url,
      donor_name,
      donor_location_name,
      latitude,
      longitude,
      user_id,
      quantity
    } = req.body;

    if (!title || !item_type || !size || !condition) {
      return res.status(400).json({ error: 'Title, item_type, size, and condition are required' });
    }

    let finalUserId = user_id || null;
    if (!finalUserId && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      finalUserId = parseToken(token);
    }

    const countToCreate = Math.min(Math.max(1, parseInt(quantity) || 1), 500); // capped at 500 max per batch
    const defaultLat = latitude ? parseFloat(latitude) : 37.7749;
    const defaultLng = longitude ? parseFloat(longitude) : -122.4194;
    const defaultPhoto = photo_url || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80";

    const isRecycling = condition === 'Needs Repair';
    const itemStatus = isRecycling ? 'routed_recycling' : 'available';

    const recyclingPartners = [
      'Bay Area Fiber Recovery & Shredding Lab',
      'Pacific Circular Textile Recyclers',
      'EcoThread Material Regeneration Hub'
    ];
    const recyclingOutcomes = [
      'Recycled — Converted to 2.4 kg of acoustic insulation fiber',
      'Recycled — Reprocessed into circular denim yarn',
      'Recycled — Upcycled into eco-industrial padding'
    ];

    const insertStmt = db.prepare(`
      INSERT INTO items (
        user_id, title, description, item_type, size, gender, season, condition, 
        photo_url, donor_name, donor_location_name, latitude, longitude, status,
        recycling_partner_name, recycling_outcome
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let firstCreatedItem = null;
    let firstMatchResult = null;

    const createTransaction = db.transaction(() => {
      for (let i = 0; i < countToCreate; i++) {
        const randomIdx = Math.floor(Math.random() * recyclingPartners.length);
        const recyclingPartnerName = isRecycling ? recyclingPartners[randomIdx] : null;
        const recyclingOutcome = isRecycling ? recyclingOutcomes[randomIdx] : null;

        const itemTitle = countToCreate > 1 ? `${title} (${i + 1}/${countToCreate})` : title;

        const info = insertStmt.run(
          finalUserId,
          itemTitle,
          description || '',
          item_type,
          size,
          gender || 'Unisex',
          season || 'All-Season',
          condition,
          defaultPhoto,
          donor_name || 'Valued Donor',
          donor_location_name || 'San Francisco, CA',
          defaultLat,
          defaultLng,
          itemStatus,
          recyclingPartnerName,
          recyclingOutcome
        );

        const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(info.lastInsertRowid);
        if (i === 0) {
          firstCreatedItem = newItem;
          firstMatchResult = findTopMatches(db, { ...newItem, quantity: countToCreate });
        }

        // Calculate matches via Matching Engine
        const matchResult = (i === 0) ? firstMatchResult : findTopMatches(db, { ...newItem, quantity: countToCreate });

        // If matches found and not recycling, persist matches in DB
        if (!matchResult.isRecycling && matchResult.matches && matchResult.matches.length > 0) {
          const insertMatch = db.prepare(`
            INSERT INTO matches (item_id, ngo_id, need_id, match_score, distance_km, reasoning, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
          `);

          for (const m of matchResult.matches) {
            insertMatch.run(
              newItem.id,
              m.ngo.id,
              m.need.id,
              m.score,
              m.distanceKm,
              m.reasoning
            );
          }
        }
      }
    });

    createTransaction();

    res.status(201).json({
      item: firstCreatedItem,
      totalCountCreated: countToCreate,
      matchResult: firstMatchResult
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create donation items' });
  }
});

// Donor explicitly confirms donation candidate recipient
app.post('/api/items/:itemId/confirm', (req, res) => {
  try {
    const { itemId } = req.params;
    const { ngoId } = req.body;

    if (!ngoId) {
      return res.status(400).json({ error: 'ngoId is required to confirm donation' });
    }

    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const ngo = db.prepare('SELECT * FROM ngos WHERE id = ?').get(ngoId);
    if (!ngo) {
      return res.status(404).json({ error: 'Selected NGO recipient not found' });
    }

    // Update item status to matched and record chosen recipient NGO id
    db.prepare(`
      UPDATE items 
      SET status = 'matched', confirmed_ngo_id = ? 
      WHERE id = ?
    `).run(ngoId, itemId);

    const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);

    res.json({
      message: `Donation match confirmed for ${ngo.name}!`,
      item: {
        ...updatedItem,
        recipientNgo: ngo.name
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to confirm donation match' });
  }
});

// Get matches for a specific item
app.get('/api/items/:id/matches', (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const matchResult = findTopMatches(db, item);
    res.json(matchResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute matches' });
  }
});

// ----------------------------------------------------
// NGO MATCHING & ACCEPTANCE ENDPOINTS
// ----------------------------------------------------

// Get incoming matches for an NGO
app.get('/api/ngo-matches/:ngoId', (req, res) => {
  try {
    const { ngoId } = req.params;
    const matches = db.prepare(`
      SELECT m.*, i.title as item_title, i.description as item_description, i.item_type,
             i.size, i.gender, i.condition, i.photo_url, i.donor_name, i.donor_location_name,
             n.item_type as need_type, n.quantity_needed, n.quantity_fulfilled
      FROM matches m
      JOIN items i ON m.item_id = i.id
      LEFT JOIN ngo_needs n ON m.need_id = n.id
      WHERE m.ngo_id = ? AND m.status = 'pending'
      ORDER BY m.match_score DESC
    `).all(ngoId);

    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch NGO matches' });
  }
});

// NGO Accepts a donation match
app.post('/api/matches/:matchId/accept', (req, res) => {
  try {
    const { matchId } = req.params;
    const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId);

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.status !== 'pending') {
      return res.status(400).json({ error: 'Match is already processed' });
    }

    // Begin database transaction for atomicity
    const acceptTransaction = db.transaction(() => {
      // 1. Update match status
      db.prepare("UPDATE matches SET status = 'accepted' WHERE id = ?").run(matchId);

      // 2. Update item status
      db.prepare("UPDATE items SET status = 'accepted' WHERE id = ?").run(match.item_id);

      // 3. Decrement NGO Need (increment quantity_fulfilled)
      if (match.need_id) {
        const need = db.prepare('SELECT * FROM ngo_needs WHERE id = ?').get(match.need_id);
        if (need) {
          const newFulfilled = (need.quantity_fulfilled || 0) + 1;
          const isClosed = newFulfilled >= need.quantity_needed;
          db.prepare(`
            UPDATE ngo_needs 
            SET quantity_fulfilled = ?, status = ? 
            WHERE id = ?
          `).run(newFulfilled, isClosed ? 'closed' : 'active', match.need_id);
        }
      }

      // 4. Increment NGO current storage count
      db.prepare(`
        UPDATE ngos 
        SET current_storage = current_storage + 1 
        WHERE id = ?
      `).run(match.ngo_id);
    });

    acceptTransaction();

    res.json({ message: 'Donation match accepted successfully!', matchId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to accept match' });
  }
});

// NGO Declines a donation match
app.post('/api/matches/:matchId/decline', (req, res) => {
  try {
    const { matchId } = req.params;
    db.prepare("UPDATE matches SET status = 'declined' WHERE id = ?").run(matchId);
    res.json({ message: 'Donation match declined', matchId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to decline match' });
  }
});

// ----------------------------------------------------
// RECYCLING & IMPACT ENDPOINTS
// ----------------------------------------------------

// Get Recycling Partners
app.get('/api/recycling-partners', (req, res) => {
  try {
    const partners = db.prepare('SELECT * FROM recycling_partners').all();
    res.json(partners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recycling partners' });
  }
});

// Get Impact Dashboard Data & Demand Hotspots (supports ?userId= for personalized donor stats)
app.get('/api/impact', (req, res) => {
  try {
    let userId = req.query.userId;
    if (!userId && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      userId = parseToken(token);
    }

    let matchedCount = 0;
    let totalItems = 0;
    let recycledCount = 0;

    if (userId) {
      // User-specific stats
      totalItems = db.prepare('SELECT COUNT(*) as count FROM items WHERE user_id = ?').get(userId).count;
      recycledCount = db.prepare("SELECT COUNT(*) as count FROM items WHERE user_id = ? AND (status = 'routed_recycling' OR condition = 'Needs Repair')").get(userId).count;
      matchedCount = db.prepare("SELECT COUNT(*) as count FROM items WHERE user_id = ? AND (status = 'matched' OR status = 'accepted')").get(userId).count;
    } else {
      // Platform-wide stats
      matchedCount = db.prepare("SELECT COUNT(*) as count FROM matches WHERE status = 'accepted' OR status = 'pending'").get().count;
      totalItems = db.prepare('SELECT COUNT(*) as count FROM items').get().count;
      recycledCount = db.prepare("SELECT COUNT(*) as count FROM items WHERE condition = 'Needs Repair' OR status = 'routed_recycling'").get().count;
    }

    const ngos = db.prepare('SELECT * FROM ngos').all();
    const needsStmt = db.prepare(`
      SELECT SUM(quantity_needed - quantity_fulfilled) as open_demand,
             COUNT(CASE WHEN urgency = 'High' THEN 1 END) as urgent_needs
      FROM ngo_needs 
      WHERE ngo_id = ? AND status = 'active'
    `);

    const hotspots = ngos.map(ngo => {
      const needStats = needsStmt.get(ngo.id);
      const openDemand = needStats ? (needStats.open_demand || 0) : 0;
      const urgentCount = needStats ? (needStats.urgent_needs || 0) : 0;

      let intensity = 'low';
      if (urgentCount > 1 || openDemand > 15) {
        intensity = 'high';
      } else if (openDemand > 5) {
        intensity = 'medium';
      }

      return {
        id: ngo.id,
        name: ngo.name,
        latitude: ngo.latitude,
        longitude: ngo.longitude,
        openDemand,
        urgentCount,
        intensity,
        capacityRatio: ngo.max_capacity ? Math.round((ngo.current_storage / ngo.max_capacity) * 100) : 0
      };
    });

    const kgDiverted = userId
      ? Math.round((matchedCount * 1.8 + recycledCount * 2.4) * 10) / 10
      : Math.round((matchedCount * 1.5 + recycledCount * 2.2) * 10) / 10;

    res.json({
      stats: {
        totalDonated: totalItems,
        familiesHelped: matchedCount,
        itemsRedistributed: matchedCount,
        itemsRecycled: recycledCount,
        kgWasteDiverted: kgDiverted,
        activeNgosCount: ngos.length
      },
      isPersonalized: !!userId,
      hotspots
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch impact data' });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`⚡ ReThread Backend API Server running on port ${PORT}`);
});
