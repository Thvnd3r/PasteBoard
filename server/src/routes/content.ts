import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { getAllContent, addContent, deleteContent, deleteAllContent } from '../database';
import { detectLanguage } from '../contentParser';

// Configure multer for file uploads
const storage = multer.diskStorage({
 destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

export const contentRoutes = (io: any, detectContentType: (content: string) => 'link' | 'code' | 'text') => {
  const router = Router();
  
  // Get all content
  router.get('/', async (req: Request, res: Response) => {
    try {
      const content = await getAllContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch content' });
    }
  });
  
  // Add text content
  router.post('/text', async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      const type = detectContentType(content);
      // Add tag based on type
      const tag = type === 'link' ? 'Link' : type === 'code' ? 'Code' : 'Text';
      
      // Detect language for code snippets
      let language = null;
      if (type === 'code') {
        language = detectLanguage(content);
      }
      
      const record = await addContent(type, content, undefined, tag, language || undefined);
      const { id, timestamp } = record;
      
      // Emit to all connected clients with the actual database timestamp
      io.emit('contentAdded', { id, type, content, tag, language, timestamp });
      
      res.json({ id, type, content, tag, language });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add content' });
    }
  });
  
 // Upload file
  router.post('/file', upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const filename = req.file.filename;
      const originalName = req.file.originalname;
      
      // Determine if the file is an image based on MIME type
      const isImage = req.file.mimetype && req.file.mimetype.startsWith('image/');
      // Add appropriate tag for file uploads
      const tag = isImage ? 'Image' : 'File';
      
      const record = await addContent('file', originalName, filename, tag);
      const { id, timestamp } = record;
      
      // Emit to all connected clients with the actual database timestamp
      io.emit('contentAdded', { 
        id, 
        type: 'file', 
        content: originalName, 
        filename,
        tag,
        timestamp
      });
      
      res.json({ id, type: 'file', content: originalName, filename, tag });
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload file' });
    }
  });
  
  // Delete content by ID
 router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await deleteContent(parseInt(id));
      
      // Emit to all connected clients
      io.emit('contentDeleted', { id: parseInt(id) });
      
      res.json({ success: true, deleted: result });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete content' });
    }
  });
  
  // Delete all content
  router.delete('/', async (req: Request, res: Response) => {
    try {
      const result = await deleteAllContent();
      
      // Emit to all connected clients
      io.emit('allContentDeleted');
      
      res.json({ success: true, deleted: result });
    } catch (error) {
      res.status(50).json({ error: 'Failed to delete all content' });
    }
  });
  
  return router;
};
