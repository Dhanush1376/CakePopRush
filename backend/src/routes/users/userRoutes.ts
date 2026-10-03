import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../../middleware/authMiddleware';
import { validateRequest } from '../../middleware/zodValidationMiddleware';
import { updateProfileSchema, createAddressSchema, updateAddressSchema } from '../../validators/userValidator';
import asyncHandler from '../../utils/asyncHandler';
import ApiResponse from '../../utils/ApiResponse';
import ApiError from '../../utils/ApiError';
import User from '../../models/User';
import CustomOrder from '../../models/CustomOrder';

const router = Router();

router.use(requireAuth);

// ==========================================
// PROFILE ROUTES
// ==========================================

router.get(
  '/profile',
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user!.id).select('-isLocked').lean();
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    res.status(200).json(new ApiResponse(true, 'Profile retrieved', user));
  })
);

router.patch(
  '/profile',
  validateRequest(updateProfileSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, phone, email, avatar } = req.body;
    const currentUser = await User.findById(req.user!.id);
    if (!currentUser) {
      throw new ApiError(404, 'User not found');
    }

    const updates: Record<string, any> = {};
    const unsets: Record<string, any> = {};

    if (name !== undefined) {
      updates.name = String(name).trim();
    }

    if (email !== undefined) {
      const cleanEmail = String(email).trim().toLowerCase();
      if (cleanEmail) {
        if (cleanEmail !== currentUser.email) {
          const existingEmail = await User.findOne({ email: cleanEmail, _id: { $ne: req.user!.id } });
          if (existingEmail) {
            throw new ApiError(400, 'This email address is already in use by another account');
          }
          updates.email = cleanEmail;
          // Security: Reset email verification on email change
          updates.emailVerified = false;
        }
      } else if (currentUser.email) {
        unsets.email = 1;
        updates.emailVerified = false;
      }
    }

    if (phone !== undefined) {
      const cleanPhone = String(phone).trim();
      if (cleanPhone) {
        if (cleanPhone !== currentUser.phone) {
          const existingPhone = await User.findOne({ phone: cleanPhone, _id: { $ne: req.user!.id } });
          if (existingPhone) {
            throw new ApiError(400, 'This phone number is already registered to another account');
          }
          updates.phone = cleanPhone;
          // Security: Reset phone verification on phone change
          updates.phoneVerified = false;

          // Sync custom orders where phone was empty
          await CustomOrder.updateMany(
            { customer: req.user!.id, $or: [{ customerPhone: '' }, { customerPhone: { $exists: false } }] },
            { $set: { customerPhone: cleanPhone } }
          ).catch(() => {});
        }
      } else if (currentUser.phone) {
        unsets.phone = 1;
        updates.phoneVerified = false;
      }
    }

    if (avatar !== undefined) {
      updates.avatar = String(avatar || '');
    }

    const mongoUpdate: Record<string, any> = {};
    if (Object.keys(updates).length > 0) mongoUpdate.$set = updates;
    if (Object.keys(unsets).length > 0) mongoUpdate.$unset = unsets;

    const user = await User.findByIdAndUpdate(req.user!.id, mongoUpdate, { new: true })
      .select('-isLocked')
      .lean();

    res.status(200).json(new ApiResponse(true, 'Profile updated successfully', user));
  })
);

// ==========================================
// ADDRESSES ROUTES
// ==========================================

router.get(
  '/addresses',
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user!.id).select('addresses').lean();
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    res.status(200).json(new ApiResponse(true, 'Addresses retrieved', user.addresses || []));
  })
);

router.post(
  '/addresses',
  validateRequest(createAddressSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user!.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const addresses = user.addresses || [];
    const shouldBeDefault = req.body.isDefault === true || addresses.length === 0;

    if (shouldBeDefault) {
      addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const newAddress: any = {
      label: req.body.label || 'Home',
      type: req.body.type || 'home',
      street: req.body.street || '',
      line1: req.body.line1,
      line2: req.body.line2 || '',
      landmark: req.body.landmark || '',
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      isDefault: shouldBeDefault,
    };

    addresses.push(newAddress);
    user.addresses = addresses;
    await user.save();

    const created = user.addresses[user.addresses.length - 1];
    res.status(201).json(new ApiResponse(true, 'Address created successfully', created));
  })
);

router.patch(
  '/addresses/:addressId',
  validateRequest(updateAddressSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { addressId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      throw new ApiError(400, 'Invalid address ID');
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const address = user.addresses?.find((a) => String(a._id) === addressId);
    if (!address) {
      throw new ApiError(404, 'Address not found');
    }

    if (req.body.isDefault === true) {
      user.addresses?.forEach((a) => {
        a.isDefault = false;
      });
    }

    Object.assign(address, req.body);
    await user.save();

    res.status(200).json(new ApiResponse(true, 'Address updated successfully', address));
  })
);

router.delete(
  '/addresses/:addressId',
  asyncHandler(async (req: Request, res: Response) => {
    const { addressId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      throw new ApiError(400, 'Invalid address ID');
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const index = (user.addresses || []).findIndex((a) => String(a._id) === addressId);
    if (index === -1) {
      throw new ApiError(404, 'Address not found');
    }

    const wasDefault = user.addresses![index].isDefault;
    user.addresses!.splice(index, 1);

    // If deleted address was default, promote first remaining address to default
    if (wasDefault && user.addresses!.length > 0) {
      user.addresses![0].isDefault = true;
    }

    await user.save();
    res.status(200).json(new ApiResponse(true, 'Address deleted successfully', { addressId }));
  })
);

router.patch(
  '/addresses/:addressId/default',
  asyncHandler(async (req: Request, res: Response) => {
    const { addressId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      throw new ApiError(400, 'Invalid address ID');
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const target = (user.addresses || []).find((a) => String(a._id) === addressId);
    if (!target) {
      throw new ApiError(404, 'Address not found');
    }

    user.addresses!.forEach((a) => {
      a.isDefault = String(a._id) === addressId;
    });

    await user.save();
    res.status(200).json(new ApiResponse(true, 'Default address updated', target));
  })
);

export default router;
