import { PrismaClient, Role, HostelGender, BedType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CUEA Gaba Hostel database...');

  // Admin user
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cuea.edu' },
    update: {},
    create: {
      email: 'admin@cuea.edu',
      password: adminPassword,
      role: Role.ADMIN,
      firstName: 'System',
      lastName: 'Admin',
      phone: '0712000000',
      isVerified: true,
    },
  });
  console.log(`Admin: ${admin.email}`);

  // Demo student
  const studentPassword = await bcrypt.hash('Student@1234', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@cuea.edu' },
    update: {},
    create: {
      email: 'student@cuea.edu',
      password: studentPassword,
      role: Role.STUDENT,
      firstName: 'Jane',
      lastName: 'Doe',
      studentId: 'CUEA/2024/001',
      phone: '0712345678',
      course: 'BSc Computer Science',
      yearOfStudy: 2,
      isVerified: true,
    },
  });
  console.log(`Student: ${student.email}`);

  // Hostels
  const hostelsData = [
    {
      name: 'St. Mary Hostel',
      description: 'Female-only hostel with en-suite rooms and 24/7 security.',
      address: 'Block A, Gaba Campus',
      gender: HostelGender.FEMALE,
      rooms: [
        { roomNumber: 'A101', floor: 1, beds: [
          { bedNumber: '1', type: BedType.SINGLE, price: 35000 },
          { bedNumber: '2', type: BedType.SINGLE, price: 35000 },
        ]},
        { roomNumber: 'A102', floor: 1, beds: [
          { bedNumber: '1', type: BedType.SINGLE, price: 35000 },
          { bedNumber: '2', type: BedType.SINGLE, price: 35000 },
        ]},
        { roomNumber: 'A201', floor: 2, beds: [
          { bedNumber: '1', type: BedType.DOUBLE, price: 45000 },
          { bedNumber: '2', type: BedType.DOUBLE, price: 45000 },
        ]},
      ],
    },
    {
      name: 'Aquinas Hostel',
      description: 'Male hostel — spacious rooms with study areas.',
      address: 'Block B, Gaba Campus',
      gender: HostelGender.MALE,
      rooms: [
        { roomNumber: 'B101', floor: 1, beds: [
          { bedNumber: '1', type: BedType.SINGLE, price: 32000 },
          { bedNumber: '2', type: BedType.SINGLE, price: 32000 },
          { bedNumber: '3', type: BedType.SINGLE, price: 32000 },
        ]},
        { roomNumber: 'B102', floor: 1, beds: [
          { bedNumber: '1', type: BedType.SINGLE, price: 32000 },
          { bedNumber: '2', type: BedType.SINGLE, price: 32000 },
        ]},
      ],
    },
    {
      name: 'Fatima Hostel',
      description: 'Mixed hostel with shared common rooms and kitchenettes.',
      address: 'Block C, Gaba Campus',
      gender: HostelGender.MIXED,
      rooms: [
        { roomNumber: 'C101', floor: 1, beds: [
          { bedNumber: '1', type: BedType.SINGLE, price: 30000 },
          { bedNumber: '2', type: BedType.SINGLE, price: 30000 },
        ]},
        { roomNumber: 'C201', floor: 2, beds: [
          { bedNumber: '1', type: BedType.DOUBLE, price: 40000 },
        ]},
      ],
    },
  ];

  for (const hostelData of hostelsData) {
    const { rooms, ...hostelFields } = hostelData;
    const hostel = await prisma.hostel.upsert({
      where: { id: hostelData.name }, // won't match, will always create on first run
      update: {},
      create: hostelFields,
    }).catch(async () => {
      return prisma.hostel.findFirst({ where: { name: hostelData.name } });
    });

    if (!hostel) continue;
    console.log(`Hostel: ${hostel.name}`);

    for (const roomData of rooms) {
      const { beds, ...roomFields } = roomData;
      let room = await prisma.room.findUnique({
        where: { hostelId_roomNumber: { hostelId: hostel.id, roomNumber: roomFields.roomNumber } },
      });
      if (!room) {
        room = await prisma.room.create({ data: { ...roomFields, hostelId: hostel.id } });
      }

      for (const bedData of beds) {
        const exists = await prisma.bed.findUnique({
          where: { roomId_bedNumber: { roomId: room.id, bedNumber: bedData.bedNumber } },
        });
        if (!exists) {
          await prisma.bed.create({
            data: {
              roomId: room.id,
              bedNumber: bedData.bedNumber,
              type: bedData.type,
              pricePerSemester: bedData.price,
            },
          });
        }
      }
    }
  }

  console.log('Seed complete!');
  console.log('Admin login: admin@cuea.edu / Admin@1234');
  console.log('Student login: student@cuea.edu / Student@1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
