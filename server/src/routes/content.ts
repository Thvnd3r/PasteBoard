import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { getAllContent, addContent } from '../database';

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

export const contentRoutes = (io: any, detectContentType: (content: string) => 'link' | 'text') => {
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
      
      const id = await addContent(type, content);
      
      // Emit to all connected clients
      io.emit('contentAdded', { id, type, content, timestamp: new Date() });
      
      res.json({ id, type, content });
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
      
      const id = await addContent('file', originalName, filename);
      
      // Emit to all connected clients
      io.emit('contentAdded', { 
        id, 
        type: 'file', 
        content: originalName, 
        filename,
        timestamp: new Date() 
      });
      
      res.json({ id, type: 'file', content: originalName, filename });
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload file' });
    }
  });
  
  return router;
};
