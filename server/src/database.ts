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
  
  // Add tag column if it doesn't exist
  try {
    db.exec(`ALTER TABLE content ADD COLUMN tag TEXT`);
  } catch (error) {
    // Column might already exist, which is fine
  }
  
  return db;
};

// Get all content
export const getAllContent = async () => {
  const db = new Database(path.join(__dirname, '../pasteboard.db'));
  const stmt = db.prepare('SELECT * FROM content ORDER BY timestamp DESC');
  return stmt.all();
};

// Add new content with tag
export const addContent = async (type: string, content: string, filename?: string, tag?: string) => {
  const db = new Database(path.join(__dirname, '../pasteboard.db'));
  const stmt = db.prepare('INSERT INTO content (type, content, filename, tag) VALUES (?, ?, ?, ?)');
  const result = stmt.run(type, content, filename || null, tag || null);
  return result.lastInsertRowid;
};

// Delete content by ID
export const deleteContent = async (id: number) => {
  const db = new Database(path.join(__dirname, '../pasteboard.db'));
  const stmt = db.prepare('SELECT filename FROM content WHERE id = ?');
  const result: any = stmt.get(id);
  
  // If it's a file, delete the actual file from the filesystem
  if (result && result.filename) {
    const filePath = path.join(__dirname, '../uploads', result.filename);
    try {
      if (require('fs').existsSync(filePath)) {
        require('fs').unlinkSync(filePath);
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
  const db = new Database(path.join(__dirname, '../pasteboard.db'));
  
  // Get all file items to delete their files from the filesystem
  const stmt = db.prepare('SELECT filename FROM content WHERE filename IS NOT NULL');
  const files: any[] = stmt.all();
  
  // Delete all files from the filesystem
  files.forEach((file: any) => {
    if (file.filename) {
      const filePath = path.join(__dirname, '../uploads', file.filename);
      try {
        if (require('fs').existsSync(filePath)) {
          require('fs').unlinkSync(filePath);
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
