
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { apiCall, getAuthCredentials } from '../../services/api';

const CATEGORY_STYLES = {
    MARKETING: { label: 'Marketing', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    UTILITY: { label: 'Utilidade', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    AUTHENTICATION: { label: 'Autenticação', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
};

function formatDate(value) {
    if (!value) return '—';
    const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function CategoryBadge({ category }) {
    const style = CATEGORY_STYLES[category] || { label: category || 'Outros', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
    return (
        <span style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: '20px',
            fontSize: '0.72rem',
            fontWeight: '600',
            letterSpacing: '0.04em',
            background: style.gradient,
            color: '#fff',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
        }}>
            {style.label}
        </span>
    );
}

const STATUS_STYLES = {
    APPROVED:  { label: 'Aprovado',    color: '#43e97b', bg: 'rgba(67,233,123,0.12)',  border: 'rgba(67,233,123,0.3)'  },
    PENDING:   { label: 'Pendente',    color: '#fee140', bg: 'rgba(254,225,64,0.12)',  border: 'rgba(254,225,64,0.3)'  },
    REJECTED:  { label: 'Rejeitado',   color: '#f5576c', bg: 'rgba(245,87,108,0.12)', border: 'rgba(245,87,108,0.3)' },
    PAUSED:    { label: 'Pausado',     color: '#4facfe', bg: 'rgba(79,172,254,0.12)', border: 'rgba(79,172,254,0.3)' },
    DISABLED:  { label: 'Desativado',  color: '#a0a0b8', bg: 'rgba(160,160,184,0.1)', border: 'rgba(160,160,184,0.25)' },
    IN_APPEAL: { label: 'Em recurso',  color: '#fa709a', bg: 'rgba(250,112,154,0.12)', border: 'rgba(250,112,154,0.3)' },
    DELETED:   { label: 'Deletado',    color: '#6b6b8a', bg: 'rgba(107,107,138,0.1)', border: 'rgba(107,107,138,0.2)' },
    ARCHIVED:  { label: 'Arquivado',   color: '#6b6b8a', bg: 'rgba(107,107,138,0.1)', border: 'rgba(107,107,138,0.2)' },
};

function StatusBadge({ status }) {
    const s = STATUS_STYLES[status] || { label: status || '—', color: '#a0a0b8', bg: 'rgba(160,160,184,0.1)', border: 'rgba(160,160,184,0.25)' };
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '2px 9px',
            borderRadius: '20px',
            fontSize: '0.72rem',
            fontWeight: '600',
            letterSpacing: '0.03em',
            color: s.color,
            background: s.bg,
            border: `1px solid ${s.border}`,
            whiteSpace: 'nowrap',
        }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            {s.label}
        </span>
    );
}

function TemplatePreview({ components = [], expanded = false }) {
    const header = components.find(c => c.type === 'HEADER');
    const body = components.find(c => c.type === 'BODY');
    const footer = components.find(c => c.type === 'FOOTER');
    const buttons = components.find(c => c.type === 'BUTTONS');

    const getBodyText = () => {
        if (!body) return null;
        let text = body.text || '';
        if (body.example?.body_text?.[0]) {
            body.example.body_text[0].forEach((val, i) => {
                text = text.replace(`{{${i + 1}}}`, val);
            });
        }
        if (!expanded && text.length > 120) return text.slice(0, 120) + '…';
        return text;
    };

    const mediaHeight = expanded ? '200px' : '56px';
    const fontSize = expanded ? '0.92rem' : '0.82rem';

    return (
        <div style={{
            background: '#e5ddd5',
            borderRadius: '8px',
            padding: '10px',
            minHeight: expanded ? '120px' : '90px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            minWidth: 0,
        }}>
            <div style={{
                background: '#fff',
                borderRadius: '6px 6px 6px 0',
                padding: expanded ? '14px 16px' : '10px 12px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                fontSize,
                color: '#111',
                minWidth: 0,
                wordBreak: 'break-word',
            }}>
                {header && (
                    <div style={{ marginBottom: '8px' }}>
                        {header.format === 'IMAGE' && (
                            <div style={{
                                background: '#d0d0d0',
                                borderRadius: '4px',
                                height: mediaHeight,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '8px',
                                overflow: 'hidden',
                            }}>
                                {header.example?.header_handle?.[0] ? (
                                    <img
                                        src={header.example.header_handle[0]}
                                        alt="Header"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                ) : (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                        <rect width="24" height="24" rx="4" fill="#bbb" />
                                        <path d="M5 19L9 13L12 17L15 13L19 19H5Z" fill="#888" />
                                        <circle cx="8.5" cy="9.5" r="2" fill="#888" />
                                    </svg>
                                )}
                            </div>
                        )}
                        {header.format === 'VIDEO' && (
                            <div style={{
                                background: '#222',
                                borderRadius: '4px',
                                height: mediaHeight,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '8px',
                                overflow: 'hidden',
                            }}>
                                {expanded && header.example?.header_handle?.[0] ? (
                                    <video
                                        controls
                                        src={header.example.header_handle[0]}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
                                        <circle cx="14" cy="14" r="14" fill="#444" />
                                        <path d="M11 9L21 14L11 19V9Z" fill="#fff" />
                                    </svg>
                                )}
                            </div>
                        )}
                        {header.format === 'DOCUMENT' && (
                            <div style={{
                                background: '#f0f0f0',
                                borderRadius: '4px',
                                height: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '0 12px',
                                marginBottom: '8px',
                            }}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M4 2h8l4 4v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="#666" strokeWidth="1.5" />
                                    <path d="M12 2v4h4" stroke="#666" strokeWidth="1.5" />
                                </svg>
                                <span style={{ fontSize: '0.8rem', color: '#555' }}>Documento</span>
                            </div>
                        )}
                        {header.format === 'TEXT' && header.text && (
                            <p style={{ fontWeight: '700', marginBottom: '6px', fontSize: expanded ? '0.96rem' : '0.84rem' }}>
                                {header.text}
                            </p>
                        )}
                    </div>
                )}

                {body && (
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', color: '#222' }}>
                        {getBodyText()}
                    </p>
                )}

                {footer && (
                    <p style={{ fontSize: '0.74rem', color: '#999', marginTop: '6px' }}>{footer.text}</p>
                )}
            </div>

            {buttons && buttons.buttons?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {(expanded ? buttons.buttons : buttons.buttons.slice(0, 2)).map((btn, i) => (
                        <div key={i} style={{
                            background: '#fff',
                            borderRadius: '4px',
                            padding: expanded ? '7px 12px' : '5px 10px',
                            textAlign: 'center',
                            fontSize: expanded ? '0.84rem' : '0.78rem',
                            color: '#00a884',
                            fontWeight: '500',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        }}>
                            {btn.text}
                        </div>
                    ))}
                    {!expanded && buttons.buttons.length > 2 && (
                        <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#999' }}>
                            +{buttons.buttons.length - 2} botão{buttons.buttons.length - 2 > 1 ? 'ões' : ''}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function TemplateModal({ template, onClose }) {
    const createdDate = template.created_time || template.createdAt || template.created_at || template.date || null;

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const modal = (
        /* Backdrop: scroll vertical quando o painel for maior que a tela */
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(6px)',
                overflowY: 'auto',
                padding: '32px 24px',
            }}
        >
            {/* Painel: cresce com o conteúdo, centralizado horizontalmente */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '480px',
                    margin: '0 auto',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '20px 24px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
                            <p style={{ fontWeight: '700', fontSize: '1.05rem', color: '#ffffff', wordBreak: 'break-word', lineHeight: '1.3' }}>
                                {template.name}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                {template.category && <CategoryBadge category={template.category} />}
                                {template.language && (
                                    <span style={{ fontSize: '0.75rem', color: '#6b6b8a', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        {template.language}
                                    </span>
                                )}
                                {template.status && <StatusBadge status={template.status} />}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                flexShrink: 0,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '8px',
                                color: '#a0a0b8',
                                width: '34px',
                                height: '34px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '1.3rem',
                                lineHeight: 1,
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Corpo: cresce naturalmente, sem overflow */}
                <div style={{
                    padding: '20px 24px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                }}>
                    <p style={{ fontSize: '0.75rem', color: '#6b6b8a', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        Prévia WhatsApp
                    </p>

                    <TemplatePreview components={template.components || []} expanded />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b6b8a', fontSize: '0.78rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px' }}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <rect x="1" y="2" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M4 1v2M9 1v2M1 5h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        <span>Criado em {formatDate(createdDate)}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}

function TemplateCard({ template, onExpand }) {
    const createdDate = template.created_time || template.createdAt || template.created_at || template.date || null;

    return (
        <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backdropFilter: 'blur(10px)',
            transition: 'border-color var(--transition-base), box-shadow var(--transition-base)',
        }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border-hover)';
                e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <p style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)', wordBreak: 'break-word', lineHeight: '1.3' }}>
                    {template.name}
                </p>
                {template.category && <CategoryBadge category={template.category} />}
            </div>

            {template.status && (
                <div>
                    <StatusBadge status={template.status} />
                </div>
            )}

            <TemplatePreview components={template.components || []} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <rect x="1" y="2" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M4 1v2M9 1v2M1 5h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    <span>{formatDate(createdDate)}</span>
                </div>

                <button
                    onClick={onExpand}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: 'var(--bg-glass)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        padding: '4px 10px',
                        cursor: 'pointer',
                        transition: 'border-color var(--transition-fast), color var(--transition-fast)',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--border-hover)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M1.5 4.5V1.5H4.5M8.5 1.5H11.5V4.5M11.5 8.5V11.5H8.5M4.5 11.5H1.5V8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Expandir
                </button>
            </div>
        </div>
    );
}

export function Templates() {
    const [templateMeta, setTemplateMeta] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedTemplate, setExpandedTemplate] = useState(null);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        setError(null);
        try {
            const { token } = getAuthCredentials();
            const result = await apiCall('/get-templates', {
                method: 'POST',
                body: { authToken: token }
            });

            if (result.success === true || result.success === 'true') {
                setTemplateMeta(result.templateMeta || []);
            } else {
                setError(result.message || 'Não foi possível carregar os templates.');
            }
        } catch (err) {
            console.error('Error loading templates:', err);
            setError('Erro ao conectar com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    const closeModal = useCallback(() => setExpandedTemplate(null), []);

    return (
        <div className="page active" style={{ display: 'block' }}>
            <header className="page-header">
                <div>
                    <h1>Templates</h1>
                    <p className="subtitle">Visualize e gerencie seus templates do WhatsApp</p>
                </div>
                <button className="btn btn-primary" onClick={loadTemplates} disabled={loading}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M16 9A7 7 0 1 1 9 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M12 2l1 3-3 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Atualizar
                </button>
            </header>

            {loading && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ animation: 'spin 1s linear infinite', marginBottom: '12px', display: 'block', margin: '0 auto 12px' }}>
                        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2.5" fill="none" strokeDasharray="60" strokeDashoffset="30" />
                    </svg>
                    <p>Carregando templates...</p>
                </div>
            )}

            {!loading && error && (
                <div style={{
                    background: 'rgba(240, 147, 251, 0.08)',
                    border: '1px solid rgba(240, 147, 251, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-md)',
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                }}>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && templateMeta.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ marginBottom: '16px', opacity: 0.4, display: 'block', margin: '0 auto 16px' }}>
                        <rect x="8" y="6" width="32" height="36" rx="4" stroke="currentColor" strokeWidth="2" />
                        <path d="M15 16h18M15 22h18M15 28h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <p style={{ fontSize: '1rem' }}>Nenhum template encontrado</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Crie templates no Meta Business Suite para que apareçam aqui.</p>
                </div>
            )}

            {!loading && !error && templateMeta.length > 0 && (
                <>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 'var(--spacing-md)' }}>
                        {templateMeta.length} template{templateMeta.length !== 1 ? 's' : ''} encontrado{templateMeta.length !== 1 ? 's' : ''}
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 'var(--spacing-md)',
                    }}>
                        {templateMeta.map((template, i) => (
                            <TemplateCard
                                key={template.id || template.name || i}
                                template={template}
                                onExpand={() => setExpandedTemplate(template)}
                            />
                        ))}
                    </div>
                </>
            )}

            {expandedTemplate && (
                <TemplateModal template={expandedTemplate} onClose={closeModal} />
            )}
        </div>
    );
}
