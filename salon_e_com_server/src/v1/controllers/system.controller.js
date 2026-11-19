import SystemSettings from '../models/SystemSettings.js';
import upload from '../middleware/upload.middleware.js';

export const getSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();
        if (!settings) {
            // Create default settings if not exists
            settings = await SystemSettings.create({
                appName: 'Salon E-Comm'
            });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSettings = async (req, res) => {
    try {
        let updateData = { ...req.body };

        if (req.body.data) {
            try {
                const parsedData = JSON.parse(req.body.data);
                updateData = { ...updateData, ...parsedData };
            } catch (e) {
                console.warn('Failed to parse req.body.data JSON:', e);
            }
        }

        if (req.file) {
            let fileUrl = '';
            if (req.file.path && req.file.path.startsWith('http')) {
                fileUrl = req.file.path;
            } else {
                const protocol = req.protocol;
                const host = req.get('host');
                if (req.file.filename) {
                    fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
                }
            }
            if (fileUrl) {
                updateData.logoUrl = fileUrl;
            }
        }

        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = new SystemSettings(updateData);
        } else {
            Object.assign(settings, updateData);
        }

        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
