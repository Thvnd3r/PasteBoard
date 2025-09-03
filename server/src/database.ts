import Database from 'better-sqlite3';
import path from 'path';

// Open database
export const initDatabase = async (): Promise<Database.Database> => {
 const db = new Database(path.join(__dirname, '../pasteboard.db'));
  
  // Create content table
  db.exec(`
    CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      filename TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  return db;
};

// Get all content
export const getAllContent = async () => {
  const db = new Database(path.join(__dirname, '../pasteboard.db'));
  const stmt = db.prepare('SELECT * FROM content ORDER BY timestamp DESC');
  return stmt.all();
};

// Add new content
export const addContent = async (type: string, content: string, filename?: string) => {
  const db = new Database(path.join(__dirname, '../pasteboard.db'));
  const stmt = db.prepare('INSERT INTO content (type, content, filename) VALUES (?, ?, ?)');
  const result = stmt.run(type, content, filename || null);
  return result.lastInsertRowid;
};
