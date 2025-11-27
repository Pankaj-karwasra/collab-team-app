import { useEffect, useState } from 'react';
import { teamApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { UserPlus } from 'lucide-react';

export default function Members() {
  const { mongoUser } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = () => {
    teamApi.getMembers()
      .then(res => setMembers(res.data))
      .catch(err => console.error(err));
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await teamApi.addMember(inviteEmail);
      setMsg('Member added successfully!');
      setInviteEmail('');
      loadMembers();
    } catch (err: any) {
      setMsg('Error: ' + (err.response?.data?.message || 'Failed'));
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Team Members</h2>
      
      {/* Add Member Form - Admin Only */}
      {mongoUser?.role === 'ADMIN' && (
        <div className="bg-white p-6 rounded shadow mb-8 max-w-2xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><UserPlus size={20}/> Add New Member</h3>
          <form onSubmit={handleAddMember} className="flex gap-4">
            <Input 
              placeholder="User Email (Must already be registered)" 
              value={inviteEmail}
              onChange={(e:any) => setInviteEmail(e.target.value)}
            />
            <Button type="submit">Add</Button>
          </form>
          {msg && <p className="text-sm mt-2 text-blue-600">{msg}</p>}
        </div>
      )}

      <div className="bg-white rounded shadow border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-gray-500 font-medium">Name</th>
              <th className="p-4 text-gray-500 font-medium">Email</th>
              <th className="p-4 text-gray-500 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m: any) => (
              <tr key={m._id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium">{m.name}</td>
                <td className="p-4 text-gray-500">{m.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    m.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                    m.role === 'MANAGER' ? 'bg-purple-100 text-purple-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {m.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}