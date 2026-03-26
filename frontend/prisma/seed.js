const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await prisma.auditLog.deleteMany();
    await prisma.alert.deleteMany();
    await prisma.incident.deleteMany();
    await prisma.key.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.room.deleteMany();
    await prisma.guest.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    const hash = await bcrypt.hash('password123', 10);
    const users = await Promise.all([
        prisma.user.create({ data: { id: uuidv4(), email: 'admin@hotelpms.com', name: 'Admin User', role: 'ADMIN', passwordHash: hash } }),
        prisma.user.create({ data: { id: uuidv4(), email: 'manager@hotelpms.com', name: 'Sarah Manager', role: 'MANAGER', passwordHash: hash } }),
        prisma.user.create({ data: { id: uuidv4(), email: 'front1@hotelpms.com', name: 'Mike Front Desk', role: 'FRONT_DESK', passwordHash: hash } }),
        prisma.user.create({ data: { id: uuidv4(), email: 'housekeeping@hotelpms.com', name: 'Lisa Housekeeping', role: 'HOUSEKEEPING', passwordHash: hash } }),
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Create rooms (3 floors, 8 rooms each)
    const roomTypes = ['STANDARD', 'DELUXE', 'SUITE', 'STANDARD', 'DELUXE', 'STANDARD', 'SUITE', 'STANDARD'];
    const statuses = ['VACANT_CLEAN', 'VACANT_CLEAN', 'VACANT_DIRTY', 'VACANT_CLEAN', 'VACANT_CLEAN', 'VACANT_CLEAN', 'VACANT_DIRTY', 'VACANT_CLEAN'];
    const hkStatuses = ['CLEAN', 'CLEAN', 'DIRTY', 'CLEAN', 'INSPECTED', 'CLEAN', 'DIRTY', 'CLEAN'];
    const rooms = [];
    for (let floor = 1; floor <= 3; floor++) {
        for (let r = 1; r <= 8; r++) {
            const idx = r - 1;
            const room = await prisma.room.create({
                data: {
                    id: uuidv4(),
                    roomNumber: `${floor}0${r}`,
                    roomType: roomTypes[idx],
                    floor,
                    status: statuses[idx],
                    housekeepingStatus: hkStatuses[idx],
                },
            });
            rooms.push(room);
        }
    }
    console.log(`✅ Created ${rooms.length} rooms`);

    // Create guests
    const guestData = [
        { firstName: 'John', lastName: 'Smith', email: 'jsmith@email.com', phone: '+1-555-0101', idNumber: 'P12345678', vipStatus: true },
        { firstName: 'Emma', lastName: 'Johnson', email: 'ejohnson@email.com', phone: '+1-555-0102', idNumber: 'P23456789', vipStatus: false },
        { firstName: 'David', lastName: 'Williams', email: 'dwilliams@email.com', phone: '+1-555-0103', idNumber: 'P34567890', vipStatus: true },
        { firstName: 'Sophia', lastName: 'Brown', email: 'sbrown@email.com', phone: '+1-555-0104', idNumber: 'P45678901', vipStatus: false },
        { firstName: 'James', lastName: 'Davis', email: 'jdavis@email.com', phone: '+1-555-0105', idNumber: 'P56789012', vipStatus: false },
        { firstName: 'Olivia', lastName: 'Miller', email: 'omiller@email.com', phone: '+1-555-0106', idNumber: 'P67890123', vipStatus: true },
    ];
    const guests = await Promise.all(guestData.map((g) => prisma.guest.create({ data: { id: uuidv4(), ...g } })));
    console.log(`✅ Created ${guests.length} guests`);

    // Create reservations (today's arrivals + checked-in)
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today); dayAfter.setDate(dayAfter.getDate() + 2);
    const threeDays = new Date(today); threeDays.setDate(threeDays.getDate() + 3);

    const reservations = await Promise.all([
        prisma.reservation.create({
            data: { id: uuidv4(), confirmationNumber: 'RES-2024-001', guestId: guests[0].id, assignedRoomId: rooms[0].id, arrivalDate: today, departureDate: threeDays, status: 'CHECKED_IN', isVip: true, checkedInAt: today },
        }),
        prisma.reservation.create({
            data: { id: uuidv4(), confirmationNumber: 'RES-2024-002', guestId: guests[1].id, assignedRoomId: rooms[3].id, arrivalDate: today, departureDate: tomorrow, status: 'CHECKED_IN', checkedInAt: today },
        }),
        prisma.reservation.create({
            data: { id: uuidv4(), confirmationNumber: 'RES-2024-003', guestId: guests[2].id, arrivalDate: today, departureDate: dayAfter, status: 'RESERVED', isVip: true },
        }),
        prisma.reservation.create({
            data: { id: uuidv4(), confirmationNumber: 'RES-2024-004', guestId: guests[3].id, arrivalDate: today, departureDate: threeDays, status: 'RESERVED' },
        }),
        prisma.reservation.create({
            data: { id: uuidv4(), confirmationNumber: 'RES-2024-005', guestId: guests[4].id, arrivalDate: tomorrow, departureDate: threeDays, status: 'RESERVED' },
        }),
        prisma.reservation.create({
            data: { id: uuidv4(), confirmationNumber: 'RES-2024-006', guestId: guests[5].id, assignedRoomId: rooms[9].id, arrivalDate: today, departureDate: tomorrow, status: 'CHECKED_IN', isVip: true, checkedInAt: today },
        }),
    ]);
    console.log(`✅ Created ${reservations.length} reservations`);

    // Update occupied rooms
    await prisma.room.update({ where: { id: rooms[0].id }, data: { status: 'OCCUPIED', currentOccupantId: guests[0].id } });
    await prisma.room.update({ where: { id: rooms[3].id }, data: { status: 'OCCUPIED', currentOccupantId: guests[1].id } });
    await prisma.room.update({ where: { id: rooms[9].id }, data: { status: 'OCCUPIED', currentOccupantId: guests[5].id } });

    // Create some keys
    await prisma.key.create({
        data: { id: uuidv4(), reservationId: reservations[0].id, roomId: rooms[0].id, guestId: guests[0].id, issuedById: users[2].id, keyCode: `KEY-${Date.now()}-001`, status: 'ACTIVE' },
    });
    await prisma.key.create({
        data: { id: uuidv4(), reservationId: reservations[1].id, roomId: rooms[3].id, guestId: guests[1].id, issuedById: users[2].id, keyCode: `KEY-${Date.now()}-002`, status: 'ACTIVE' },
    });
    console.log('✅ Created keys');

    // Create alerts
    await prisma.alert.create({
        data: { id: uuidv4(), type: 'VIP_ARRIVAL', severity: 'HIGH', message: 'VIP guest John Smith arriving today - Suite 101', roomId: rooms[0].id, reservationId: reservations[0].id },
    });
    await prisma.alert.create({
        data: { id: uuidv4(), type: 'ROOM_DIRTY', severity: 'MEDIUM', message: 'Room 103 needs cleaning - guest departed', roomId: rooms[2].id },
    });
    await prisma.alert.create({
        data: { id: uuidv4(), type: 'VIP_ARRIVAL', severity: 'HIGH', message: 'VIP guest David Williams expected today - no room assigned', reservationId: reservations[2].id },
    });
    console.log('✅ Created alerts');

    // Create an incident
    await prisma.incident.create({
        data: { id: uuidv4(), type: 'MAINTENANCE', severity: 'MEDIUM', roomId: rooms[6].id, rootCause: 'AC malfunction', description: 'Air conditioning unit making loud noise in room 207', status: 'OPEN', ownerId: users[1].id },
    });
    console.log('✅ Created incidents');

    // Create audit logs
    await prisma.auditLog.create({
        data: { id: uuidv4(), action: 'CHECK_IN', entityType: 'Reservation', entityId: reservations[0].id, userId: users[2].id, details: JSON.stringify({ guest: 'John Smith', room: '101' }) },
    });
    await prisma.auditLog.create({
        data: { id: uuidv4(), action: 'KEY_ISSUED', entityType: 'Key', entityId: reservations[0].id, userId: users[2].id, details: JSON.stringify({ room: '101', guest: 'John Smith' }) },
    });
    console.log('✅ Created audit logs');

    console.log('\n🎉 Seed complete!');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
