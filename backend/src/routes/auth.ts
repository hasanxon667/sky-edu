import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'skyline-edu-secret-key-2026';

// Mock user store for demo API fallback
const mockUsers = [
  {
    id: 'usr-admin',
    phone: '+998903503304',
    name: 'Skyline Admin (Direktor)',
    role: 'ADMIN',
    position: 'Bosh Menecer / Admin',
    profileImage: null
  },
  {
    id: 'usr-1',
    phone: '+998901234567',
    name: 'Akmal Karimov',
    role: 'EMPLOYEE',
    position: 'Support Teacher',
    password: 'akmal123',
    profileImage: null
  }
];

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<any> => {
  const { name, phone, position, password } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'Ism, telefon raqam va parol kiritilishi shart!' });
  }

  const cleanPhone = phone.trim().replace(/\s+/g, '');
  const existing = mockUsers.find((u) => u.phone.replace(/\s+/g, '') === cleanPhone);

  if (existing) {
    return res.status(400).json({ error: 'Ushbu telefon raqami allaqachon ro\'yxatdan o\'tgan!' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    phone: phone.trim(),
    position: position || 'Support Teacher',
    password: password,
    role: 'EMPLOYEE',
    profileImage: null
  };

  mockUsers.push(newUser);

  return res.status(201).json({
    message: 'Ro\'yxatdan muvaffaqiyatli o\'tdingiz! Endi tizimga kiring.',
    user: newUser
  });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<any> => {
  const { phone, password } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Telefon raqam kiritilishi shart' });
  }

  const cleanPhone = phone.trim().replace(/\s+/g, '');
  const user = mockUsers.find((u) => u.phone.replace(/\s+/g, '') === cleanPhone);

  if (!user) {
    return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
  }

  if (user.role === 'ADMIN') {
    if (password !== 'skyline-edu' || cleanPhone !== '+998903503304') {
      return res.status(401).json({ error: 'Admin paroli noto\'g\'ri! Parol: skyline-edu' });
    }
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    message: 'Muvaffaqiyatli tizimga kirildi',
    token,
    user
  });
});

// GET /api/auth/me
router.get('/me', (req: Request, res: Response): any => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token mavjud emas' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = mockUsers.find((u) => u.id === decoded.userId);
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Yaroqsiz token' });
  }
});

// PUT /api/auth/profile
router.put('/profile', (req: Request, res: Response): any => {
  const { userId, profileImage } = req.body;

  const user = mockUsers.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
  }

  if (profileImage) {
    user.profileImage = profileImage;
  }

  return res.json({
    message: 'Profil rasmi yangilandi',
    user
  });
});

// GET /api/auth/users - Return all registered users
router.get('/users', (_req: Request, res: Response): any => {
  return res.json({ users: mockUsers });
});

export default router;
