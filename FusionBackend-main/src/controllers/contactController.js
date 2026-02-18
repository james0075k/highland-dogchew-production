import handleError from "../utils/errorHandler.js";
import handleSuccess from "../utils/sucessHandler.js";
import contactModel from "../models/contactModel.js";


// ✅ POST /contact  (public)
export const createContactMessage = async (req, res, next) => {
  try {
    const payload = {
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
    };

  

    const created = await contactModel.create(payload);
    return handleSuccess(res, 201, "Message sent successfully", created);
  } catch (err) {
    next(err);
  }
};

// ✅ GET /contact  (admin)
export const getAllContactMessages = async (req, res, next) => {
  try {
    const { status, q, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { subject: { $regex: q, $options: "i" } },
        { message: { $regex: q, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      contactModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      contactModel.countDocuments(filter),
    ]);

    return handleSuccess(res, 200, "Contact messages fetched successfully", {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

// ✅ GET /contact/:id  (admin)
export const getContactMessageById = async (req, res, next) => {
  try {
    const msg = await contactModel.findById(req.params.id);
    if (!msg) return next(handleError(404, "Message not found"));

    return handleSuccess(res, 200, "Contact message fetched", msg);
  } catch (err) {
    next(err);
  }
};

// ✅ PATCH /contact/:id/status  (admin) - mark read/replied
export const updateContactStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowed = ["new", "read", "replied"];
    if (!allowed.includes(status)) return next(handleError(400, "Invalid status"));

    const update = { status };
    if (status === "replied") update.repliedAt = new Date();

    const updated = await contactModel.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!updated) return next(handleError(404, "Message not found"));

    return handleSuccess(res, 200, "Contact message status updated", updated);
  } catch (err) {
    next(err);
  }
};

// ✅ DELETE /contact/:id  (admin)
export const deleteContactMessage = async (req, res, next) => {
  try {
    const deleted = await contactModel.findByIdAndDelete(req.params.id);
    if (!deleted) return next(handleError(404, "Message not found"));

    return handleSuccess(res, 200, "Contact message deleted successfully", deleted);
  } catch (err) {
    next(err);
  }
};
