import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
dotenv.config();

import { User } from './src/entities/user.entity';
import { Customer } from './src/entities/customer.entity';
import { Provider } from './src/entities/provider.entity';
import { Category } from './src/entities/category.entity';
import { Service } from './src/entities/service.entity';
import { ProviderService } from './src/entities/provider-service.entity';
import { Address } from './src/entities/address.entity';
import { Schedule } from './src/entities/schedule.entity';
import { Booking } from './src/entities/booking.entity';
import { Payment } from './src/entities/payment.entity';
import { Review } from './src/entities/review.entity';
import { Notification } from './src/entities/notification.entity';
import { BookingService } from './src/entities/booking-service.entity';
import { NotificationType } from './src/common/enums/notification_type.enum';

async function seed() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'test_db',
    entities: [User, Customer, Provider, Category, Service, ProviderService, Address, Schedule, Booking, Payment, Review, Notification, BookingService],
  });

  await dataSource.initialize();
  console.log('Connected. Wiping old data to ensure unique realistic seeds...');
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
  await dataSource.query('TRUNCATE TABLE schedules');
  await dataSource.query('TRUNCATE TABLE reviews');
  await dataSource.query('TRUNCATE TABLE payments');
  await dataSource.query('TRUNCATE TABLE notifications');
  await dataSource.query('TRUNCATE TABLE booking_services');
  await dataSource.query('TRUNCATE TABLE bookings');
  await dataSource.query('TRUNCATE TABLE provider_services');
  await dataSource.query('TRUNCATE TABLE addresses');
  await dataSource.query('TRUNCATE TABLE users');
  await dataSource.query('TRUNCATE TABLE services');
  await dataSource.query('TRUNCATE TABLE categories');
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('Old data cleared!');
  
  // 1. Categories
  const categories: Category[] = [];
  const catNames = ['Cleaning', 'Plumbing', 'Electrical', 'Painting', 'Landscaping', 'Pest Control', 'Roofing', 'HVAC', 'Moving', 'Appliance Repair'];
  for (const name of catNames) {
    let cat = await dataSource.manager.findOne(Category, { where: { categoryName: name } });
    if (!cat) {
      cat = dataSource.manager.create(Category, { categoryName: name, description: faker.lorem.sentence() });
      await dataSource.manager.save(cat);
    }
    categories.push(cat);
  }

  // 2. Services
  const services: Service[] = [];
  for (let i = 0; i < 20; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const s = dataSource.manager.create(Service, {
      name: faker.commerce.productName() + ' ' + faker.commerce.productAdjective() + ' Service',
      description: faker.lorem.sentences(2),
      category: category,
    });
    await dataSource.manager.save(s);
    services.push(s);
  }

  // 3. Customers
  const customers: Customer[] = [];
  for (let i = 0; i < 15; i++) {
    const c = dataSource.manager.create(Customer, {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.string.numeric(10),
      password: 'password123',
      role: 'customer'
    });
    await dataSource.manager.save(c);
    customers.push(c);
  }

  // 4. Providers
  const providers: Provider[] = [];
  for (let i = 0; i < 10; i++) {
    const p = dataSource.manager.create(Provider, {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.string.numeric(10),
      password: 'password123',
      role: 'provider',
      experience: faker.number.int({ min: 1, max: 20 }),
    });
    await dataSource.manager.save(p);
    providers.push(p);
  }

  // 5. Provider Services
  for (let i = 0; i < 30; i++) {
    const p = providers[Math.floor(Math.random() * providers.length)];
    const s = services[Math.floor(Math.random() * services.length)];
    
    // Check if combo exists
    const exists = await dataSource.manager.findOne(ProviderService, { where: { provider: { userId: p.userId }, service: { serviceId: s.serviceId } } });
    if (!exists) {
       const ps = dataSource.manager.create(ProviderService, {
         provider: p,
         service: s,
         price: faker.number.int({ min: 50, max: 500 })
       });
       await dataSource.manager.save(ps);
    }
  }

  // 6. Addresses
  const addresses: Address[] = [];
  for(const user of [...customers, ...providers]) {
     const addr = dataSource.manager.create(Address, {
         user: user,
         street: faker.location.streetAddress(),
         city: faker.location.city(),
         state: faker.location.state(),
         zipCode: faker.location.zipCode()
     });
     await dataSource.manager.save(addr);
     addresses.push(addr);
  }

  // 7. Schedules for Providers
  for(const provider of providers) {
    for (let i = 0; i < 3; i++) {
      const schedule = dataSource.manager.create(Schedule, {
        provider: provider,
        date: faker.date.future(),
        timeSlot: `${faker.number.int({ min: 8, max: 12 })}:00 - ${faker.number.int({ min: 13, max: 17 })}:00`,
      });
      await dataSource.manager.save(schedule);
    }
  }

  // 8. Notifications
  for(const user of [...customers, ...providers]) {
     const notif = dataSource.manager.create(Notification, {
        user: user,
        title: 'Welcome to LSM',
        message: 'Thank you for joining our platform.',
        type: NotificationType.SYSTEM_ALERT,
        isRead: false,
        isSent: true,
     });
     await dataSource.manager.save(notif);
  }

  // 9. Bookings
  const statuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  for (let i = 0; i < 30; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const address = addresses.find(a => a.user.userId === customer.userId) || addresses[0];
    
    const bookingStatus = statuses[Math.floor(Math.random() * statuses.length)];

    const b = dataSource.manager.create(Booking, {
      customer: customer,
      provider: provider,
      address: address,
      status: bookingStatus,
      date: faker.date.recent(),
      totalAmount: faker.number.int({ min: 100, max: 1000 }),
    });
    await dataSource.manager.save(b);

    // 10. Booking Services
    const numServices = faker.number.int({ min: 1, max: 3 });
    for (let j = 0; j < numServices; j++) {
      const s = services[Math.floor(Math.random() * services.length)];
      const bs = dataSource.manager.create(BookingService, {
        booking: b,
        service: s,
        serviceStatus: bookingStatus === 'COMPLETED' ? 'COMPLETED' : 'PENDING'
      });
      await dataSource.manager.save(bs);
    }

    // 11. Payments for Bookings
    const payment = dataSource.manager.create(Payment, {
      booking: b,
      paymentStatus: bookingStatus === 'COMPLETED' ? 'PAID' : 'UNPAID',
      method: 'CREDIT_CARD',
      amount: b.totalAmount,
      date: b.date,
    });
    await dataSource.manager.save(payment);

    // 12. Reviews for completed Bookings
    if (bookingStatus === 'COMPLETED') {
       const review = dataSource.manager.create(Review, {
         booking: b,
         rating: faker.number.int({ min: 3, max: 5 }),
         comment: faker.lorem.sentence()
       });
       await dataSource.manager.save(review);
    }
    
    // Notification for booking
    const notif = dataSource.manager.create(Notification, {
      user: customer,
      title: `Booking ${bookingStatus}`,
      message: `Your booking status is now ${bookingStatus}`,
      type: NotificationType.BOOKING_CREATED,
      isRead: false,
    });
    await dataSource.manager.save(notif);
  }

  console.log('Seeded successfully!');
  await dataSource.destroy();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
