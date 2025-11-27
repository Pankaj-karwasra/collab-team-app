import { useEffect, useState } from 'react';
import { projectApi, teamApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Link } from 'react-router-dom';
import { Trash2, Edit2, Plus } from 'lucide-react';

export default function Projects() {
  const { mongoUser, refreshUser } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [teamName, setTeamName] = useState('');
  
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  useEffect(() => {
    if (mongoUser?.teamId) loadProjects();
  }, [mongoUser]);

  const loadProjects = async () => {
    const { data } = await projectApi.getAll();
    setProjects(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name) return;
    await projectApi.create({ ...newProject, teamId: mongoUser.teamId });
    setNewProject({ name: '', description: '' });
    loadProjects();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await projectApi.delete(id);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const startEdit = (project: any) => {
    setEditingId(project._id);
    setEditForm({ name: project.name, description: project.description });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await projectApi.update(editingId, editForm);
      setEditingId(null);
      loadProjects();
    } catch (err) {
      alert("Failed to update.");
    }
  };

  const handleCreateTeam = async () => {
    await teamApi.create({ name: teamName, description: 'Web Team' });
    refreshUser();
  };

  if (mongoUser && !mongoUser.teamId) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-white dark:bg-gray-800 p-8 rounded shadow w-96 text-center transition-colors">
          <h2 className="font-bold text-xl mb-4 text-gray-800 dark:text-white">Create Your Team</h2>
          <Input placeholder="Team Name" value={teamName} onChange={(e:any) => setTeamName(e.target.value)} className="mb-4 bg-gray-50 dark:bg-gray-700 dark:text-white"/>
          <Button onClick={handleCreateTeam}>Start</Button>
        </div>
      </div>
    );
  }

  const canCreate = ['ADMIN', 'MANAGER'].includes(mongoUser?.role);
  const canDelete = mongoUser?.role === 'ADMIN';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Projects</h2>
        <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300">
          Role: {mongoUser?.role}
        </span>
      </div>

      {/* Create Project Form */}
      {canCreate && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-8 flex gap-4 items-end border-l-4 border-blue-500 transition-colors">
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">New Project Name</label>
            <Input 
              value={newProject.name} 
              onChange={(e: any) => setNewProject({...newProject, name: e.target.value})} 
              className="bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div className="flex-[2]">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Description</label>
            <Input 
              value={newProject.description} 
              onChange={(e: any) => setNewProject({...newProject, description: e.target.value})} 
              className="bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <Button type="submit"><Plus size={18} className="mr-2"/> Create</Button>
        </form>
      )}

      {/* Project List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((p) => (
          <div key={p._id} className="bg-white dark:bg-gray-800 rounded border dark:border-gray-700 shadow hover:shadow-md transition relative group">
            
            {editingId === p._id ? (
              <div className="p-6 space-y-3">
                <Input value={editForm.name} onChange={(e:any) => setEditForm({...editForm, name: e.target.value})} className="dark:bg-gray-700 dark:text-white" />
                <Input value={editForm.description} onChange={(e:any) => setEditForm({...editForm, description: e.target.value})} className="dark:bg-gray-700 dark:text-white" />
                <div className="flex gap-2 justify-end">
                  <Button onClick={() => setEditingId(null)} className="bg-gray-400">Cancel</Button>
                  <Button onClick={saveEdit} className="bg-green-600">Save</Button>
                </div>
              </div>
            ) : (
              <div className="p-6 h-full flex flex-col justify-between">
                <Link to={`/projects/${p._id}`} className="block h-full">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{p.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">{p.description}</p>
                </Link>

                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {canCreate && (
                    <button onClick={() => startEdit(p)} className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full">
                      <Edit2 size={16} />
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(p._id)} className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded-full">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}