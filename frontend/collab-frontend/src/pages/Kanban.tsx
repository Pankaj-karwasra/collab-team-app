import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { taskApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Bot, Loader2 } from 'lucide-react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function Kanban() {
  const { id: projectId } = useParams();
  const { mongoUser } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [aiCommand, setAiCommand] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadTasks();
      
      // Listen for updates specific to this project
      socket.on(`project_tasks_${projectId}`, (data) => {
        if (data.action === 'create') {
          setTasks(prev => [...prev, data.task]);
        } else if (data.action === 'update') {
          setTasks(prev => prev.map(t => t._id === data.task._id ? data.task : t));
        }
      });

      return () => {
        socket.off(`project_tasks_${projectId}`);
      };
    }
  }, [projectId]);

  const loadTasks = async () => {
    if (!projectId) return;
    const { data } = await taskApi.getAll(projectId);
    setTasks(data);
  };

  const handleAiCreate = async () => {
    if (!projectId || !aiCommand) return;
    setLoadingAi(true);
    try {
      await taskApi.createAI({ command: aiCommand, projectId });
      setAiCommand('');
    } catch (error) {
      alert("AI Failed: " + error);
    } finally {
      setLoadingAi(false);
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      // 1. Optimistic Update
      const newStatus = destination.droppableId;
      const updatedTasks = tasks.map(t => 
        t._id === draggableId ? { ...t, status: newStatus } : t
      );
      setTasks(updatedTasks);

      // 2. API Call (Backend will emit socket event to others)
      try {
        await taskApi.update(draggableId, { status: newStatus });
      } catch (err) {
        console.error("Move failed", err);
        loadTasks(); // Revert on failure
      }
    }
  };

  const columns = ['todo', 'in-progress', 'done'];

  return (
    <div className="h-full flex flex-col">
      {/* AI Bar */}
      <div className="bg-gradient-to-r from-purple-50 to-white p-4 rounded-lg shadow-sm mb-6 border border-purple-100 flex items-center gap-4">
        <div className="bg-purple-100 p-2 rounded-full"><Bot className="text-purple-600" size={24} /></div>
        <div className="flex-1">
          <p className="text-xs text-purple-600 font-semibold mb-1">AI Task Assistant</p>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g., 'Create a high priority bug for the login page assigned to Jane'" 
              value={aiCommand}
              onChange={(e: any) => setAiCommand(e.target.value)}
              className="bg-white"
            />
            <Button onClick={handleAiCreate} disabled={loadingAi} className="bg-purple-600 hover:bg-purple-700 min-w-[100px]">
              {loadingAi ? <Loader2 className="animate-spin" /> : 'Generate'}
            </Button>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
          {columns.map(colId => (
            <Droppable key={colId} droppableId={colId}>
              {(provided) => (
                <div 
                  ref={provided.innerRef} 
                  {...provided.droppableProps}
                  className="bg-gray-100 p-4 rounded-xl min-w-[300px] flex flex-col h-full"
                >
                  <h3 className="font-bold uppercase text-gray-500 text-sm mb-4 tracking-wider flex justify-between">
                    {colId}
                    <span className="bg-gray-200 text-gray-600 px-2 rounded-full text-xs py-0.5">
                      {tasks.filter(t => t.status === colId).length}
                    </span>
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {tasks.filter(t => t.status === colId).map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-4 rounded-lg shadow-sm border transition-all ${snapshot.isDragging ? 'shadow-lg rotate-2 ring-2 ring-blue-400' : 'hover:border-blue-300'}`}
                          >
                            <p className="font-medium text-gray-800">{task.title}</p>
                            {task.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>}
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                  {task.assignedTo?.name?.[0] || '?'}
                                </div>
                                <span className="text-xs text-gray-500">{task.assignedTo?.name || 'Unassigned'}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}