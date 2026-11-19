import Category from '../models/Category.js';

export const listCategories = async (filters = {}) => {
  const query = { ...filters };

  if (query.status === 'all') {
    delete query.status;
  } else if (!query.status) {
    query.status = 'ACTIVE';
  }

  return Category.find(query).sort({ name: 1 }).lean();
};

export const createCategory = async (data) => {
  // ensure name exists
  if (!data.name || String(data.name).trim() === '') {
    throw new Error('Category name is required');
  }
  // create and save
  const cat = new Category({ ...data, name: data.name.trim() });
  await cat.save();
  return cat.toObject();
};

export const updateCategory = async (id, updateData) => {
  const cat = await Category.findById(id);
  if (!cat) throw new Error('Category not found');

  // If status is being updated, handle children recursively
  if (updateData.status && updateData.status !== cat.status) {
    await updateStatusRecursively(id, updateData.status);
  }

  const updated = await Category.findByIdAndUpdate(id, updateData, { new: true });
  return updated.toObject();
};

const updateStatusRecursively = async (parentId, newStatus) => {
  const children = await Category.find({ parent: parentId });
  for (const child of children) {
    child.status = newStatus;
    await child.save();
    await updateStatusRecursively(child._id, newStatus);
  }
};

export const deleteCategory = async (id) => {
  const cat = await Category.findById(id);
  if (!cat) throw new Error('Category not found');

  // Check if it has children
  const childrenCount = await Category.countDocuments({ parent: id });
  if (childrenCount > 0) {
    throw new Error('Cannot delete category with subcategories. Remove subcategories first.');
  }

  await Category.deleteOne({ _id: id });
  return cat.toObject();
};

export const getCategoryById = async (id) => {
  return Category.findById(id).lean();
};

export default { listCategories, createCategory, deleteCategory, getCategoryById };