const patientRepository = require('../repositories/patientRepository');

const getPatients = async () => patientRepository.findAll();

const createPatient = async (patientData) => patientRepository.create(patientData);

module.exports = {
  getPatients,
  createPatient
};
