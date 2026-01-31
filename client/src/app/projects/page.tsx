'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Briefcase, Calendar, DollarSign } from 'lucide-react';
import api from '@/lib/api';

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
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

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

    return (
        <div className="container">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Projects</h1>
                    <p className="text-secondary mt-1">Manage sites, budgets, and timelines</p>
                </div>
                <Link href="/projects/new" className="btn btn-primary">
                    <Plus size={18} /> New Project
                </Link>
            </header>

            {loading ? (
                <p>Loading projects...</p>
            ) : projects.length === 0 ? (
                <div className="text-center py-16 text-secondary border-2 border-dashed border-border rounded flex flex-col items-center gap-4">
                    <Briefcase size={48} />
                    <p>No projects yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project._id} className="card">
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

                            <div>
                                <Link href={`/projects/${project._id}`} className="btn btn-outline w-full text-center justify-center">
                                    View Dashboard
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
