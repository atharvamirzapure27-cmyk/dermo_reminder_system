require('dotenv').config();
const axios = require('axios');

async function testAppointment() {
  try {
    // Get patients first
    const patientsRes = await axios.get('http://localhost:3001/patients');
    console.log('Patients:', patientsRes.data.count);
    
    if (patientsRes.data.count === 0) {
      console.log('No patients found. Creating one...');
      const newPatient = await axios.post('http://localhost:3001/patients', {
        name: 'Test Patient',
        phone: '9' + Date.now().toString().slice(-9),
        language: 'english'
      });
      console.log('Created patient ID:', newPatient.data.data.id);
    }

    // Get first patient
    const patients = await axios.get('http://localhost:3001/patients');
    const patientId = patients.data.data[0].id;
    console.log('Using patient ID:', patientId);

    // Try to create appointment for today
    const today = new Date().toISOString().split('T')[0];
    console.log('Attempting to create appointment for:', today);
    console.log('Local date:', new Date().toLocaleDateString('en-CA'));

    try {
      const appointmentRes = await axios.post('http://localhost:3001/appointments', {
        patient_id: patientId,
        appointment_date: today
      });
      console.log('✅ Appointment created:', appointmentRes.data);
    } catch (error) {
      console.log('❌ Error creating appointment:');
      console.log('Status:', error.response?.status);
      console.log('Message:', error.response?.data?.message);
      console.log('Full response:', JSON.stringify(error.response?.data, null, 2));
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

testAppointment();
