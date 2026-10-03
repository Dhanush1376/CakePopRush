import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is missing');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) {
    console.error('Failed to get database instance');
    process.exit(1);
  }

  const collection = db.collection('customorderconfigs');
  const configs = await collection.find({}).toArray();
  console.log(`Found ${configs.length} CustomOrderConfig documents`);

  for (const config of configs) {
    let modified = false;

    if (config.types && Array.isArray(config.types)) {
      for (const type of config.types) {
        if (type.steps && Array.isArray(type.steps)) {
          for (const step of type.steps) {
            if (step.fields && Array.isArray(step.fields)) {
              for (const field of step.fields) {
                // If it's a textarea and placeholder is a phone or empty or "Describe Your Requirements..."
                if (field.type === 'textarea') {
                  const isPhonePlaceholder = field.placeholder && /^\+?[0-9\s()-]+$/.test(field.placeholder);
                  if (isPhonePlaceholder || !field.placeholder || field.placeholder === '+91 98765 43210') {
                    console.log(`Fixing textarea field ${field.id} ("${field.label}") placeholder from "${field.placeholder}" to descriptive placeholder`);
                    field.placeholder = 'Describe the occasion, colors, themes, flavors, or special design notes...';
                    modified = true;
                  }
                }
                
                // If it's a number field and label has quantity, ensure placeholder is "e.g. 12"
                if (field.type === 'number' && (!field.placeholder || field.placeholder === '')) {
                  if (field.label && field.label.toLowerCase().includes('quant')) {
                    field.placeholder = 'e.g. 12';
                    modified = true;
                  }
                }

                // If it's a phone field and placeholder is empty, set "+91 98765 43210"
                if (field.type === 'phone' && (!field.placeholder || field.placeholder === '')) {
                  field.placeholder = '+91 98765 43210';
                  modified = true;
                }

                // If it's a date field and placeholder is empty, set "Select date"
                if (field.type === 'date' && (!field.placeholder || field.placeholder === '')) {
                  field.placeholder = 'Select date';
                  modified = true;
                }
              }
            }
          }
        }
      }
    }

    if (modified) {
      console.log(`Updating config doc _id: ${config._id}, version: ${config.version}`);
      await collection.updateOne(
        { _id: config._id },
        { $set: { types: config.types, updatedAt: new Date() } }
      );
    }
  }

  console.log('All configs updated successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Error running migration:', err);
  process.exit(1);
});
