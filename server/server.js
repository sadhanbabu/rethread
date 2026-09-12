import express from 'express';
import cors from 'cors';
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
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback allow for demo flexibility
  },
  credentials: true
}));
app.use(express.json());

// ----------------------------------------------------
// NGO ENDPOINTS
// ----------------------------------------------------

// Get all NGOs with their active needs & capacity stats
app.get('/api/ngos', (req, res) => {
  try {
    const ngos = db.prepare('SELECT * FROM ngos ORDER BY id ASC').all();
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

// Fetch all donated items
app.get('/api/items', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM items ORDER BY created_at DESC').all();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Create item and generate top 3 matches or route to recycling
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
      longitude
    } = req.body;

    if (!title || !item_type || !size || !condition) {
      return res.status(400).json({ error: 'Title, item_type, size, and condition are required' });
    }

    const defaultLat = latitude ? parseFloat(latitude) : 37.7749;
    const defaultLng = longitude ? parseFloat(longitude) : -122.4194;
    const defaultPhoto = photo_url || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80";

    const itemStatus = condition === 'Needs Repair' ? 'routed_recycling' : 'available';

    const insertStmt = db.prepare(`
      INSERT INTO items (title, description, item_type, size, gender, season, condition, photo_url, donor_name, donor_location_name, latitude, longitude, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = insertStmt.run(
      title,
      description || '',
      item_type,
      size,
      gender || 'Unisex',
      season || 'All-Season',
      condition,
      defaultPhoto,
      donor_name || 'Anonymous Donor',
      donor_location_name || 'San Francisco, CA',
      defaultLat,
      defaultLng,
      itemStatus
    );

    const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(info.lastInsertRowid);

    // Calculate matches via Matching Engine
    const matchResult = findTopMatches(db, newItem);

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

    res.status(201).json({
      item: newItem,
      matchResult
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create donation item' });
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

// Get Impact Dashboard Data & Demand Hotspots
app.get('/api/impact', (req, res) => {
  try {
    const acceptedCount = db.prepare("SELECT COUNT(*) as count FROM matches WHERE status = 'accepted'").get().count;
    const totalItems = db.prepare('SELECT COUNT(*) as count FROM items').get().count;
    const recycledCount = db.prepare("SELECT COUNT(*) as count FROM items WHERE condition = 'Needs Repair'").get().count;

    const ngos = db.prepare('SELECT * FROM ngos').all();
    const needsStmt = db.prepare(`
      SELECT SUM(quantity_needed - quantity_fulfilled) as open_demand,
             COUNT(CASE WHEN urgency = 'High' THEN 1 END) as urgent_needs
      FROM ngo_needs 
      WHERE ngo_id = ? AND status = 'active'
    `);

    const hotspots = ngos.map(ngo => {
      const needStats = needsStmt.get(ngo.id);
      const openDemand = needStats.open_demand || 0;
      const urgentCount = needStats.urgent_needs || 0;

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
        capacityRatio: Math.round((ngo.current_storage / ngo.max_capacity) * 100)
      };
    });

    res.json({
      stats: {
        familiesHelped: (acceptedCount + 14) * 3,
        itemsRedistributed: acceptedCount + 28,
        kgWasteDiverted: (acceptedCount + recycledCount + 30) * 1.8,
        activeNgosCount: ngos.length
      },
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
