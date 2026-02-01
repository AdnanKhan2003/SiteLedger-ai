'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Briefcase, Calendar, DollarSign } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

interface Project {
    _id: string;
    name: string;
    client: string;
    location: string;
    status: string;
    budget: number;
    startDate: string;
}

export default function ProjectsPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; projectId: string | null; projectName: string }>({
        isOpen: false,
        projectId: null,
        projectName: ''
    });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (user) {
            fetchProjects();
        }
    }, [user]);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (id: string, name: string) => {
        setDeleteModal({ isOpen: true, projectId: id, projectName: name });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, projectId: null, projectName: '' });
    };

    const handleDelete = async () => {
        if (!deleteModal.projectId) return;

        setDeleting(true);
        try {
            await api.delete(`/projects/${deleteModal.projectId}`);
            setProjects(projects.filter(p => p._id !== deleteModal.projectId));
            showToast('Project deleted successfully', 'success');
            closeDeleteModal();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to delete project';
            showToast(errorMessage, 'error');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="container">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:sticky md:top-0 md:z-10 md:bg-background/95 md:backdrop-blur md:pt-4 md:pb-4 md:-mt-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Projects</h1>
                    <p className="text-secondary mt-1">Manage sites, budgets, and timelines</p>
                </div>
                {user?.role === 'admin' && (
                    <Link href="/projects/new" className="btn btn-primary w-full md:w-auto">
                        <Plus size={18} /> New Project
                    </Link>
                )}
            </header>

            {loading ? (
                <p>Loading projects...</p>
            ) : projects.length === 0 ? (
                <div className="text-center py-16 text-secondary border-2 border-dashed border-border rounded flex flex-col items-center gap-4">
                    <Briefcase size={48} />
                    <p>{user?.role === 'admin' ? 'No projects yet.' : 'You have not been assigned to any projects yet.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project._id} className="card relative group">
                            <span
                                className={`inline-block text-xs font-bold px-2 py-1 rounded mb-3 uppercase tracking-wide
                    ${project.status === 'active' ? 'bg-green-100 text-green-700' :
                                        project.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                            'bg-red-100 text-red-700'}`}
                            >
                                {project.status}
                            </span>
                            <h3 className="text-xl font-bold mb-1">{project.name}</h3>
                            <p className="text-sm text-secondary mb-6">{project.client}</p>

                            <div className="flex flex-col gap-2 mb-6 text-sm text-foreground/80">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-secondary" />
                                    <span>{new Date(project.startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign size={14} className="text-secondary" />
                                    <span>Budget: ₹{project.budget.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className=" space-y-2">
                                <Link href={`/projects/${project._id}`} className="btn btn-outline w-full text-center justify-center">
                                    View Dashboard
                                </Link>
                                {user?.role === 'admin' && (
                                    <div className="flex gap-2">
                                        <Link href={`/projects/${project._id}/edit`} className="btn bg-gray-100 w-full justify-center hover:bg-gray-200">
                                            Edit
                                        </Link>
                                        <button onClick={() => openDeleteModal(project._id, project.name)} className="btn bg-red-50 text-red-600 w-full justify-center hover:bg-red-100">
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                title="Delete Project"
                message={`Are you sure you want to delete "${deleteModal.projectName}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={deleting}
            />
        </div>
    );
}
