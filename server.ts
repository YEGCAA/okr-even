import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";

const db = new Database("okr.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS objectives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    progress INTEGER DEFAULT 0,
    deadline DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS key_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    objective_id INTEGER,
    title TEXT NOT NULL,
    owner TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    unit TEXT,
    FOREIGN KEY (objective_id) REFERENCES objectives(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS daily_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kr_id INTEGER,
    value INTEGER NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kr_id) REFERENCES key_results(id) ON DELETE CASCADE
  );
`);

// Migration: Ensure deadline column exists in objectives
try {
  db.prepare("ALTER TABLE objectives ADD COLUMN deadline DATETIME").run();
} catch (e) {
  // Column might already exist
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/okrs", (req, res) => {
    const okrs = db.prepare(`
      SELECT 
        o.*,
        json_group_array(
          json_object(
            'id', kr.id,
            'title', kr.title,
            'owner', kr.owner,
            'target_value', kr.target_value,
            'current_value', kr.current_value,
            'unit', kr.unit
          )
        ) as key_results
      FROM objectives o
      LEFT JOIN key_results kr ON o.id = kr.objective_id
      GROUP BY o.id
      ORDER BY o.deadline ASC
    `).all();
    
    const parsedOkrs = okrs.map((okr: any) => ({
      ...okr,
      key_results: JSON.parse(okr.key_results).filter((kr: any) => kr.id !== null)
    }));
    
    res.json(parsedOkrs);
  });

  app.get("/api/daily-updates", (req, res) => {
    const updates = db.prepare(`
      SELECT 
        du.*,
        kr.title as kr_title,
        kr.owner as kr_owner,
        kr.target_value as kr_target,
        kr.unit as kr_unit,
        o.title as objective_title
      FROM daily_updates du
      JOIN key_results kr ON du.kr_id = kr.id
      JOIN objectives o ON kr.objective_id = o.id
      ORDER BY du.created_at DESC
      LIMIT 50
    `).all();
    res.json(updates);
  });

  app.post("/api/objectives", (req, res) => {
    const { title, description, deadline } = req.body;
    const info = db.prepare("INSERT INTO objectives (title, description, deadline) VALUES (?, ?, ?)").run(title, description, deadline);
    res.json({ id: info.lastInsertRowid });
  });

  app.post("/api/key-results", (req, res) => {
    const { objective_id, title, owner, target_value, unit } = req.body;
    const info = db.prepare("INSERT INTO key_results (objective_id, title, owner, target_value, unit) VALUES (?, ?, ?, ?, ?)")
      .run(objective_id, title, owner, target_value, unit);
    res.json({ id: info.lastInsertRowid });
  });

  app.post("/api/daily-updates", (req, res) => {
    const { kr_id, value, comment } = req.body;
    
    // Insert daily update
    db.prepare("INSERT INTO daily_updates (kr_id, value, comment) VALUES (?, ?, ?)").run(kr_id, value, comment);
    
    // Update KR current value (increment)
    db.prepare("UPDATE key_results SET current_value = current_value + ? WHERE id = ?").run(value, kr_id);
    
    // Update objective progress
    const kr = db.prepare("SELECT objective_id FROM key_results WHERE id = ?").get(kr_id) as any;
    if (kr) {
      const krs = db.prepare("SELECT current_value, target_value FROM key_results WHERE objective_id = ?").all(kr.objective_id) as any[];
      const totalProgress = krs.reduce((acc, curr) => acc + (curr.current_value / curr.target_value), 0);
      const avgProgress = Math.round((totalProgress / krs.length) * 100);
      db.prepare("UPDATE objectives SET progress = ? WHERE id = ?").run(avgProgress, kr.objective_id);
    }
    
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
