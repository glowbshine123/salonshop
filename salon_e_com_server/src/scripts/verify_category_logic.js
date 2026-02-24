
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Category from '../v1/models/Category.js';
import * as categoryService from '../v1/services/category.service.js';

const verify = async () => {
    try {
        console.log('URI:', process.env.MONGO_URI);
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Create Parent
        const parent = await categoryService.createCategory({ name: 'Parent Test ' + Date.now() });
        console.log('Created Parent:', parent.name, 'Status:', parent.status);

        // 2. Create Child
        const child = await categoryService.createCategory({ name: 'Child Test ' + Date.now(), parent: parent._id });
        console.log('Created Child:', child.name, 'Status:', child.status);

        // 3. Deactivate Parent
        console.log('Deactivating Parent...');
        await categoryService.updateCategory(parent._id, { status: 'DEACTIVE' });

        const updatedParent = await categoryService.getCategoryById(parent._id);
        const updatedChild = await categoryService.getCategoryById(child._id);
        console.log('Updated Parent Status:', updatedParent.status);
        console.log('Updated Child Status:', updatedChild.status);

        if (updatedChild.status === 'DEACTIVE') {
            console.log('✅ Recursive deactivation success');
        } else {
            console.error('❌ Recursive deactivation failed');
        }

        // 4. Activate Parent
        console.log('Activating Parent...');
        await categoryService.updateCategory(parent._id, { status: 'ACTIVE' });

        const activatedChild = await categoryService.getCategoryById(child._id);
        console.log('Activated Child Status:', activatedChild.status);

        if (activatedChild.status === 'ACTIVE') {
            console.log('✅ Recursive activation success');
        } else {
            console.error('❌ Recursive activation failed');
        }

        // 5. Test deletion with children
        try {
            console.log('Attempting to delete parent with children...');
            await categoryService.deleteCategory(parent._id);
            console.error('❌ Deletion should have failed');
        } catch (err) {
            console.log('✅ Deletion failed as expected:', err.message);
        }

        // 6. Cleanup
        await Category.deleteOne({ _id: child._id });
        await Category.deleteOne({ _id: parent._id });
        console.log('Cleanup done');

        process.exit(0);
    } catch (err) {
        console.error('Verification Error:', err.message);
        if (err.stack) console.error(err.stack);
        process.exit(1);
    }
};

verify();
