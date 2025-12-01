import { useState, useEffect } from 'react'
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from './services/api'
import ProductForm from './ProductForm'
import RecipeForm from './RecipeForm'
import Login from './Login'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [produtos, setProdutos] = useState([])
  const [historico, setHistorico] = useState([])
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: null,
    loading: false
  });
  const materiasPrimas = produtos.filter(p => p.tipo === 'MATERIA_PRIMA');
  const produtosAcabados = produtos.filter(p => p.tipo === 'PRODUTO_FINALIZADO');

  // Inicialização e Segurança
  useEffect(() => {
    const token = localStorage.getItem('forge_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setIsAuthenticated(true);
        carregarDados();
      } catch (error) {
        logout();
      }
    }
  }, []);

  function logout() {
    localStorage.removeItem('forge_token');
    api.defaults.headers.common['Authorization'] = undefined;
    setIsAuthenticated(false);
    setUserRole('');
    setProdutos([]);
    setHistorico([]);
  }

  // --- Ações ---

  async function carregarDados() {
    try {
      const [resProdutos, resHistorico] = await Promise.all([
        api.get('/produtos'),
        api.get('/historico')
      ])
      setProdutos(resProdutos.data)
      setHistorico(resHistorico.data)
    } catch (erro) {
      if (erro.response?.status === 403) logout(); // Se perder permissão, desloga
    }
  }

  let hoverTimeout;
  const handleMouseEnter = async (e, id) => {
    const x = e.clientX;
    const y = e.clientY;

    setTooltip({ visible: true, x, y, content: null, loading: true });

    try {
      const response = await api.get(`/produtos/${id}/ficha-tecnica`);
      setTooltip({
        visible: true,
        x,
        y,
        content: response.data,
        loading: false
      });
    } catch (error) {
      setTooltip(prev => ({ ...prev, loading: false }));
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, content: null, loading: false });
  };

  async function handleAbastecer(id) {
    const qtd = prompt("Quantidade a dar entrada:")
    if (!qtd) return;
    try {
      await api.post(`/produtos/${id}/reabastecer`, { quantidade: parseInt(qtd) })
      toast.success("Estoque reabastecido!")
      carregarDados()
    } catch (erro) {
      toast.error("Erro: " + (erro.response?.data?.message || erro.message))
    }
  }

  async function handleProduzir(id) {
    const qtd = prompt("Quantidade a produzir:")
    if (!qtd) return;
    try {
      await api.post(`/produtos/${id}/producao`, { quantidade: parseInt(qtd) })
      toast.success("Produção registrada!")
      carregarDados()
    } catch (erro) {
      toast.error("Erro: " + (erro.response?.data?.message || erro.message))
    }
  }

  async function handleDeletar(id) {
    if (confirm("Confirmar exclusão?")) {
      try {
        await api.delete(`/produtos/${id}`)
        toast.success("Excluído com sucesso.")
        carregarDados()
      } catch (erro) {
        toast.error("Erro: " + (erro.response?.data?.message || erro.message))
      }
    }
  }

  function formatarData(dataISO) {
    return new Date(dataISO).toLocaleString('pt-BR')
  }

  if (!isAuthenticated) return <Login onLoginSuccess={() => window.location.reload()} />;

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial', backgroundColor: '#f4f4f9', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ color: '#333' }}> Forge PCP <span style={{ fontSize: '14px', color: '#666' }}>({userRole === 'ADMIN' ? 'Gerente' : 'Operador'})</span></h1>
        <button onClick={logout} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}>Sair</button>
      </div>

      <ToastContainer position="top-left" autoClose={4000} />

      {tooltip.visible && (
        <div style={{
          position: 'fixed',
          top: tooltip.y - 10, // Um pouco acima do mouse
          left: tooltip.x + 20,
          backgroundColor: '#333',
          color: '#fff',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 1000,
          pointerEvents: 'none', // O mouse ignora o tooltip para não piscar
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          minWidth: '150px'
        }}>
          <strong style={{ color: '#ffd700' }}>Ficha Técnica:</strong>
          {tooltip.loading ? (
            <div>Carregando receita...</div>
          ) : (
            <ul style={{ paddingLeft: '20px', margin: '5px 0 0 0' }}>
              {tooltip.content && tooltip.content.length > 0 ? (
                tooltip.content.map(item => (
                  <li key={item.id}>
                    {item.quantidade}x {item.material.nome}
                  </li>
                ))
              ) : (
                <li style={{ color: '#aaa', listStyle: 'none' }}>Sem receita definida.</li>
              )}
            </ul>
          )}
        </div>
      )}

      {/* ÁREA GERENCIAL (Apenas ADMIN) */}
      {userRole === 'ADMIN' && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <ProductForm aoSalvar={carregarDados} />
          </div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            {/* Passamos a lista de produtos já carregada para o RecipeForm */}
            <RecipeForm produtosDisponiveis={produtos} aoAtualizar={carregarDados} />
          </div>
        </div>
      )}

      {/* PAINEL 1: PRODUTOS MANUFATURADOS*/}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px', borderLeft: '5px solid #28a745' }}>
        <h2 style={{ color: '#28a745', marginTop: 0 }}>Produtos Manufaturados</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#555', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '10px' }}>ID</th>
              <th style={{ padding: '10px' }}>Produto</th>
              <th style={{ padding: '10px' }}>Custo Industrial</th>
              <th style={{ padding: '10px' }}>Estoque Físico</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtosAcabados.map(p => {
              const custo = p.custo || 0; // Calculado pelo Backend
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px', color: '#999' }}>{p.id}</td>
                  <td
                    style={{ padding: '10px', fontWeight: 'bold', cursor: 'help', textDecoration: 'underline dotted' }}
                    onMouseEnter={(e) => handleMouseEnter(e, p.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {p.nome}
                  </td>
                  {/* Custo Industrial (Automático) */}
                  <td style={{ padding: '10px', color: '#666', fontWeight: 'bold' }}>
                    R$ {custo.toFixed(2)}
                  </td>

                  <td style={{ padding: '10px', fontSize: '18px' }}>{p.saldoEstoque}</td>

                  <td style={{ padding: '10px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={() => handleProduzir(p.id)} style={btnStyle('#28a745')}>Produzir</button>
                    {userRole === 'ADMIN' && (
                      <button onClick={() => handleDeletar(p.id)} style={btnStyle('#dc3545')}>Excluir</button>
                    )}
                  </td>
                </tr>
              );
            })}
            {produtosAcabados.length === 0 && <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Nenhum produto cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* PAINEL 2: MATÉRIA PRIMA */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px', borderLeft: '5px solid #17a2b8' }}>
        <h2 style={{ color: '#17a2b8', marginTop: 0 }}> Matéria Prima (Insumos)</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#555', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '10px' }}>ID</th>
              <th style={{ padding: '10px' }}>Material</th>
              <th style={{ padding: '10px' }}>Custo</th>
              <th style={{ padding: '10px' }}>Saldo Atual</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {materiasPrimas.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px', color: '#999' }}>{p.id}</td>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.nome}</td>
                <td style={{ padding: '10px', color: '#555' }}>R$ {p.custo}</td>
                <td style={{ padding: '10px', fontSize: '18px', color: p.saldoEstoque < 10 ? 'red' : 'black' }}>
                  {p.saldoEstoque}
                </td>
                <td style={{ padding: '10px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button onClick={() => handleAbastecer(p.id)} style={btnStyle('#17a2b8')}>Entrada</button>
                  {userRole === 'ADMIN' && (
                    <button onClick={() => handleDeletar(p.id)} style={btnStyle('#dc3545')}>Excluir</button>
                  )}
                </td>
              </tr>
            ))}
            {materiasPrimas.length === 0 && <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Nenhum insumo cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* PAINEL 3: TABELA DE HISTÓRICO */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Auditoria de Produção</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#555' }}>
              <th style={{ padding: '10px' }}>Data/Hora</th>
              <th style={{ padding: '10px' }}>Produto</th>
              <th style={{ padding: '10px' }}>Qtd</th>
            </tr>
          </thead>
          <tbody>
            {historico.map(h => (
              <tr key={h.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px', color: '#666' }}>{formatarData(h.dataProducao)}</td>
                <td style={{ padding: '10px' }}>{h.produto?.nome || <span style={{ color: 'red' }}>Deletado</span>}</td>
                <td style={{ padding: '10px', fontWeight: 'bold', color: 'green' }}>+{h.quantidade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
const btnStyle = (bg) => ({
  padding: '6px 12px', background: bg, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px'
})

export default App