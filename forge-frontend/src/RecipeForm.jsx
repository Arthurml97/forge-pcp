import { useState, useEffect } from 'react';
import api from './services/api';

function RecipeForm() {
    const [produtos, setProdutos] = useState([]);
    const [produtoPai, setProdutoPai] = useState('');
    const [material, setMaterial] = useState('');
    const [quantidade, setQuantidade] = useState(1);

    // Carrega a lista de produtos para preencher os Selects
    useEffect(() => {
        api.get('/produtos').then(res => setProdutos(res.data));
    }, []);

    async function handleSalvarReceita(e) {
        e.preventDefault();
        if (!produtoPai || !material) return alert("Selecione os produtos!");

        if (produtoPai === material) return alert("Um produto não pode ser feito dele mesmo!");

        try {
            // Chama o endpoint: POST /produtos/{id}/ficha-tecnica
            await api.post(`/produtos/${produtoPai}/ficha-tecnica`, {
                idMaterial: parseInt(material),
                quantidade: parseInt(quantidade)
            });

            alert(`Receita definida! Agora o produto ID ${produtoPai} consome o item ID ${material}.`);
            setQuantidade(1);
        } catch (erro) {
            alert('Erro: ' + (erro.response?.data?.message || erro.message));
        }
    }

    // Filtros visuais
    const acabados = produtos.filter(p => p.tipo === 'PRODUTO_FINALIZADO');
    const insumos = produtos.filter(p => p.tipo === 'MATERIA_PRIMA');

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#fff' }}>
            <h3 style={{ color: '#d35400' }}>⚙️ Engenharia (Definir Receita)</h3>
            <form onSubmit={handleSalvarReceita} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Produto Final (O que vou fazer?):</label>
                    <select value={produtoPai} onChange={e => setProdutoPai(e.target.value)} style={{ padding: '5px' }}>
                        <option value="">Selecione...</option>
                        {acabados.map(p => (
                            <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Ingrediente (O que vou gastar?):</label>
                    <select value={material} onChange={e => setMaterial(e.target.value)} style={{ padding: '5px' }}>
                        <option value="">Selecione...</option>
                        {insumos.map(p => (
                            <option key={p.id} value={p.id}>{p.nome} (Saldo: {p.saldoEstoque})</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Qtd Necessária:</label>
                    <input type="number" min="1" value={quantidade} onChange={e => setQuantidade(e.target.value)} style={{ padding: '5px', width: '60px' }} />
                </div>

                <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#d35400', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', height: '36px' }}>
                    Vincular
                </button>
            </form>
        </div>
    );
}

export default RecipeForm;