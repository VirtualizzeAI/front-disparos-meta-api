
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG, apiCall, getAuthCredentials } from '../../services/api';

export function NewBlast() {
    const [templates, setTemplates] = useState([]);
    const [templateMeta, setTemplateMeta] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [campaignName, setCampaignName] = useState('');
    const [contactsFile, setContactsFile] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    // Removed simple previewText state in favor of derived rendering

    const fileInputRef = useRef(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadTemplates();

        // Click outside listener for dropdown
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const loadTemplates = async () => {
        try {
            const { token } = getAuthCredentials();
            const result = await apiCall('/get-templates', {
                method: 'POST',
                body: { authToken: token }
            });

            if (result.success === true || result.success === 'true') {
                setTemplates(result.templates || []);
                setTemplateMeta(result.templateMeta || []);
            } else {
                console.warn(result.message || 'Falha ao carregar templates');
            }
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setContactsFile(file);
        }
    };

    const handleClearFile = (e) => {
        e.stopPropagation();
        setContactsFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUploadAreaClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!campaignName || !selectedTemplate || !contactsFile) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        setLoading(true);

        try {
            const auth = getAuthCredentials();
            const formData = new FormData();
            formData.append('campaignName', campaignName);
            formData.append('template', selectedTemplate);
            formData.append('token', auth.token);
            formData.append('userId', auth.userId);
            formData.append('contacts', contactsFile);

            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_BLAST}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Falha ao criar disparo');
            }

            await response.json(); // Wait for response body

            alert('Disparo iniciado com sucesso!');
            navigate('/dashboard');

        } catch (error) {
            console.error('Error creating blast:', error);
            alert('Erro ao iniciar disparo. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const renderTemplatePreview = () => {
        if (!selectedTemplate) {
            return (
                <div className="message-text">
                    <p>Sua mensagem aparecerá aqui...</p>
                </div>
            );
        }

        const template = templateMeta.find(t => t.name === selectedTemplate);
        if (!template) {
            return (
                <div className="message-text">
                    <p>Carregando preview...</p>
                </div>
            );
        }

        return (
            <div className="template-preview-content">
                {template.components.map((component, index) => {
                    switch (component.type) {
                        case 'HEADER':
                            if (component.format === 'VIDEO' && component.example?.header_handle?.[0]) {
                                return (
                                    <div key={index} className="preview-header-media">
                                        <video controls src={component.example.header_handle[0]} style={{ width: '100%', borderRadius: '8px', marginBottom: '8px' }} />
                                    </div>
                                );
                            }
                            if (component.format === 'IMAGE' && component.example?.header_handle?.[0]) {
                                return (
                                    <div key={index} className="preview-header-media">
                                        <img src={component.example.header_handle[0]} alt="Header" style={{ width: '100%', borderRadius: '8px', marginBottom: '8px' }} />
                                    </div>
                                );
                            }
                            if (component.format === 'TEXT') {
                                return <p key={index} className="preview-header-text" style={{ fontWeight: 'bold', marginBottom: '8px' }}>{component.text}</p>;
                            }
                            return null;

                        case 'BODY':
                            let text = component.text;
                            if (component.example?.body_text?.[0]) {
                                component.example.body_text[0].forEach((val, i) => {
                                    text = text.replace(`{{${i + 1}}}`, val);
                                });
                            }
                            return (
                                <p key={index} className="preview-body-text" style={{ whiteSpace: 'pre-wrap' }}>
                                    {text}
                                </p>
                            );

                        case 'FOOTER':
                            return (
                                <p key={index} className="preview-footer-text" style={{ fontSize: '0.8em', color: 'gray', marginTop: '8px' }}>
                                    {component.text}
                                </p>
                            );

                        case 'BUTTONS':
                            return (
                                <div key={index} className="preview-buttons" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {component.buttons.map((btn, btnIndex) => (
                                        <button key={btnIndex} disabled className="preview-btn" style={{
                                            width: '100%',
                                            padding: '8px',
                                            backgroundColor: 'white',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '4px',
                                            color: '#00a884',
                                            fontWeight: '500',
                                            cursor: 'default'
                                        }}>
                                            {btn.text}
                                        </button>
                                    ))}
                                </div>
                            );

                        default:
                            return null;
                    }
                })}
            </div>
        );
    };

    return (
        <div id="disparo-page" className="page active" style={{ display: 'block' }}>
            <header className="page-header">
                <div>
                    <h1>Novo Disparo</h1>
                    <p className="subtitle">Configure sua campanha de disparo em massa</p>
                </div>
            </header>

            <div className="split-layout">
                <div className="split-left">
                    <form id="blast-form" className="form-card" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="campaign-name">Nome da Campanha</label>
                            <input
                                type="text"
                                id="campaign-name"
                                placeholder="Ex: Promoção Black Friday"
                                required
                                value={campaignName}
                                onChange={(e) => setCampaignName(e.target.value)}
                            />
                        </div>

                        <div className="form-group" ref={dropdownRef}>
                            <label htmlFor="template-select">Template do Facebook</label>
                            <div className="custom-select-wrapper">
                                <div className="custom-select">
                                    <div
                                        className={`custom-select-display ${isDropdownOpen ? 'active' : ''} ${selectedTemplate ? 'selected' : ''}`}
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    >
                                        {selectedTemplate ? (
                                            <span className="select-value">{selectedTemplate}</span>
                                        ) : (
                                            <span className="select-placeholder">Selecione um template</span>
                                        )}
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2"
                                                strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>

                                    {isDropdownOpen && (
                                        <div className="custom-select-dropdown" style={{ display: 'block' }}>
                                            <div className="custom-select-options">
                                                {templates.map(template => (
                                                    <div
                                                        key={template}
                                                        className={`custom-select-option ${selectedTemplate === template ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            setSelectedTemplate(template);
                                                            setIsDropdownOpen(false);
                                                        }}
                                                    >
                                                        {template}
                                                    </div>
                                                ))}
                                                {templates.length === 0 && (
                                                    <div className="custom-select-option" style={{ cursor: 'default', color: 'var(--text-muted)' }}>
                                                        Nenhum template encontrado
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <select
                                    id="template-select"
                                    style={{ display: 'none' }}
                                    required
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                >
                                    <option value="" disabled>Selecione um template</option>
                                    {templates.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="contacts-file">Lista de Contatos</label>
                            <div
                                className="file-upload-area"
                                id="contacts-upload-area"
                                onClick={!contactsFile ? handleUploadAreaClick : undefined}
                                style={{ cursor: contactsFile ? 'default' : 'pointer' }}
                            >
                                <input
                                    type="file"
                                    id="contacts-file"
                                    accept=".xlsx,.xls,.csv"
                                    hidden
                                    required
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />

                                {!contactsFile ? (
                                    <div className="upload-placeholder">
                                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                            <path
                                                d="M28 4H12C10.9 4 10 4.9 10 6V42C10 43.1 10.9 44 12 44H36C37.1 44 38 43.1 38 42V16L28 4Z"
                                                stroke="currentColor" strokeWidth="2" />
                                            <path d="M28 4V16H38" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                        <p>Clique para selecionar planilha</p>
                                        <span>Excel ou CSV</span>
                                    </div>
                                ) : (
                                    <div className="file-selected" id="contacts-selected" style={{ display: 'flex' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" />
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                        <span id="contacts-filename">{contactsFile.name}</span>
                                        <button
                                            type="button"
                                            className="remove-file-btn"
                                            id="remove-contacts-btn"
                                            onClick={handleClearFile}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                            {loading ? (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="50" strokeDashoffset="25" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M2 3L18 10L2 17V11L13 10L2 9V3Z" fill="currentColor" />
                                </svg>
                            )}
                            {loading ? ' Enviando...' : ' Iniciar Disparo'}
                        </button>
                    </form>
                </div>

                <div className="split-right">
                    <div className="preview-card">
                        <h3>Prévia WhatsApp</h3>
                        <div className="whatsapp-preview">
                            <div className="whatsapp-header">
                                <div className="whatsapp-avatar"></div>
                                <div className="whatsapp-info">
                                    <p className="whatsapp-name">Sua Empresa</p>
                                    <p className="whatsapp-status">online</p>
                                </div>
                            </div>
                            <div className="whatsapp-chat">
                                <div className="whatsapp-message">
                                    {renderTemplatePreview()}
                                    <div className="message-time">12:00</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
