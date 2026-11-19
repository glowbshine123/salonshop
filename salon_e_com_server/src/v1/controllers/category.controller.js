import * as categoryService from '../services/category.service.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await categoryService.listCategories(req.query);
    res.json(categories);
  } catch (err) {
    console.error('[getCategories] Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (err) {
    console.error('[createCategory] Error:', err.message);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    res.status(400).json({ message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const cat = await categoryService.deleteCategory(req.params.id);
    res.json({ message: 'Category deleted', category: cat });
  } catch (err) {
    console.error('[deleteCategory] Error:', err.message);
    res.status(400).json({ message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.json(category);
  } catch (err) {
    console.error('[updateCategory] Error:', err.message);
    res.status(400).json({ message: err.message });
  }
};

export default { getCategories, createCategory, deleteCategory, updateCategory };