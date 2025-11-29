import { useState, useEffect } from 'react'
import api from './services/api'
import ProductForm from './ProductForm'
import RecipeForm from './RecipeForm'

function App() {
  const [produtos, setProdutos] = useState([])
  const [historico, setHistorico] = useState([])

  // Função que carrega TUDO (Produtos e Histórico)
  async function carregarDados() {
    try {
      // Fazemos as duas buscas ao mesmo tempo
      const [respostaProdutos, respostaHistorico] = await Promise.all([
        api.get('/produtos'),
        api.get('/historico')
      ])

      setProdutos(respostaProdutos.data)
      setHistorico(respostaHistorico.data) // Atualiza a tabela de baixo

    } catch (erro) {
      console.error("Erro ao buscar dados:", erro)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  async function handleProduzir(id) {
    const quantidade = prompt("Quantas unidades deseja produzir?")
    if (!quantidade) return;

    try {
      await api.post(`/produtos/${id}/producao`, {
        quantidade: parseInt(quantidade)
      })
      alert("Sucesso! Produção registrada.")

      // Recarrega tudo para o estoque cair e o histórico aparecer
      carregarDados()

    } catch (erro) {
      const msg = erro.response?.data?.message || "Erro desconhecido";
      alert("Erro: " + msg);
    }
  }

  // Função para formatar data (Ex: 2025-11-29T10:00 -> 29/11/2025 10:00)
  function formatarData(dataISO) {
    return new Date(dataISO).toLocaleString('pt-BR')
  }

  async function handleDeletar(id) {
    if (!confirm("Tem certeza? Isso apagará todo o histórico e fichas técnicas deste produto.")) {
      return;
    }

    try {
      await api.delete(`/produtos/${id}`)
      alert("Produto excluído com sucesso!")
      carregarDados()
    } catch (erro) {
      alert("Erro ao deletar: " + erro.response?.data?.message || "Erro desconhecido")
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial', backgroundColor: '#f4f4f9', minHeight: '100vh' }}>
      <h1 style={{ color: '#333' }}>🏭 Forge PCP - Controle Industrial</h1>

      <ProductForm aoSalvar={carregarDados} />
      <RecipeForm />

      {/* SEÇÃO 1: ESTOQUE */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>📦 Estoque em Tempo Real</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Produto</th>
              <th style={{ padding: '10px' }}>Tipo</th>
              <th style={{ padding: '10px' }}>Saldo Atual</th>
              <th style={{ padding: '10px' }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{p.nome}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{
                    backgroundColor: p.tipo === 'MATERIA_PRIMA' ? '#fff3cd' : '#d1e7dd',
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px'
                  }}>
                    {p.tipo === 'MATERIA_PRIMA' ? 'Insumo' : 'Finalizado'}
                  </span>
                </td>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.saldoEstoque}</td>
                <td style={{ padding: '10px' }}>
                  {/* Botão de Produzir */}
                  {p.tipo === 'PRODUTO_FINALIZADO' && (
                    <button
                      onClick={() => handleProduzir(p.id)}
                      style={{ padding: '6px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Produzir
                    </button>
                  )}

                  {/* Botão de Excluir */}
                  <button
                    onClick={() => handleDeletar(p.id)}
                    style={{ padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    title="Excluir produto e histórico"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SEÇÃO 2: HISTÓRICO */}
      <div style={{ marginTop: '40px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>📋 Histórico de Produção (Auditoria)</h2>
        {historico.length === 0 ? (
          <p style={{ color: '#777' }}>Nenhuma produção registrada ainda.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Data/Hora</th>
                <th style={{ padding: '10px' }}>Produto Produzido</th>
                <th style={{ padding: '10px' }}>Qtd. Produzida</th>
              </tr>
            </thead>
            <tbody>
              {historico.map(h => (
                <tr key={h.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px', color: '#555' }}>
                    {formatarData(h.dataProducao)}
                  </td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>
                    {h.produto?.nome || 'Produto Excluído'}
                  </td>
                  <td style={{ padding: '10px', color: '#28a745', fontWeight: 'bold' }}>
                    +{h.quantidade}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}

export default App