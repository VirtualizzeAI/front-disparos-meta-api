
import { useState, useEffect } from 'react';
import { API_CONFIG, apiCall } from '../../services/api';

export function ConnectedNumber() {
    const [formData, setFormData] = useState({
        facebookToken: '',
        phoneNumberId: '',
        wabaId: ''
    });
    const [showToken, setShowToken] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadWABAConfig();
    }, []);

    const loadWABAConfig = async () => {
        try {
            const result = await apiCall(API_CONFIG.ENDPOINTS.GET_WABA_CONFIG, {
                method: 'POST',
                body: {} // auth added automatically
            });

            if ((result.success === true || result.success === 'true') && result.config) {
                const config = result.config;
                setFormData({
                    facebookToken: config.tokenMeta || '',
                    phoneNumberId: config.numero_id || '',
                    wabaId: config.waba_id || ''
                });
                localStorage.setItem('wabaConfig', JSON.stringify(config));
            } else {
                // Fallback
                const savedConfig = JSON.parse(localStorage.getItem('wabaConfig') || '{}');
                setFormData({
                    facebookToken: savedConfig.token || '',
                    phoneNumberId: savedConfig.phoneNumberId || '',
                    wabaId: savedConfig.wabaId || ''
                });
            }
        } catch (error) {
            console.error('Error loading WABA config:', error);
            const savedConfig = JSON.parse(localStorage.getItem('wabaConfig') || '{}');
            setFormData({
                facebookToken: savedConfig.token || '',
                phoneNumberId: savedConfig.phoneNumberId || '',
                wabaId: savedConfig.wabaId || ''
            });
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        const keyMap = {
            'facebook-token': 'facebookToken',
            'phone-number-id': 'phoneNumberId',
            'waba-id': 'wabaId'
        };
        const key = keyMap[id];
        if (key) {
            setFormData(prev => ({ ...prev, [key]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const config = {
            tokenMeta: formData.facebookToken,
            phoneNumberId: formData.phoneNumberId,
            wabaId: formData.wabaId,
            token: formData.facebookToken // Legacy format seemed to store token as 'token' too locally
        };

        try {
            localStorage.setItem('wabaConfig', JSON.stringify(config));

            const result = await apiCall(API_CONFIG.ENDPOINTS.UPDATE_WABA, {
                method: 'POST',
                body: config
            });

            if (result.success === true) {
                alert('Configurações salvas com sucesso!');
            } else {
                alert('Falha ao salvar configurações. Por favor, tente novamente.');
            }
        } catch (error) {
            console.error('Error updating WABA config:', error);
            alert('Erro ao salvar configurações. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="numero-page" className="page active" style={{ display: 'block' }}>
            <header className="page-header">
                <div>
                    <h1>Número Conectado</h1>
                    <p className="subtitle">Configure as credenciais do WhatsApp Business API</p>
                </div>
            </header>

            <div className="settings-container">
                <form id="waba-form" className="form-card" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="facebook-token">Token do Facebook</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showToken ? "text" : "password"}
                                id="facebook-token"
                                placeholder="EAAxxxxxxxxxx..."
                                required
                                value={formData.facebookToken}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className="toggle-password-btn"
                                id="toggle-facebook-token"
                                title="Mostrar/Ocultar senha"
                                onClick={() => setShowToken(!showToken)}
                            >
                                {showToken ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="currentColor" />
                                        <path d="M12 17C9.24 17 7 14.76 7 12C7 10.16 7.9 8.5 9.32 7.52L7.9 6.1C5.64 7.55 4.1 9.94 4.1 12C4.1 16.5 8 20 12 20C13.56 20 15 19.5 16.27 18.7L14.75 17.18C13.92 17.7 12.99 18 12 18V17Z" fill="currentColor" />
                                        <path d="M22.5 12C22.5 9.17 21.03 6.64 18.8 5.1L2.2 21.7L3.6 23.1L21.7 5C21.97 5.25 22.25 5.51 22.5 5.8V12Z" fill="currentColor" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M12 5C7 5 2.73 8.11 1 12.5C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12.5C21.27 8.11 17 5 12 5M12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17M12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
                                            fill="currentColor" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <small className="form-hint">Token de acesso permanente do Facebook Business</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone-number-id">ID do Número</label>
                        <input
                            type="text"
                            id="phone-number-id"
                            placeholder="123456789012345"
                            required
                            value={formData.phoneNumberId}
                            onChange={handleChange}
                        />
                        <small className="form-hint">ID do número de telefone no WhatsApp Business</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="waba-id">ID da Conta WABA</label>
                        <input
                            type="text"
                            id="waba-id"
                            placeholder="123456789012345"
                            required
                            value={formData.wabaId}
                            onChange={handleChange}
                        />
                        <small className="form-hint">ID da conta WhatsApp Business API</small>
                    </div>

                    <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M15 7L8 14L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                strokeLinejoin="round" />
                        </svg>
                        Salvar Configurações
                    </button>
                </form>
            </div>
        </div>
    );
}
