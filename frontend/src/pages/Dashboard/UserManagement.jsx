import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Trash2, Key, Loader2, Users, UserCheck } from 'lucide-react';
import { getUsers, createUser, deleteUser } from '../../services/api';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const UserManagement = ({ isDark }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'receptionist'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch user list');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || formData.password.length < 8) {
      toast.error('Username is required and password must be at least 8 characters');
      return;
    }

    try {
      setSubmitLoading(true);
      const response = await createUser({
        username: formData.username.trim(),
        password: formData.password,
        role: formData.role
      });
      if (response.success) {
        toast.success(`User '${formData.username}' created successfully!`);
        setFormData({ username: '', password: '', role: 'receptionist' });
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
      console.error(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id, username) => {
    if (username === 'superadmin') {
      toast.error('Cannot delete the default superadmin');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user account '${username}'?`)) {
      return;
    }

    try {
      const response = await deleteUser(id);
      if (response.success) {
        toast.success('User account deleted');
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
      console.error(error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Create User Form */}
      <div className="lg:col-span-1">
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-blue-600 p-2 rounded-lg">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>
              Add Staff Member
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Username"
              icon={Users}
              required
            />

            <Input
              label="Password (min 8 chars)"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              icon={Key}
              required
            />

            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className={`input-modern ${isDark ? 'text-white' : ''}`}
              >
                <option value="receptionist">Receptionist</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <Button
              type="submit"
              loading={submitLoading}
              className="w-full mt-2"
            >
              Add User
            </Button>
          </form>
        </Card>
      </div>

      {/* Users List */}
      <div className="lg:col-span-2">
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-blue-600 p-2 rounded-lg">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>
              Staff Accounts
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-2 px-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Username</th>
                    <th className={`text-left py-2 px-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Role</th>
                    <th className={`text-left py-2 px-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Created At</th>
                    <th className={`text-right py-2 px-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((account) => (
                    <tr key={account.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className={`py-3 px-3 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {account.username}
                      </td>
                      <td className={`py-3 px-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className={`status-badge capitalize ${
                          account.role === 'super_admin'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : account.role === 'admin'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {account.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={`py-3 px-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(account.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {account.username !== 'superadmin' && account.role !== 'super_admin' && (
                          <button
                            onClick={() => handleDelete(account.id, account.username)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <p className="text-center py-6 text-gray-500">No users found.</p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
