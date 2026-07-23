import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import Card from '../../components/Card';
import SearchFilter from '../../components/SearchFilter';
import AppointmentChart from '../../components/AppointmentChart';
import LoadingState from '../../components/dashboard/LoadingState';
import DashboardStats from '../../components/dashboard/DashboardStats';
import AppointmentTable from '../../components/dashboard/AppointmentTable';
import HistoryModal from '../../components/dashboard/HistoryModal';
import ReminderPanel from '../../components/dashboard/ReminderPanel';
import AnalyticsPanel from '../../components/dashboard/AnalyticsPanel';
import ReportPanel from '../../components/dashboard/ReportPanel';
import AuditLogPanel from '../../components/dashboard/AuditLogPanel';
import SchedulerMonitoringCard from '../../components/dashboard/SchedulerMonitoringCard';
import { useAuth } from '../../context/AuthContext';
import {
  getAppointments,
  markVisited,
  markMissed,
  cancelAppointment,
  rescheduleAppointment,
  getPatientHistory,
  getDashboardAnalytics,
  getReport,
  getReportExportUrl,
} from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { getStatus } from '../../utils/dashboardUtils';

const PAGE_SIZE = 10;

const Dashboard = () => {
  const { isDark } = useTheme();
  const { isReceptionist, isAdmin, isSuperAdmin } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [report, setReport] = useState(null);
  const [reportType, setReportType] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'appointment_date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('10:00 AM');
  const [historyModal, setHistoryModal] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchReport(reportType);
  }, [reportType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, languageFilter, dateFilter, sortConfig]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [appointmentsResponse, analyticsResponse, reportResponse] = await Promise.all([
        getAppointments(),
        getDashboardAnalytics(),
        getReport(reportType),
      ]);
      setAppointments(appointmentsResponse.data);
      setAnalytics(analyticsResponse.data);
      setReport(reportResponse);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await getAppointments();
      setAppointments(response.data);
      const analyticsResponse = await getDashboardAnalytics();
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      toast.error('Failed to fetch appointments');
      console.error(error);
    }
  };

  const fetchReport = async (type) => {
    try {
      const response = await getReport(type);
      setReport(response);
    } catch (error) {
      toast.error('Failed to fetch report');
      console.error(error);
    }
  };

  const handleExportReport = (format) => {
    window.open(getReportExportUrl(reportType, format), '_blank', 'noopener,noreferrer');
  };

  const handleMarkVisited = async (id) => {
    try {
      await markVisited(id);
      toast.success('Appointment marked as visited!');
      fetchAppointments();
      fetchReport(reportType);
    } catch (error) {
      toast.error('Failed to update appointment');
      console.error(error);
    }
  };

  const handleMarkMissed = async (id) => {
    try {
      await markMissed(id);
      toast.success('Appointment marked as missed!');
      fetchAppointments();
      fetchReport(reportType);
    } catch (error) {
      toast.error('Failed to mark appointment as missed');
      console.error(error);
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      await cancelAppointment(id);
      toast.success('Appointment cancelled successfully!');
      fetchAppointments();
      fetchReport(reportType);
    } catch (error) {
      toast.error('Failed to cancel appointment');
      console.error(error);
    }
  };

  const handleReschedule = async (id) => {
    if (!rescheduleDate) {
      toast.error('Please select a new date');
      return;
    }
    if (!rescheduleTime) {
      toast.error('Please select a time slot');
      return;
    }

    try {
      await rescheduleAppointment(id, rescheduleDate, rescheduleTime);
      toast.success('Appointment rescheduled successfully!');
      setRescheduleId(null);
      setRescheduleDate('');
      setRescheduleTime('10:00 AM');
      fetchAppointments();
      fetchReport(reportType);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reschedule');
      console.error(error);
    }
  };

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    const filtered = appointments.filter((apt) => {
      const status = getStatus(apt.appointment_date, apt.visited);
      const dateValue = new Date(apt.appointment_date).toISOString().slice(0, 10);
      const matchesSearch =
        apt.patient_name.toLowerCase().includes(normalizedSearch) ||
        apt.patient_phone.includes(searchTerm) ||
        dateValue.includes(normalizedSearch) ||
        status.includes(normalizedSearch) ||
        apt.language?.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === 'All' || status.toLowerCase() === statusFilter.toLowerCase();
      const matchesLanguage = languageFilter === 'All' || apt.language === languageFilter;
      const matchesDate = !dateFilter || dateValue === dateFilter;

      return matchesSearch && matchesStatus && matchesLanguage && matchesDate;
    });

    return [...filtered].sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      const getValue = (row) => sortConfig.key === 'status' ? getStatus(row.appointment_date, row.visited) : row[sortConfig.key];
      const first = getValue(a) || '';
      const second = getValue(b) || '';
      return String(first).localeCompare(String(second), undefined, { numeric: true }) * direction;
    });
  }, [appointments, searchTerm, statusFilter, languageFilter, dateFilter, sortConfig]);

  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAppointments.slice(start, start + PAGE_SIZE);
  }, [filteredAppointments, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / PAGE_SIZE));

  const stats = useMemo(() => ({
    total: appointments.length,
    upcoming: appointments.filter((a) => getStatus(a.appointment_date, a.visited) === 'upcoming').length,
    today: appointments.filter((a) => getStatus(a.appointment_date, a.visited) === 'today').length,
    visited: appointments.filter((a) => getStatus(a.appointment_date, a.visited) === 'visited').length,
    missed: appointments.filter((a) => getStatus(a.appointment_date, a.visited) === 'missed').length,
  }), [appointments]);

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleViewHistory = async (patientId) => {
    try {
      const response = await getPatientHistory(patientId);
      setPatientHistory(response.data);
      setHistoryModal(patientId);
    } catch (error) {
      toast.error('Failed to fetch patient history');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <LoadingState isDark={isDark} />;
  }

  return (
    <div className="space-y-6">
      <DashboardStats isDark={isDark} stats={stats} />

      {!isReceptionist && (
        <>
          <SchedulerMonitoringCard isDark={isDark} />
          <AnalyticsPanel analytics={analytics} isDark={isDark} />
          <AppointmentChart appointments={appointments} />
          <ReportPanel
            isDark={isDark}
            reportType={reportType}
            setReportType={setReportType}
            report={report}
            onExport={handleExportReport}
          />
        </>
      )}

      {(isAdmin || isSuperAdmin) && (
        <AuditLogPanel isDark={isDark} />
      )}

      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        languageFilter={languageFilter}
        setLanguageFilter={setLanguageFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />

      <Card delay={0.4}>
        <AppointmentTable
          isDark={isDark}
          filteredAppointments={paginatedAppointments}
          appointments={appointments}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onMarkVisited={handleMarkVisited}
          onMarkMissed={handleMarkMissed}
          onCancelAppointment={handleCancelAppointment}
          onViewHistory={handleViewHistory}
          onRescheduleClick={(id) => {
            setRescheduleId(id);
            setRescheduleDate('');
            setRescheduleTime('10:00 AM');
          }}
          sortConfig={sortConfig}
          onSort={handleSort}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(Math.min(Math.max(page, 1), totalPages))}
          totalFiltered={filteredAppointments.length}
        />
      </Card>

      <AnimatePresence>
        <ReminderPanel
          isDark={isDark}
          rescheduleId={rescheduleId}
          rescheduleDate={rescheduleDate}
          setRescheduleDate={setRescheduleDate}
          rescheduleTime={rescheduleTime}
          setRescheduleTime={setRescheduleTime}
          onConfirm={() => handleReschedule(rescheduleId)}
          onCancel={() => {
            setRescheduleId(null);
            setRescheduleDate('');
            setRescheduleTime('10:00 AM');
          }}
        />
      </AnimatePresence>

      <HistoryModal
        isDark={isDark}
        historyModal={historyModal}
        patientHistory={patientHistory}
        onClose={() => {
          setHistoryModal(null);
          setPatientHistory(null);
        }}
      />
    </div>
  );
};

export default Dashboard;


