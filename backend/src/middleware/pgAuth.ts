import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface CustomRequest extends Request {
  pgOwnerId?: string;
  userId?: string;
}

export const pgOwnerAuth = (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key') as JwtPayload;

    if (decoded.type === 'pgowner') {
      req.pgOwnerId = decoded.pgOwnerId;
      next();
    } else {
      return res.status(401).json({ error: 'Invalid token type' });
    }
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const userAuth = (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key') as JwtPayload;

    if (decoded.userId && !decoded.type) {
      req.userId = decoded.userId;
      next();
    } else {
      return res.status(401).json({ error: 'Invalid token type' });
    }
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
