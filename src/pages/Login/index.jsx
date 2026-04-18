
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './styles.css';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Por favor, preencha todos os campos.');
            return;
        }

        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            // Success handles redirection in useEffect or AuthContext state change
        } else {
            setError(result.message || 'Erro ao fazer login. Verifique suas credenciais.');
            setIsLoading(false);
        }
    };

    return (
        <div className="login-body">
            <div className="particles">
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
            </div>

            <div className="login-container">
                <div className="login-left">
                    <div className="login-branding">
                        <div className="logo-large">
                            <svg width="64" height="64" viewBox="0 0 32 32" fill="none">
                                <path d="M16 2L4 8V14C4 21.5 9 28.5 16 30C23 28.5 28 21.5 28 14V8L16 2Z" fill="url(#gradient-large)" />
                                <defs>
                                    <linearGradient id="gradient-large" x1="4" y1="2" x2="28" y2="30">
                                        <stop offset="0%" stopColor="#667eea" />
                                        <stop offset="100%" stopColor="#764ba2" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <h1>Fabrica Neural</h1>
                        <p className="tagline">Gestão de Disparos em Massa</p>
                        <p className="description">
                            Potencialize suas campanhas de marketing com nossa plataforma de disparos automatizados para WhatsApp API.
                        </p>
                        <div className="features-list">
                            <div className="feature-item">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor" />
                                </svg>
                                <span>Alta taxa de entrega</span>
                            </div>
                            <div className="feature-item">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor" />
                                </svg>
                                <span>Relatórios detalhados</span>
                            </div>
                            <div className="feature-item">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor" />
                                </svg>
                                <span>Segurança garantida</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="login-right">
                    <div className="login-form-container">
                        <div className="login-header">
                            <h2>Bem-vindo de volta!</h2>
                            <p>Acesse sua conta para gerenciar disparos</p>
                        </div>

                        {error && (
                            <div className="error-message show">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
                                    <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <form className="login-form" onSubmit={handleSubmit} id="login-form">
                            <div className="form-group">
                                <div className="input-with-icon">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" fill="currentColor" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" fill="currentColor" />
                                    </svg>
                                    <input
                                        type="email"
                                        id="login-email"
                                        placeholder="Seu email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="input-with-icon">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" fill="currentColor" />
                                    </svg>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="login-password"
                                        placeholder="Sua senha"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        id="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="eye-open">
                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" />
                                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" fill="currentColor" />
                                            </svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="eye-closed">
                                                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" fill="currentColor" />
                                                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" fill="currentColor" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="form-options">
                                <label className="checkbox-container">
                                    <input type="checkbox" id="remember-me" />
                                    <span className="checkmark"></span>
                                    <span className="checkbox-label">Lembrar-me</span>
                                </label>
                                <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); alert('Funcionalidade de recuperação de senha em desenvolvimento.'); }}>Esqueceu a senha?</a>
                            </div>

                            <button type="submit" className={`btn btn-primary login-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                                <span className="btn-text">Entrar na Plataforma</span>
                                <div className="btn-icon">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M4 12L16 12M16 12L10 6M16 12L10 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="spinner">
                                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="50" strokeDashoffset="25" />
                                </svg>
                            </button>
                        </form>

                        <div className="login-footer">
                            <p>Não tem uma conta? <a href="#" className="signup-link" onClick={(e) => { e.preventDefault(); alert('Funcionalidade de cadastro em desenvolvimento.'); }}>Fale conosco</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
