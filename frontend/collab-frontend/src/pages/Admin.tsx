import { useEffect, useState } from 'react';
import { userApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert} from 'lucide-react';

export default function Admin() {
  const { mongoUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await userApi.getAllTeamUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await userApi.updateRole(userId, newRole);
      // Optimistic Update
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert("Failed to update role");
    }
  };

  // Security Check
  if (mongoUser?.role !== 'ADMIN') {
    return <div className="p-8 text-red-600">Access Denied: Admins Only.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
        <h1 className="text-2xl font-bold text-red-700 flex items-center gap-2">
          <ShieldAlert /> Admin Console
        </h1>
        <p className="text-red-600">Manage team roles and permissions here.</p>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Current Role</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium">{u.name}</td>
                <td className="p-4 text-gray-500">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    u.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    u.role === 'MANAGER' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  {/* Do not allow Admin to demote themselves effectively locking themselves out */}
                  {u._id !== mongoUser._id && (
                    <select 
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="border rounded p-1 text-sm bg-white cursor-pointer hover:border-blue-500"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  )}
                  {u._id === mongoUser._id && <span className="text-xs text-gray-400">You</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}