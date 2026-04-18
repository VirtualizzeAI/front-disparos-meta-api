
import { useEffect, useState } from 'react';
import { API_CONFIG, apiCall, addAuthToBody } from '../../services/api';

export function Dashboard() {
    const [blasts, setBlasts] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        ongoing: 0,
        completed: 0,
        totalContacts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const result = await apiCall(API_CONFIG.ENDPOINTS.LIST_BLASTS, {
                method: 'POST',
                body: {} // auth added automatically by apiCall
            });

            // Handle different possible response structures
            let blastsData = [];
            if (Array.isArray(result)) {
                blastsData = result;
            } else if (result.result && Array.isArray(result.result)) {
                blastsData = result.result;
            } else if (result.blasts && Array.isArray(result.blasts)) {
                blastsData = result.blasts;
            } else if (result.data && Array.isArray(result.data)) {
                blastsData = result.data;
            }

            setBlasts(blastsData);
            updateStats(blastsData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setBlasts([]);
            updateStats([]);
        } finally {
            setLoading(false);
        }
    };

    const updateStats = (data) => {
        const total = data.length;
        const andamento = data.filter(b => b.status === 'Andamento').length;
        const finalizado = data.filter(b => b.status === 'Finalizado').length;
        const totalContacts = data.reduce((sum, b) => sum + (b.tamanho_lista || 0), 0);

        setStats({
            total,
            ongoing: andamento,
            completed: finalizado,
            totalContacts
        });
    };

    const getStatusText = (status) => {
        const statusMap = {
            'Andamento': 'Andamento',
            'Finalizado': 'Finalizado',
            'Interrompido': 'Interrompido'
        };
        return statusMap[status] || status;
    };

    const viewBlastDetails = (blast) => {
        alert(`Detalhes do disparo:\n\nCampanha: ${blast.nome_campanha}\nData/Hora: ${blast.hora_inicio}\nContatos: ${blast.tamanho_lista}\nStatus: ${getStatusText(blast.status)}`);
    };

    return (
        <div id="dashboard-page" className="page active" style={{ display: 'block' }}>
            <header className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="subtitle">Histórico de disparos realizados</p>
                </div>
                <a href="/new-blast" className="btn btn-primary" id="new-blast-btn" style={{ textDecoration: 'none' }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Novo Disparo
                </a>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M13 7H7V13H13V7Z" fill="white" />
                            <path d="M13 17H7V23H13V17Z" fill="white" opacity="0.6" />
                            <path d="M23 7H17V13H23V7Z" fill="white" opacity="0.6" />
                            <path d="M23 17H17V23H23V17Z" fill="white" opacity="0.6" />
                        </svg>
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Total de Disparos</p>
                        <p className="stat-value" id="total-blasts">{stats.total}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7V12C2 17.5 6 22.5 12 24C18 22.5 22 17.5 22 12V7L12 2Z" fill="white" />
                        </svg>
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Em Andamento</p>
                        <p className="stat-value" id="ongoing-blasts">{stats.ongoing}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Concluídos</p>
                        <p className="stat-value" id="completed-blasts">{stats.completed}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M17 8L12 3L7 8M7 16L12 21L17 16" stroke="white" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Total de Contatos</p>
                        <p className="stat-value" id="total-contacts">{stats.totalContacts.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nome da Campanha</th>
                            <th>Data/Hora</th>
                            <th>Contatos</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="blasts-table-body">
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    Carregando...
                                </td>
                            </tr>
                        ) : blasts.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    Nenhum disparo realizado ainda
                                </td>
                            </tr>
                        ) : (
                            blasts.map(blast => (
                                <tr key={blast.id}>
                                    <td><strong>{blast.nome_campanha}</strong></td>
                                    <td>{blast.hora_inicio}</td>
                                    <td>{blast.tamanho_lista?.toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge status-${blast.status}`}>
                                            {getStatusText(blast.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-btn" onClick={() => viewBlastDetails(blast)} title="Ver detalhes">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M8 3C4.5 3 1.73 5.11 1 8C1.73 10.89 4.5 13 8 13C11.5 13 14.27 10.89 15 8C14.27 5.11 11.5 3 8 3Z" stroke="currentColor" strokeWidth="1.5" />
                                                <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
