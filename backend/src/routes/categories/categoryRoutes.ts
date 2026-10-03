import { Router, Request, Response } from 'express';
import categoriesData from '../../data/seed/categories.json';

const router = Router();

// GET /api/v1/categories
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: categoriesData,
  });
});

export default router;
