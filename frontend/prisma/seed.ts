import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
    console.log('Seeding database...');

    // Clean existing data
    await prisma.auditLog.deleteMany();
    await prisma.key.deleteMany();
    await prisma.alert.deleteMany();
    await prisma.incident.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.room.deleteMany();
    await prisma.guest.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash('password123', 12);

    // Create users
    const admin = await prisma.user.create({
        data: { email: 'admin@hotelpms.com', name: 'Sarah Admin', role: 'ADMIN', passwordHash },
    });
    const manager = await prisma.user.create({
        data: { email: 'manager@hotelpms.com', name: 'James Manager', role: 'MANAGER', passwordHash },
    });
    const frontDesk1 = await prisma.user.create({
        data: { email: 'front1@hotelpms.com', name: 'Emily Chen', role: 'FRONT_DESK', passwordHash },
    });
    const frontDesk2 = await prisma.user.create({
        data: { email: 'front2@hotelpms.com', name: 'Michael Park', role: 'FRONT_DESK', passwordHash },
    });
    const housekeeper = await prisma.user.create({
        data: { email: 'housekeeping@hotelpms.com', name: 'Maria Garcia', role: 'HOUSEKEEPING', passwordHash },
    });
    console.log('Users created');

    // Create 50 rooms across 5 floors
    const rooms: any[] = [];
    for (let floor = 1; floor <= 5; floor++) {
        for (let i = 1; i <= 10; i++) {
            const roomNum = floor.toString() + i.toString().padStart(2, '0');
            let roomType = 'STANDARD';
            if (i >= 9) roomType = 'SUITE';
            else if (i >= 7) roomType = 'DELUXE';
            else if (i === 5 || i === 6) roomType = 'CONNECTING';
            if (floor === 5 && i === 10) roomType = 'PRESIDENTIAL';

            let status = 'VACANT_CLEAN';
            let housekeepingStatus = 'CLEAN';
            let outOfOrderReason: string | null = null;

            if (roomNum === '203') { status = 'OUT_OF_ORDER'; outOfOrderReason = 'Bathroom renovation'; }
            else if (roomNum === '401') { status = 'VACANT_DIRTY'; housekeepingStatus = 'DIRTY'; }
            else if (roomNum === '402') { status = 'VACANT_DIRTY'; housekeepingStatus = 'IN_PROGRESS'; }

            const room = await prisma.room.create({
                data: {
                    roomNumber: roomNum,
                    roomType,
                    floor,
                    status,
                    housekeepingStatus,
                    outOfOrderReason,
                    isConnecting: roomType === 'CONNECTING',
                },
            });
            rooms.push(room);
        }
    }

    // Link connecting rooms
    for (let floor = 1; floor <= 5; floor++) {
        const r5 = rooms.find((r: any) => r.roomNumber === floor.toString() + '05');
        const r6 = rooms.find((r: any) => r.roomNumber === floor.toString() + '06');
        if (r5 && r6) {
            await prisma.room.update({ where: { id: r5.id }, data: { connectingRoomId: r6.id } });
            await prisma.room.update({ where: { id: r6.id }, data: { connectingRoomId: r5.id } });
        }
    }
    console.log('50 rooms created');

    // Create guests
    const guestsData = [
        { firstName: 'John', lastName: 'Anderson', email: 'john.anderson@email.com', phone: '+1-555-0101', vipStatus: true },
        { firstName: 'Lisa', lastName: 'Williams', email: 'lisa.williams@email.com', phone: '+1-555-0102', vipStatus: true },
        { firstName: 'Robert', lastName: 'Johnson', email: 'robert.j@email.com', phone: '+1-555-0103', vipStatus: false },
        { firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@email.com', phone: '+1-555-0104', vipStatus: false },
        { firstName: 'David', lastName: 'Brown', email: 'david.brown@email.com', phone: '+1-555-0105', vipStatus: false },
        { firstName: 'Jennifer', lastName: 'Davis', email: 'jennifer.d@email.com', phone: '+1-555-0106', vipStatus: true },
        { firstName: 'James', lastName: 'Wilson', email: 'james.w@email.com', phone: '+1-555-0107', vipStatus: false },
        { firstName: 'Sarah', lastName: 'Taylor', email: 'sarah.t@email.com', phone: '+1-555-0108', vipStatus: false },
        { firstName: 'Michael', lastName: 'Thomas', email: 'michael.t@email.com', phone: '+1-555-0109', vipStatus: false },
        { firstName: 'Emma', lastName: 'Martinez', email: 'emma.m@email.com', phone: '+1-555-0110', vipStatus: true },
        { firstName: 'Daniel', lastName: 'Lee', email: 'daniel.lee@email.com', phone: '+1-555-0111', vipStatus: false },
        { firstName: 'Sophia', lastName: 'Clark', email: 'sophia.c@email.com', phone: '+1-555-0112', vipStatus: false },
        { firstName: 'William', lastName: 'Hall', email: 'william.h@email.com', phone: '+1-555-0113', vipStatus: false },
        { firstName: 'Olivia', lastName: 'Allen', email: 'olivia.a@email.com', phone: '+1-555-0114', vipStatus: true },
        { firstName: 'Alexander', lastName: 'Young', email: 'alex.y@email.com', phone: '+1-555-0115', vipStatus: false },
        { firstName: 'Isabella', lastName: 'King', email: 'isabella.k@email.com', phone: '+1-555-0116', vipStatus: false },
        { firstName: 'Benjamin', lastName: 'Wright', email: 'benjamin.w@email.com', phone: '+1-555-0117', vipStatus: false },
        { firstName: 'Charlotte', lastName: 'Lopez', email: 'charlotte.l@email.com', phone: '+1-555-0118', vipStatus: false },
        { firstName: 'Henry', lastName: 'Hill', email: 'henry.h@email.com', phone: '+1-555-0119', vipStatus: true },
        { firstName: 'Amelia', lastName: 'Scott', email: 'amelia.s@email.com', phone: '+1-555-0120', vipStatus: false },
    ];

    const guests: any[] = [];
    for (const g of guestsData) {
        const guest = await prisma.guest.create({ data: g });
        guests.push(guest);
    }
    console.log('20 guests created');

    // Create reservations
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);
    const threeDays = new Date(today); threeDays.setDate(today.getDate() + 3);
    const fourDays = new Date(today); fourDays.setDate(today.getDate() + 4);
    const fiveDays = new Date(today); fiveDays.setDate(today.getDate() + 5);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

    // Today's arrivals
    const res1 = await prisma.reservation.create({
        data: {
            confirmationNumber: 'RES-001-VIP',
            guestId: guests[0].id,
            assignedRoomId: rooms.find((r: any) => r.roomNumber === '301')?.id,
            arrivalDate: today,
            departureDate: threeDays,
            status: 'RESERVED',
            isVip: true,
        },
    });

    const res2 = await prisma.reservation.create({
        data: {
            confirmationNumber: 'RES-002-STD',
            guestId: guests[2].id,
            assignedRoomId: rooms.find((r: any) => r.roomNumber === '102')?.id,
            arrivalDate: today,
            departureDate: dayAfter,
            status: 'RESERVED',
        },
    });

    const res3 = await prisma.reservation.create({
        data: {
            confirmationNumber: 'RES-003-DLX',
            guestId: guests[3].id,
            arrivalDate: today,
            departureDate: fourDays,
            status: 'RESERVED',
            notes: 'Needs quiet room, away from elevator',
        },
    });

    const res4 = await prisma.reservation.create({
        data: {
            confirmationNumber: 'RES-004-VIP',
            guestId: guests[1].id,
            arrivalDate: today,
            departureDate: fiveDays,
            status: 'RESERVED',
            isVip: true,
            notes: 'VIP - Corporate client, needs suite',
        },
    });

    const connectingGroupId = 'CG-001';
    const res5 = await prisma.reservation.create({
        data: {
            confirmationNumber: 'RES-005-CON-A',
            guestId: guests[4].id,
            assignedRoomId: rooms.find((r: any) => r.roomNumber === '105')?.id,
            arrivalDate: today,
            departureDate: threeDays,
            status: 'RESERVED',
            isConnecting: true,
            connectingGroupId,
        },
    });

    const res6 = await prisma.reservation.create({
        data: {
            confirmationNumber: 'RES-005-CON-B',
            guestId: guests[5].id,
            assignedRoomId: rooms.find((r: any) => r.roomNumber === '106')?.id,
            arrivalDate: today,
            departureDate: threeDays,
            status: 'RESERVED',
            isConnecting: true,
            connectingGroupId,
            isVip: true,
        },
    });

    // Checked-in guests
    const room201 = rooms.find((r: any) => r.roomNumber === '201');
    const res7 = await prisma.reservation.create({
        data: {
            confirmationNumber: 'RES-006-CHK',
            guestId: guests[6].id,
            assignedRoomId: room201?.id,
            arrivalDate: yesterday,
            departureDate: today,
            status: 'CHECKED_IN',
            checkedInAt: yesterday,
        },
    });
    if (room201) {
        await prisma.room.update({
            where: { id: room201.id },
            data: { status: 'OCCUPIED', currentOccupantId: guests[6].id },
        });
    }

    const room302 = rooms.find((r: any) => r.roomNumber === '302');
    const res8 = await prisma.reservation.create({
        data: {
            confirmationNumber: 'RES-007-CHK',
            guestId: guests[7].id,
            assignedRoomId: room302?.id,
            arrivalDate: yesterday,
            departureDate: tomorrow,
            status: 'CHECKED_IN',
            checkedInAt: yesterday,
        },
    });
    if (room302) {
        await prisma.room.update({
            where: { id: room302.id },
            data: { status: 'OCCUPIED', currentOccupantId: guests[7].id },
        });
    }

    const room509 = rooms.find((r: any) => r.roomNumber === '509');
    const res9 = await prisma.reservation.create({
        data: {
            confirmationNumber: 'RES-008-VIP',
            guestId: guests[9].id,
            assignedRoomId: room509?.id,
            arrivalDate: yesterday,
            departureDate: dayAfter,
            status: 'CHECKED_IN',
            checkedInAt: yesterday,
            isVip: true,
        },
    });
    if (room509) {
        await prisma.room.update({
            where: { id: room509.id },
            data: { status: 'OCCUPIED', currentOccupantId: guests[9].id },
        });
    }

    // Tomorrow arrivals
    await prisma.reservation.create({
        data: {
            confirmationNumber: 'RES-009-TMR',
            guestId: guests[10].id,
            assignedRoomId: rooms.find((r: any) => r.roomNumber === '103')?.id,
            arrivalDate: tomorrow,
            departureDate: fourDays,
            status: 'RESERVED',
        },
    });

    await prisma.reservation.create({
        data: {
            confirmationNumber: 'RES-010-TMR',
            guestId: guests[11].id,
            arrivalDate: tomorrow,
            departureDate: fiveDays,
            status: 'RESERVED',
            isVip: true,
            notes: 'Anniversary trip',
        },
    });
    console.log('Reservations created');

    // Incidents
    await prisma.incident.create({
        data: {
            type: 'ROOM_CONFLICT', severity: 'HIGH',
            roomId: room201?.id, reservationId: res7.id,
            rootCause: 'ROOM_OCCUPANCY_CONFLICT',
            description: 'Double booking detected for room 201 during peak hours',
            status: 'OPEN',
        },
    });
    await prisma.incident.create({
        data: {
            type: 'VIP_RISK', severity: 'CRITICAL',
            reservationId: res4.id, guestId: guests[1].id,
            rootCause: 'VIP_NO_ROOM',
            description: 'VIP guest Lisa Williams arriving today with no room assigned',
            status: 'OPEN',
        },
    });
    await prisma.incident.create({
        data: {
            type: 'UNREADY_ROOM', severity: 'MEDIUM',
            roomId: rooms.find((r: any) => r.roomNumber === '401')?.id,
            rootCause: 'ROOM_NOT_READY',
            description: 'Room 401 still dirty - housekeeping delayed',
            status: 'INVESTIGATING', ownerId: housekeeper.id,
        },
    });
    console.log('Incidents created');

    // Alerts
    await prisma.alert.create({ data: { type: 'VIP_ARRIVAL_RISK', severity: 'CRITICAL', message: 'VIP guest Lisa Williams arriving today - no room assigned!', reservationId: res4.id } });
    await prisma.alert.create({ data: { type: 'ROOM_CONFLICT', severity: 'HIGH', message: 'Potential conflict detected for Room 201', roomId: room201?.id } });
    await prisma.alert.create({ data: { type: 'CONNECTING_ROOM_CHECK', severity: 'MEDIUM', message: 'Connecting rooms 105-106 need inspection before VIP arrival', roomId: rooms.find((r: any) => r.roomNumber === '105')?.id } });
    await prisma.alert.create({ data: { type: 'KEY_ISSUED', severity: 'LOW', message: 'Key issued for Room 302 - Guest: Sarah Taylor', roomId: room302?.id, reservationId: res8.id } });
    console.log('Alerts created');

    // Keys
    if (room302) {
        await prisma.key.create({
            data: { reservationId: res8.id, roomId: room302.id, guestId: guests[7].id, issuedById: frontDesk1.id, keyCode: 'KEY-ABC12345', status: 'ACTIVE' },
        });
    }
    if (room509) {
        await prisma.key.create({
            data: { reservationId: res9.id, roomId: room509.id, guestId: guests[9].id, issuedById: frontDesk1.id, keyCode: 'KEY-VIP98765', status: 'ACTIVE' },
        });
    }
    console.log('Keys issued');

    // Audit logs
    await prisma.auditLog.createMany({
        data: [
            { action: 'CHECK_IN', entityType: 'Reservation', entityId: res7.id, userId: frontDesk1.id, details: '{"room":"201"}' },
            { action: 'CHECK_IN', entityType: 'Reservation', entityId: res8.id, userId: frontDesk1.id, details: '{"room":"302"}' },
            { action: 'KEY_ISSUED', entityType: 'Key', entityId: 'seed', userId: frontDesk1.id, details: '{"room":"302","guest":"Sarah Taylor"}' },
            { action: 'CHECK_IN', entityType: 'Reservation', entityId: res9.id, userId: frontDesk2.id, details: '{"room":"509","vip":true}' },
            { action: 'KEY_ISSUED', entityType: 'Key', entityId: 'seed', userId: frontDesk2.id, details: '{"room":"509","guest":"Emma Martinez"}' },
            { action: 'ROOM_STATUS_CHANGED', entityType: 'Room', entityId: rooms.find((r: any) => r.roomNumber === '203')?.id || '', userId: manager.id, details: '{"from":"VACANT_CLEAN","to":"OUT_OF_ORDER"}' },
        ],
    });
    console.log('Audit logs created');

    console.log('');
    console.log('Database seeded successfully!');
    console.log('');
    console.log('Login credentials (all passwords: password123):');
    console.log('  Admin:        admin@hotelpms.com');
    console.log('  Manager:      manager@hotelpms.com');
    console.log('  Front Desk:   front1@hotelpms.com');
    console.log('  Front Desk:   front2@hotelpms.com');
    console.log('  Housekeeping: housekeeping@hotelpms.com');
}

seed()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
