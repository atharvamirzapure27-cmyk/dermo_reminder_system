const patientRepository = require('../repositories/patientRepository');

const getPatients = async (query = {}) => patientRepository.findAll(query);

const createPatient = async (patientData) => patientRepository.create(patientData);

module.exports = {
  getPatients,
  createPatient
};
