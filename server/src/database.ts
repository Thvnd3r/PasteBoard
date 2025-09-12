import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Open database
export const initDatabase = async (): Promise<Database.Database> => {
  const dbPath = path.join(__dirname, '../server/pasteboard.db');
  
  // Ensure the database file exists and is writable
  try {
    // Create the directory if it doesn't exist
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Create empty database file if it doesn't exist
    if (!fs.existsSync(dbPath)) {
      fs.closeSync(fs.openSync(dbPath, 'w'));
    }
  } catch (error) {
    console.warn('Warning: Could not create database file, using in-memory database:', error);
    // Fallback to in-memory database if file creation fails
    const db = new Database(':memory:');
    initializeDatabaseSchema(db);
    return db;
  }
  
  const db = new Database(dbPath);
  initializeDatabaseSchema(db);
  return db;
};

// Separate function to initialize database schema
const initializeDatabaseSchema = (db: Database.Database) => {
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
  
  // Add tag column if it doesn't exist
  try {
    db.exec(`ALTER TABLE content ADD COLUMN tag TEXT`);
  } catch (error) {
    // Column might already exist, which is fine
  }
  
  // Add language column if it doesn't exist
  try {
    db.exec(`ALTER TABLE content ADD COLUMN language TEXT`);
  } catch (error) {
    // Column might already exist, which is fine
  }
};

// Get all content
export const getAllContent = async () => {
  const dbPath = path.join(__dirname, '../server/pasteboard.db');
  const db = new Database(dbPath);
  const stmt = db.prepare('SELECT * FROM content ORDER BY timestamp DESC');
  return stmt.all();
};

// Get content by type
export const getContentByType = async (type: string) => {
  const dbPath = path.join(__dirname, '../server/pasteboard.db');
  const db = new Database(dbPath);
  const stmt = db.prepare('SELECT * FROM content WHERE type = ? ORDER BY timestamp DESC');
  return stmt.all(type);
};

interface ContentRecord {
  id: number;
  type: string;
  content: string;
  filename?: string;
  timestamp: string;
  tag?: string;
  language?: string;
}

// Add new content with tag and language
export const addContent = async (type: string, content: string, filename?: string, tag?: string, language?: string): Promise<ContentRecord> => {
  const dbPath = path.join(__dirname, '../server/pasteboard.db');
  const db = new Database(dbPath);
  const stmt = db.prepare('INSERT INTO content (type, content, filename, tag, language) VALUES (?, ?, ?, ?, ?)');
  const result = stmt.run(type, content, filename || null, tag || null, language || null);
  
  // Get the inserted record including the auto-generated timestamp
  const selectStmt = db.prepare('SELECT * FROM content WHERE id = ?');
  return selectStmt.get(result.lastInsertRowid) as ContentRecord;
};

// Delete content by ID
export const deleteContent = async (id: number) => {
  const dbPath = path.join(__dirname, '../server/pasteboard.db');
  const db = new Database(dbPath);
  const stmt = db.prepare('SELECT filename FROM content WHERE id = ?');
  const result: any = stmt.get(id);
  
  // If it's a file, delete the actual file from the filesystem
  if (result && result.filename) {
    const filePath = path.join(__dirname, '../uploads', result.filename);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
  
  // Delete the database record
  const deleteStmt = db.prepare('DELETE FROM content WHERE id = ?');
  return deleteStmt.run(id);
};

// Delete all content
export const deleteAllContent = async () => {
  const dbPath = path.join(__dirname, '../server/pasteboard.db');
  const db = new Database(dbPath);
  
  // Get all file items to delete their files from the filesystem
  const stmt = db.prepare('SELECT filename FROM content WHERE filename IS NOT NULL');
  const files: any[] = stmt.all();
  
  // Delete all files from the filesystem
  files.forEach((file: any) => {
    if (file.filename) {
      const filePath = path.join(__dirname, '../uploads', file.filename);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  });
  
  // Delete all database records
  const deleteStmt = db.prepare('DELETE FROM content');
  return deleteStmt.run();
};
