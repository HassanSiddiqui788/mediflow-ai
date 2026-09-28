import 'dotenv/config';
import 'temporal-polyfill/global';
import { db } from './db';
import {
  MOCK_PATIENTS,
  MOCK_APPOINTMENTS,
  MOCK_EMERGENCY_PATIENTS,
  MOCK_BEDS,
  MOCK_LAB_TESTS,
} from './mock-data';

export async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Patients
  console.log(`Checking existing patients in PostgreSQL...`);
  const existingPatients = await db.orm.public.Patient.all();
  console.log(`Found ${existingPatients.length} existing patients.`);

  const patientMap = new Map<string, number>();

  for (const p of existingPatients) {
    patientMap.set(p.patientCode, p.id);
  }

  for (const p of MOCK_PATIENTS) {
    if (!patientMap.has(p.id)) {
      const nameParts = p.name.split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || 'Patient';

      const created = await db.orm.public.Patient.create({
        patientCode: p.id,
        mrn: p.mrn,
        firstName,
        lastName,
        dateOfBirth: p.dob,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        phone: p.phone,
        email: p.email,
        address: p.address,
        emergencyContactName: p.emergencyContact?.name || null,
        emergencyContactRel: p.emergencyContact?.relationship || null,
        emergencyContactPhone: p.emergencyContact?.phone || null,
        department: p.department,
        attendingDoctor: p.doctor,
        status: p.status,
        bedNumber: p.bedNumber || null,
        admissionDate: p.admissionDate || null,
        lastVisit: p.lastVisit || null,
        allergies: p.allergies ? p.allergies.join(', ') : null,
        insuranceProvider: p.insuranceProvider || null,
        policyNumber: p.policyNumber || null,
        vitalsBp: p.vitals?.bloodPressure || null,
        vitalsHeartRate: p.vitals?.heartRate ?? null,
        vitalsSpo2: p.vitals?.oxygenSaturation ?? null,
        vitalsTemp: p.vitals?.temperature ?? null,
        vitalsRespRate: p.vitals?.respiratoryRate ?? null,
      });
      patientMap.set(p.id, created.id);
    }
  }
  console.log(`✔ Seeded patients. Total mapped: ${patientMap.size}`);

  // Fallback patient ID if needed
  const defaultPatientId = patientMap.values().next().value as number;

  // 2. Seed Appointments
  const existingAppointments = await db.orm.public.Appointment.all();
  const existingAptCodes = new Set(existingAppointments.map((a) => a.appointmentCode));

  for (const apt of MOCK_APPOINTMENTS) {
    if (!existingAptCodes.has(apt.id)) {
      const patientDbId = patientMap.get(apt.patientId) || defaultPatientId;
      if (patientDbId) {
        await db.orm.public.Appointment.create({
          appointmentCode: apt.id,
          patientId: patientDbId,
          doctor: apt.doctor,
          doctorId: apt.doctorId || null,
          department: apt.department,
          date: apt.date,
          time: apt.time,
          duration: apt.duration || 30,
          type: apt.type,
          status: apt.status,
          room: apt.room,
          reasonForVisit: apt.reasonForVisit,
          notes: apt.notes || null,
        });
      }
    }
  }
  console.log(`✔ Seeded appointments.`);

  // 3. Seed Beds
  const existingBeds = await db.orm.public.Bed.all();
  const existingBedCodes = new Set(existingBeds.map((b) => b.bedCode));

  for (const b of MOCK_BEDS) {
    if (!existingBedCodes.has(b.id)) {
      const assignedPatientId = b.patient?.id ? patientMap.get(b.patient.id) || null : null;
      await db.orm.public.Bed.create({
        bedCode: b.id,
        bedNumber: b.bedNumber,
        ward: b.ward,
        room: b.room,
        floor: b.floor,
        status: b.status,
        equipment: b.equipment ? b.equipment.join(', ') : null,
        patientId: assignedPatientId,
        nurseInCharge: b.patient?.nurseInCharge || null,
        lastCleaned: b.lastCleaned || null,
        reservedFor: b.reservedFor || null,
        maintenanceNote: b.maintenanceNote || null,
      });
    }
  }
  console.log(`✔ Seeded hospital beds.`);

  // 4. Seed Emergency Cases
  const existingEmergency = await db.orm.public.EmergencyCase.all();
  const existingErCodes = new Set(existingEmergency.map((e) => e.caseCode));

  for (const er of MOCK_EMERGENCY_PATIENTS) {
    if (!existingErCodes.has(er.id)) {
      const patientDbId = er.patientId ? patientMap.get(er.patientId) || null : null;
      await db.orm.public.EmergencyCase.create({
        caseCode: er.id,
        patientId: patientDbId,
        patientName: er.name,
        patientAge: er.age,
        patientGender: er.gender,
        waitingTimeMinutes: er.waitingTimeMinutes || 0,
        priority: er.priority,
        esiScore: er.esiScore,
        chiefComplaint: er.chiefComplaint,
        vitalsBp: er.vitals?.bp || null,
        vitalsPulse: er.vitals?.pulse ?? null,
        vitalsSpo2: er.vitals?.spo2 ?? null,
        vitalsTemp: er.vitals?.temp ?? null,
        assignedDoctor: er.assignedDoctor,
        assignedNurse: er.assignedNurse || null,
        room: er.room,
        status: er.status,
        notes: er.notes,
        flags: er.flags ? er.flags.join(', ') : null,
      });
    }
  }
  console.log(`✔ Seeded emergency department cases.`);

  // 5. Seed Laboratory Tests
  const existingLabs = await db.orm.public.LabTest.all();
  const existingLabCodes = new Set(existingLabs.map((l) => l.testCode));

  for (const lab of MOCK_LAB_TESTS) {
    if (!existingLabCodes.has(lab.id)) {
      const patientDbId = patientMap.get(lab.patientId) || defaultPatientId;
      if (patientDbId) {
        await db.orm.public.LabTest.create({
          testCode: lab.id,
          patientId: patientDbId,
          testName: lab.testName,
          category: lab.category,
          sampleType: lab.sampleType,
          doctor: lab.doctor,
          department: lab.department,
          estimatedCompletionTime: lab.estimatedCompletionTime || null,
          priority: lab.priority,
          status: lab.status,
          resultSummary: lab.resultSummary || null,
          flaggedAbnormal: lab.flaggedAbnormal || false,
          referenceRange: lab.referenceRange || null,
          technician: lab.technician || null,
        });
      }
    }
  }
  console.log(`✔ Seeded laboratory orders and tests.`);

  console.log('✅ PostgreSQL database seeding completed successfully!');
}

if (process.argv[1]?.includes('seed.ts')) {
  seedDatabase()
    .then(async () => {
      await db.close();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Seed error:', err);
      await db.close();
      process.exit(1);
    });
}
