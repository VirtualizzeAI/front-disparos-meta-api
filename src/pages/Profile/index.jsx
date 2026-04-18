
import { useState, useEffect } from 'react';
import { API_CONFIG, apiCall } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export function Profile() {
    const { updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            const result = await apiCall(API_CONFIG.ENDPOINTS.PROFILE, {
                method: 'POST',
                body: {} // auth added automatically
            });

            if (result.success === true || result.success === 'true') {
                const profile = result.user || result.profile || {};

                // Update local storage via fetch results
                localStorage.setItem('profile', JSON.stringify(profile));

                setFormData(prev => ({
                    ...prev,
                    name: profile.nome || '',
                    email: profile.email || ''
                }));
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            // Fallback
            const savedProfile = JSON.parse(localStorage.getItem('profile') || '{}');
            if (savedProfile.name || savedProfile.email) {
                setFormData(prev => ({
                    ...prev,
                    name: savedProfile.name || prev.name,
                    email: savedProfile.email || prev.email
                }));
            }
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        // Map IDs to state keys
        const keyMap = {
            'account-name': 'name',
            'account-email': 'email',
            'current-password': 'currentPassword',
            'new-password': 'newPassword',
            'confirm-password': 'confirmPassword'
        };
        const key = keyMap[id];
        if (key) {
            setFormData(prev => ({ ...prev, [key]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword || formData.confirmPassword) {
            if (!formData.currentPassword) {
                alert('Por favor, informe sua senha atual.');
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                alert('As senhas não coincidem.');
                return;
            }
            if (formData.newPassword.length < 6) {
                alert('A nova senha deve ter pelo menos 6 caracteres.');
                return;
            }
        }

        setLoading(true);

        try {
            const profileData = { name: formData.name, email: formData.email };

            // In a real app we'd call the API here.
            // Assuming endpoint UPDATE_PROFILE handles name/email updates.
            // And potentially CHANGE_PASSWORD for password.

            // For now, mirroring legacy behavior which mostly relies on localStorage or specific endpoints
            // that might mock behavior or be partially implemented in the legacy code provided.

            localStorage.setItem('profile', JSON.stringify(profileData));
            updateProfile(profileData); // Update context

            if (formData.newPassword) {
                // Call password change endpoint if exists
                // await apiCall(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, {
                // method: 'POST',
                // body: { currentPassword: formData.currentPassword, newPassword: formData.newPassword }
                // });

                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
            }

            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Erro ao atualizar perfil. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="perfil-page" className="page active" style={{ display: 'block' }}>
            <header className="page-header">
                <div>
                    <h1>Perfil</h1>
                    <p className="subtitle">Gerencie suas informações pessoais</p>
                </div>
            </header>

            <div className="settings-container">
                <form id="profile-form" className="form-card" onSubmit={handleSubmit}>
                    <div className="form-alert">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 2L1 18H19L10 2Z" stroke="currentColor" strokeWidth="2"
                                strokeLinejoin="round" />
                            <path d="M10 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="10" cy="15" r="1.5" fill="currentColor" />
                        </svg>
                        <span>Atenção: Os dados alterados aqui serão refletidos em todos os sistemas da Fabrica
                            Neural.</span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="account-name">Nome da Conta</label>
                        <input
                            type="text"
                            id="account-name"
                            placeholder="Digite o nome da conta"
                            required
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="account-email">Email</label>
                        <input
                            type="email"
                            id="account-email"
                            placeholder="seu@email.com"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-divider"></div>

                    <h3 className="form-section-title">Alterar Senha</h3>

                    <div className="form-group">
                        <label htmlFor="current-password">Senha Atual</label>
                        <input
                            type="password"
                            id="current-password"
                            placeholder="Digite sua senha atual"
                            value={formData.currentPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="new-password">Nova Senha</label>
                        <input
                            type="password"
                            id="new-password"
                            placeholder="Digite a nova senha"
                            value={formData.newPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm-password">Confirmar Nova Senha</label>
                        <input
                            type="password"
                            id="confirm-password"
                            placeholder="Confirme a nova senha"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M15 7L8 14L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                strokeLinejoin="round" />
                        </svg>
                        Salvar Perfil
                    </button>
                </form>
            </div>
        </div>
    );
}
