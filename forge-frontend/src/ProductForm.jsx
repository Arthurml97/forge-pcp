import { useState } from 'react';
import api from './services/api';

function ProductForm({ aoSalvar }) {
    // Estados para cada campo do formulário
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [custo, setCusto] = useState('');
    const [tipo, setTipo] = useState('MATERIA_PRIMA');
    const [estoqueInicial, setEstoqueInicial] = useState(0);

    async function handleSubmit(e) {
        e.preventDefault(); // Evita que a página recarregue

        try {
            await api.post('/produtos', {
                nome,
                descricao,
                custo: parseFloat(custo), // Converte texto "10.50" para número
                saldoEstoque: parseInt(estoqueInicial),
                tipo
            });

            alert('Produto cadastrado com sucesso!');

            // Limpa o formulário
            setNome('');
            setDescricao('');
            setCusto('');
            setEstoqueInicial(0);

            // Avisa o App.jsx para recarregar a tabela
            if (aoSalvar) aoSalvar();

        } catch (erro) {
            alert('Erro ao salvar: ' + (erro.response?.data?.message || erro.message));
        }
    }

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#fff' }}>
            <h3>🆕 Novo Produto</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Nome:</label>
                    <input required value={nome} onChange={e => setNome(e.target.value)} style={{ padding: '5px' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Tipo:</label>
                    <select value={tipo} onChange={e => setTipo(e.target.value)} style={{ padding: '6px' }}>
                        <option value="MATERIA_PRIMA">Matéria Prima</option>
                        <option value="PRODUTO_FINALIZADO">Produto Final</option>
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Custo (R$):</label>
                    <input type="number" step="0.01" required value={custo} onChange={e => setCusto(e.target.value)} style={{ padding: '5px', width: '80px' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Estoque Inicial:</label>
                    <input type="number" value={estoqueInicial} onChange={e => setEstoqueInicial(e.target.value)} style={{ padding: '5px', width: '60px' }} />
                </div>

                <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', height: '36px' }}>
                    Salvar
                </button>
            </form>
        </div>
    );
}

export default ProductForm;