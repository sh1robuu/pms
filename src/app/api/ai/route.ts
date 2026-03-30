import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

interface AIResponse {
    answer: string;
    type: 'room_status' | 'guest_info' | 'availability' | 'arrivals' | 'departures' | 'housekeeping' | 'keys' | 'incidents' | 'stats' | 'help' | 'unknown';
    data?: unknown;
}

function normalizeQuery(q: string): string {
    return q.toLowerCase().trim()
        .replace(/[?!.,;:]+/g, '')
        .replace(/\s+/g, ' ');
}

function extractRoomNumber(q: string): string | null {
    const match = q.match(/(?:phòng|phong|room|rm)\s*(\d{2,4})/i) || q.match(/\b(\d{3,4})\b/);
    return match ? match[1] : null;
}

function extractGuestName(q: string): string | null {
    const patterns = [
        /(?:khách|khach|guest)\s+(.+?)(?:\?|$)/i,
        /(?:tìm|tim|find|search|look\s*up)\s+(.+?)(?:\?|$)/i,
    ];
    for (const p of patterns) {
        const m = q.match(p);
        if (m) return m[1].trim();
    }
    return null;
}

async function handleRoomQuery(roomNumber: string): Promise<AIResponse> {
    const room = await prisma.room.findUnique({
        where: { roomNumber },
        include: {
            currentOccupant: { select: { firstName: true, lastName: true, vipStatus: true } },
            assignedReservations: {
                where: { status: { in: ['CHECKED_IN', 'RESERVED'] } },
                include: { guest: { select: { firstName: true, lastName: true } } },
                take: 1,
            },
        },
    });

    if (!room) return { answer: `❌ Không tìm thấy phòng ${roomNumber} trong hệ thống.`, type: 'room_status' };

    const statusMap: Record<string, string> = {
        VACANT_CLEAN: '🟢 Trống - Sạch',
        VACANT_DIRTY: '🟡 Trống - Chưa dọn',
        OCCUPIED: '🔵 Đang có khách',
        OUT_OF_ORDER: '🔴 Hỏng / Bảo trì',
        CONFLICT: '🟠 Xung đột',
    };

    const hkMap: Record<string, string> = {
        CLEAN: 'Đã dọn ✅',
        DIRTY: 'Chưa dọn ⚠️',
        INSPECTED: 'Đã kiểm tra ✅',
    };

    let answer = `🏨 **Phòng ${room.roomNumber}** (Tầng ${room.floor} - ${room.roomType})\n`;
    answer += `📊 Trạng thái: ${statusMap[room.status] || room.status}\n`;
    answer += `🧹 Housekeeping: ${hkMap[room.housekeepingStatus] || room.housekeepingStatus}\n`;

    if (room.currentOccupant) {
        answer += `👤 Khách: ${room.currentOccupant.firstName} ${room.currentOccupant.lastName}`;
        if (room.currentOccupant.vipStatus) answer += ' ⭐ VIP';
        answer += '\n';
    }

    if (room.assignedReservations?.length > 0) {
        const res = room.assignedReservations[0];
        answer += `📋 Đặt phòng: ${res.guest.firstName} ${res.guest.lastName} (${res.status})\n`;
    }

    return { answer, type: 'room_status', data: room };
}

async function handleGuestQuery(name: string): Promise<AIResponse> {
    const guests = await prisma.guest.findMany({
        where: {
            OR: [
                { firstName: { contains: name, mode: 'insensitive' } },
                { lastName: { contains: name, mode: 'insensitive' } },
            ],
        },
        include: {
            reservations: {
                where: { status: { in: ['CHECKED_IN', 'RESERVED'] } },
                include: { assignedRoom: { select: { roomNumber: true } } },
                orderBy: { arrivalDate: 'desc' },
                take: 1,
            },
        },
        take: 5,
    });

    if (guests.length === 0) return { answer: `❌ Không tìm thấy khách nào tên "${name}".`, type: 'guest_info' };

    let answer = `👥 Tìm thấy ${guests.length} khách:\n\n`;
    for (const g of guests) {
        answer += `• **${g.firstName} ${g.lastName}**`;
        if (g.vipStatus) answer += ' ⭐ VIP';
        if (g.phone) answer += ` | 📞 ${g.phone}`;
        if (g.reservations.length > 0) {
            const r = g.reservations[0];
            answer += ` | ${r.status === 'CHECKED_IN' ? '✅ Đã check-in' : '📅 Đã đặt'}`;
            if (r.assignedRoom) answer += ` → Phòng ${r.assignedRoom.roomNumber}`;
        }
        answer += '\n';
    }

    return { answer, type: 'guest_info', data: guests };
}

async function handleAvailability(): Promise<AIResponse> {
    const rooms = await prisma.room.findMany({
        where: { status: 'VACANT_CLEAN' },
        orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    });

    if (rooms.length === 0) return { answer: '⚠️ Hiện không có phòng trống sạch nào.', type: 'availability' };

    let answer = `🟢 **${rooms.length} phòng trống sạch:**\n\n`;
    const byFloor: Record<number, typeof rooms> = {};
    for (const r of rooms) {
        if (!byFloor[r.floor]) byFloor[r.floor] = [];
        byFloor[r.floor].push(r);
    }

    for (const [floor, floorRooms] of Object.entries(byFloor)) {
        answer += `**Tầng ${floor}:** ${floorRooms.map(r => `${r.roomNumber} (${r.roomType})`).join(', ')}\n`;
    }

    return { answer, type: 'availability', data: rooms };
}

async function handleArrivals(): Promise<AIResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const arrivals = await prisma.reservation.findMany({
        where: { arrivalDate: { gte: today, lt: tomorrow }, status: { in: ['RESERVED', 'CHECKED_IN'] } },
        include: {
            guest: { select: { firstName: true, lastName: true, vipStatus: true } },
            assignedRoom: { select: { roomNumber: true } },
        },
        orderBy: { arrivalDate: 'asc' },
    });

    if (arrivals.length === 0) return { answer: '📅 Hôm nay không có khách nào check-in.', type: 'arrivals' };

    let answer = `📅 **${arrivals.length} khách đến hôm nay:**\n\n`;
    for (const a of arrivals) {
        const status = a.status === 'CHECKED_IN' ? '✅ Đã check-in' : '⏳ Chờ check-in';
        answer += `• **${a.guest.firstName} ${a.guest.lastName}**`;
        if (a.guest.vipStatus) answer += ' ⭐';
        answer += ` | ${status}`;
        if (a.assignedRoom) answer += ` → Phòng ${a.assignedRoom.roomNumber}`;
        else answer += ' | ⚠️ Chưa gán phòng';
        answer += ` | #${a.confirmationNumber}\n`;
    }

    return { answer, type: 'arrivals', data: arrivals };
}

async function handleDepartures(): Promise<AIResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const departures = await prisma.reservation.findMany({
        where: { departureDate: { gte: today, lt: tomorrow }, status: 'CHECKED_IN' },
        include: {
            guest: { select: { firstName: true, lastName: true } },
            assignedRoom: { select: { roomNumber: true } },
        },
    });

    if (departures.length === 0) return { answer: '📤 Hôm nay không có khách nào check-out.', type: 'departures' };

    let answer = `📤 **${departures.length} khách trả phòng hôm nay:**\n\n`;
    for (const d of departures) {
        answer += `• **${d.guest.firstName} ${d.guest.lastName}**`;
        if (d.assignedRoom) answer += ` → Phòng ${d.assignedRoom.roomNumber}`;
        answer += ` | #${d.confirmationNumber}\n`;
    }

    return { answer, type: 'departures', data: departures };
}

async function handleDirtyRooms(): Promise<AIResponse> {
    const rooms = await prisma.room.findMany({
        where: { OR: [{ housekeepingStatus: 'DIRTY' }, { status: 'VACANT_DIRTY' }] },
        orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    });

    if (rooms.length === 0) return { answer: '✅ Tất cả phòng đã được dọn sạch!', type: 'housekeeping' };

    let answer = `🧹 **${rooms.length} phòng cần dọn:**\n\n`;
    for (const r of rooms) {
        answer += `• Phòng **${r.roomNumber}** (Tầng ${r.floor} - ${r.roomType}) - ${r.status === 'OCCUPIED' ? '🔵 Có khách' : '🟡 Trống'}\n`;
    }

    return { answer, type: 'housekeeping', data: rooms };
}

async function handleIncidents(): Promise<AIResponse> {
    const incidents = await prisma.incident.findMany({
        where: { status: 'OPEN' },
        include: {
            room: { select: { roomNumber: true } },
            owner: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
    });

    if (incidents.length === 0) return { answer: '✅ Không có sự cố nào đang mở.', type: 'incidents' };

    let answer = `⚠️ **${incidents.length} sự cố đang mở:**\n\n`;
    for (const i of incidents) {
        answer += `• [${i.severity}] ${i.description}`;
        if (i.room) answer += ` → Phòng ${i.room.roomNumber}`;
        if (i.owner) answer += ` | Phụ trách: ${i.owner.name}`;
        answer += '\n';
    }

    return { answer, type: 'incidents', data: incidents };
}

async function handleStats(): Promise<AIResponse> {
    const [totalRooms, occupied, vacantClean, vacantDirty, outOfOrder, checkedIn, openIncidents] = await Promise.all([
        prisma.room.count(),
        prisma.room.count({ where: { status: 'OCCUPIED' } }),
        prisma.room.count({ where: { status: 'VACANT_CLEAN' } }),
        prisma.room.count({ where: { status: 'VACANT_DIRTY' } }),
        prisma.room.count({ where: { status: 'OUT_OF_ORDER' } }),
        prisma.reservation.count({ where: { status: 'CHECKED_IN' } }),
        prisma.incident.count({ where: { status: 'OPEN' } }),
    ]);

    const occupancy = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

    let answer = `📊 **Tổng quan khách sạn:**\n\n`;
    answer += `🏨 Tổng phòng: ${totalRooms} | Công suất: ${occupancy}%\n`;
    answer += `🔵 Đang ở: ${occupied} | 🟢 Trống sạch: ${vacantClean}\n`;
    answer += `🟡 Chưa dọn: ${vacantDirty} | 🔴 Bảo trì: ${outOfOrder}\n`;
    answer += `👤 Khách đang ở: ${checkedIn} | ⚠️ Sự cố mở: ${openIncidents}\n`;

    return { answer, type: 'stats' };
}

function getHelpMessage(): AIResponse {
    return {
        answer: `🤖 **Trợ lý Prisma PMS** - Các lệnh hỗ trợ:\n
• **"Phòng 223"** → Trạng thái phòng
• **"Khách John Smith"** → Tìm thông tin khách
• **"Phòng trống"** → Danh sách phòng có sẵn
• **"Check-in hôm nay"** → Khách đến hôm nay
• **"Check-out hôm nay"** → Khách trả phòng hôm nay
• **"Phòng chưa dọn"** → Phòng cần housekeeping
• **"Sự cố"** → Sự cố đang mở
• **"Tổng quan"** → Thống kê tổng quan
• **"Help"** → Hiển thị menu này`,
        type: 'help',
    };
}

async function processQuery(query: string): Promise<AIResponse> {
    const q = normalizeQuery(query);

    // Room query
    const roomNum = extractRoomNumber(q);
    if (roomNum) return handleRoomQuery(roomNum);

    // Guest query
    const guestName = extractGuestName(q);
    if (guestName) return handleGuestQuery(guestName);

    // Availability
    if (/phòng trống|phong trong|available|vacant|rooms?\s*free|còn phòng|con phong/i.test(q)) return handleAvailability();

    // Arrivals / Check-in today
    if (/check.?in|arrival|đến|den|khách.*hôm nay|khach.*hom nay/i.test(q)) return handleArrivals();

    // Departures / Check-out today
    if (/check.?out|departure|trả phòng|tra phong|đi|khách.*đi/i.test(q)) return handleDepartures();

    // Dirty rooms / Housekeeping
    if (/chưa dọn|chua don|dirty|dọn|don|housekeep|buồng phòng|buong phong|vệ sinh|ve sinh/i.test(q)) return handleDirtyRooms();

    // Incidents
    if (/sự cố|su co|incident|vấn đề|van de|problem|issue/i.test(q)) return handleIncidents();

    // Stats / Overview
    if (/tổng quan|tong quan|stats|overview|thống kê|thong ke|báo cáo|bao cao|report/i.test(q)) return handleStats();

    // Help
    if (/help|hướng dẫn|huong dan|trợ giúp|tro giup|menu|lệnh|lenh/i.test(q)) return getHelpMessage();

    // Unknown
    return {
        answer: `🤔 Tôi chưa hiểu câu hỏi "${query}".\n\nGõ **"help"** để xem danh sách lệnh hỗ trợ.`,
        type: 'unknown',
    };
}

export async function POST(req: NextRequest) {
    const authUser = requireAuth(req);
    if (authUser instanceof NextResponse) return authUser;

    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
        return NextResponse.json({ message: 'Query is required' }, { status: 400 });
    }

    try {
        const response = await processQuery(query);
        return NextResponse.json(response);
    } catch (error) {
        console.error('AI query error:', error);
        return NextResponse.json({
            answer: '❌ Đã xảy ra lỗi khi xử lý câu hỏi. Vui lòng thử lại.',
            type: 'unknown',
        });
    }
}
