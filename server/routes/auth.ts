import { Router, Request, Response } from 'express';
import { dbRepository } from '../db.js';
import { generateToken, hashPassword, verifyPassword, requireAuth, AuthenticatedRequest } from '../auth.js';
import { User, UserProfile } from '../models.js';

export const authRouter = Router();

// Register
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Please fill in all required fields.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const existingUser = await dbRepository.findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    await dbRepository.createUser(newUser);

    // Initialize profile
    const initialProfile: UserProfile = {
      userId: newUser.id,
      fullName: newUser.name,
      email: newUser.email,
      phone: '',
      college: '',
      qualification: '',
      department: '',
      graduationYear: new Date().getFullYear().toString(),
      technicalSkills: [],
      programmingLanguages: [],
      projects: [],
      internships: [],
      workExperience: [],
      completionPercentage: 25,
      updatedAt: new Date().toISOString(),
    };
    await dbRepository.upsertProfile(initialProfile);

    const token = generateToken(newUser);
    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error('[Auth] Register error:', err);
    res.status(500).json({ error: 'Server error during registration. Please try again.' });
  }
});

// Login
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await dbRepository.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ error: 'Server error during login. Please try again.' });
  }
});

// Current user profile check
authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  });
});

// Forgot password request
authRouter.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email address is required.' });
    return;
  }
  const user = await dbRepository.findUserByEmail(email);
  if (!user) {
    // For privacy, return generic success
    res.json({ message: 'If an account exists with this email, a reset link has been prepared.' });
    return;
  }
  // Simulated secure reset code for demonstration
  const mockResetCode = Math.floor(100000 + Math.random() * 900000).toString();
  res.json({
    message: 'Password reset code generated.',
    demoResetCode: mockResetCode,
    instruction: 'In demo mode, you can use code ' + mockResetCode + ' to complete the reset.'
  });
});

// Reset password with code
authRouter.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  const { email, newPassword, confirmPassword } = req.body;
  if (!email || !newPassword) {
    res.status(400).json({ error: 'Email and new password are required.' });
    return;
  }
  if (newPassword !== confirmPassword) {
    res.status(400).json({ error: 'Passwords do not match.' });
    return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }

  const user = await dbRepository.findUserByEmail(email);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const newHash = await hashPassword(newPassword);
  await dbRepository.updateUserPassword(user.id, newHash);
  res.json({ message: 'Password has been successfully reset. You may now log in.' });
});

// Change password (logged-in user)
authRouter.post('/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new password are required.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      res.status(400).json({ error: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters.' });
      return;
    }

    const user = await dbRepository.findUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const isMatch = await verifyPassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'Current password is incorrect.' });
      return;
    }

    const newHash = await hashPassword(newPassword);
    await dbRepository.updateUserPassword(user.id, newHash);
    res.json({ message: 'Password updated successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password.' });
  }
});
