import { storage } from '../server/storage';
import bcrypt from 'bcrypt';
import { log } from '../server/utils/logger';

async function seedDemoData() {
  try {
    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const demoUser = await storage.createUser({
      username: 'demo',
      email: 'demo@example.com',
      password: hashedPassword
    });

    // Create demo templates
    const templates = [
      {
        name: 'Welcome Letter',
        content: 'Dear {{name}},\n\nWelcome to our community...',
        userId: demoUser.id
      },
      {
        name: 'Follow-up',
        content: 'Dear {{name}},\n\nThank you for your interest...',
        userId: demoUser.id
      }
    ];

    for (const template of templates) {
      await storage.createTemplate(template);
    }

    // Create demo recipients
    const recipients = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Acme Inc',
        address: '123 Main St, City, Country',
        userId: demoUser.id
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        company: 'Tech Corp',
        address: '456 Oak Ave, Town, Country',
        userId: demoUser.id
      }
    ];

    for (const recipient of recipients) {
      await storage.createRecipient(recipient);
    }

    // Create demo campaign
    await storage.createCampaign({
      name: 'Welcome Campaign',
      description: 'Initial welcome campaign for new contacts',
      status: 'draft',
      userId: demoUser.id
    });

    log.info('Demo data seeded successfully');
  } catch (error) {
    log.error('Error seeding demo data:', error);
    throw error;
  }
}

seedDemoData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed demo data:', error);
    process.exit(1);
  }); 