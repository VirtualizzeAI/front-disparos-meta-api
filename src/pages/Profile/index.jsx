
import { useState, useEffect } from 'react';
import { API_CONFIG, apiCall } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export function Profile() {
    const { updateProfile, user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            const result = await apiCall(API_CONFIG.ENDPOINTS.PROFILE, {
                method: 'POST',
                body: {} // auth added automatically
            });

            const profile = result?.user || result?.profile || result?.data || result || {};
            const resolvedName = profile.nome || profile.name || user?.name || user?.nome || '';
            const resolvedEmail = profile.email || user?.email || '';

            if (resolvedName || resolvedEmail) {
                localStorage.setItem('profile', JSON.stringify({
                    name: resolvedName,
                    email: resolvedEmail
                }));

                setFormData(prev => ({
                    ...prev,
                    name: resolvedName,
                    email: resolvedEmail
                }));
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            // Fallback
            const savedProfile = JSON.parse(localStorage.getItem('profile') || '{}');
            const fallbackName = savedProfile.name || savedProfile.nome || user?.name || user?.nome || '';
            const fallbackEmail = savedProfile.email || user?.email || '';

            if (fallbackName || fallbackEmail) {
                setFormData(prev => ({
                    ...prev,
                    name: fallbackName || prev.name,
                    email: fallbackEmail || prev.email
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

    const handleProfileUpdate = async () => {
        if (!formData.name || !formData.email) {
            alert('Preencha nome e email para continuar.');
            return;
        }

        setLoadingProfile(true);

        try {
            const profileData = {
                nome: formData.name,
                email: formData.email
            };

            await apiCall(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, {
                method: 'POST',
                body: profileData
            });

            localStorage.setItem('profile', JSON.stringify({
                name: formData.name,
                email: formData.email
            }));
            updateProfile({ name: formData.name, email: formData.email });

            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Erro ao atualizar perfil. Por favor, tente novamente.');
        } finally {
            setLoadingProfile(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!formData.currentPassword) {
            alert('Por favor, informe sua senha atual.');
            return;
        }
        if (!formData.newPassword || !formData.confirmPassword) {
            alert('Preencha a nova senha e a confirmação.');
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

        setLoadingPassword(true);

        try {
            await apiCall(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, {
                method: 'POST',
                body: {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                }
            });

            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));

            alert('Senha atualizada com sucesso!');
        } catch (error) {
            console.error('Error changing password:', error);
            alert('Erro ao atualizar senha. Por favor, tente novamente.');
        } finally {
            setLoadingPassword(false);
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
                <form id="profile-form" className="form-card" onSubmit={(e) => e.preventDefault()}>
                    

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

                    <button
                        type="button"
                        className="btn btn-primary btn-large"
                        onClick={handleProfileUpdate}
                        disabled={loadingProfile || loadingPassword}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M15 7L8 14L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                strokeLinejoin="round" />
                        </svg>
                        {loadingProfile ? 'Atualizando...' : 'Atualizar Perfil'}
                    </button>

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

                    <button
                        type="button"
                        className="btn btn-primary btn-large"
                        onClick={handlePasswordChange}
                        disabled={loadingProfile || loadingPassword}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M15 7L8 14L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                strokeLinejoin="round" />
                        </svg>
                        {loadingPassword ? 'Atualizando...' : 'Alterar Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
}
