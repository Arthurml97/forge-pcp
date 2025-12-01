import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from './services/api';

function Login({ onLoginSuccess }) {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    async function handleLogin(e) {
        e.preventDefault();
        try {
            const response = await api.post('http://localhost:8080/auth/login', {
                login,
                password
            });

            const token = response.data.token;

            // 1. Salva o Token no "Cofre" do navegador
            localStorage.setItem('forge_token', token);

            // 2. Configura o Axios para usar esse token daqui pra frente
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // 3. Avisa o App que deu certo
            onLoginSuccess();

        } catch (erro) {
            toast.error('Login falhou! Verifique usuário e senha.');
            console.error(erro);
        }
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#2c3e50' }}>
            <form onSubmit={handleLogin} style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h2 style={{ textAlign: 'center', color: '#333' }}> Forge PCP</h2>

                <ToastContainer position="top-left" autoClose={4000} />

                <input
                    placeholder="Usuário"
                    value={login}
                    onChange={e => setLogin(e.target.value)}
                    style={{ padding: '10px', fontSize: '16px' }}
                />

                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ padding: '10px', fontSize: '16px' }}
                />

                <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
                    Entrar
                </button>
            </form>
        </div>
    );
}

export default Login;