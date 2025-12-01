package com.forgepcp.service;

import com.forgepcp.model.ItemFichaTecnica;
import com.forgepcp.model.HistoricoProducao;
import com.forgepcp.model.Produto;
import com.forgepcp.model.TipoProduto;
import com.forgepcp.repository.ItemFichaTecnicaRepository;
import com.forgepcp.repository.HistoricoProducaoRepository;
import com.forgepcp.repository.ProdutoRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final ItemFichaTecnicaRepository fichaTecnicaRepository;
    private final HistoricoProducaoRepository historicoRepository;

    public ProdutoService(
            ProdutoRepository produtoRepository,
            ItemFichaTecnicaRepository fichaTecnicaRepository,
            HistoricoProducaoRepository historicoRepository) {
        this.produtoRepository = produtoRepository;
        this.fichaTecnicaRepository = fichaTecnicaRepository;
        this.historicoRepository = historicoRepository;
    }

    // 1 Passo: Salvar o Produto
    @Transactional
    public Produto salvar(Produto produto) {
        // Validação simples, o nome não pode ser vazio
        if (produto.getNome() == null || produto.getNome().isEmpty()) {
            throw new IllegalArgumentException("O nome do produto é obrigatório.");
        }
        return produtoRepository.save(produto);
    }

    // 2 Passo: Cérebro do Sistema
    @Transactional
    public void adicionarInsumo(Long idProdutoPai, Long idMaterial, Integer quantidade) {
        Produto pai = produtoRepository.findById(idProdutoPai)
                .orElseThrow(() -> new IllegalArgumentException("Produto pai não encontrado."));

        Produto material = produtoRepository.findById(idMaterial)
                .orElseThrow(() -> new IllegalArgumentException("Material não encontrado"));
        // Só pode adicionar insumos se o Pai for PRODUTO_FINALIZADO
        if (!pai.getTipo().equals(TipoProduto.PRODUTO_FINALIZADO)) {
            throw new RuntimeException("Apenas produtos finalizados podem ter ficha técnica.");
        }

        java.util.Optional<ItemFichaTecnica> itemExistente = fichaTecnicaRepository.findByProdutoPaiAndMaterial(pai,
                material);

        if (itemExistente.isPresent()) {
            ItemFichaTecnica item = itemExistente.get();
            item.setQuantidade(quantidade);
            fichaTecnicaRepository.save(item);
        } else {
            ItemFichaTecnica item = new ItemFichaTecnica();
            item.setProdutoPai(pai);
            item.setMaterial(material);
            item.setQuantidade(quantidade);
            fichaTecnicaRepository.save(item);
        }
        atualizarCustoDoProduto(pai);
    }

    // 3 Passo: Registrar Produção
    @Transactional
    public void registrarProducao(Long idProduto, Integer quantidadeProducao) {
        // 3.1: Achar o produto final
        Produto produtoFinal = produtoRepository.findById(idProduto)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));

        // 3.2: Buscar a receita do produto
        List<ItemFichaTecnica> receita = fichaTecnicaRepository.findByProdutoPaiId(idProduto);
        if (receita.isEmpty()) {
            throw new IllegalArgumentException("Erro: O produto não possui Ficha Técnica definida.");
        }

        // 3.3: Validar se tem estoque de tudo antes de começar
        for (ItemFichaTecnica item : receita) {
            Produto materiaPrima = item.getMaterial();
            int necessario = item.getQuantidade() * quantidadeProducao;

            // Caso o estoque é menor do que o necessário vai dar erro
            if (materiaPrima.getSaldoEstoque() < necessario) {
                throw new IllegalArgumentException(
                        "Estoque insuficiente de: " + materiaPrima.getNome() +
                                ". Precisa de " + necessario + ", tem apenas " + materiaPrima.getSaldoEstoque());
            }
        }

        // 3.4: Se passou pela verificação, irá deduzir o estoque
        for (ItemFichaTecnica item : receita) {
            Produto materiaPrima = item.getMaterial();
            int necessario = item.getQuantidade() * quantidadeProducao;

            materiaPrima.setSaldoEstoque(materiaPrima.getSaldoEstoque() - necessario);
            produtoRepository.save(materiaPrima);
        }

        // 3.5: Adiciona o produto final no estoque
        produtoFinal.setSaldoEstoque(produtoFinal.getSaldoEstoque() + quantidadeProducao);
        produtoRepository.save(produtoFinal);

        // 3.6: Gravar o rastro de auditoria
        HistoricoProducao historico = new HistoricoProducao();
        historico.setProduto(produtoFinal);
        historico.setQuantidade(quantidadeProducao);
        historico.setDataProducao(LocalDateTime.now());

        historicoRepository.save(historico);
    }

    // 4 Passo: Listar o historico de produção
    public List<HistoricoProducao> listarHistorico() {
        // Buscar por tudo e ordenar pelo mais recente primeiro
        return historicoRepository.findAll(Sort.by(Sort.Direction.DESC, "dataProducao"));
    }

    public List<Produto> listarTodos() {
        return produtoRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    // 5 Passo: Deletar produtos
    @Transactional
    public void deletar(Long id) {

        // 5.1: Limpar o rastro no historico de produção
        historicoRepository.deleteByProdutoId(id);

        // 5.2: Limpar a parte da engenharia (Remover a receita do produto)
        fichaTecnicaRepository.deleteByProdutoPaiId(id);

        // 5.3: Remover ele das receitas de outrém
        fichaTecnicaRepository.deleteByMaterialId(id);

        // 5.4: Apagar o produto
        produtoRepository.deleteById(id);

    }

    // 6 Passo: Permissão para o funcionário adicionar remessas
    @Transactional
    public void reabastecer(Long idProduto, Integer quantidade) {
        if (quantidade <= 0)
            throw new IllegalArgumentException("Quantidade deve ser maior que zero");

        Produto produto = produtoRepository.findById(idProduto)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));

        produto.setSaldoEstoque(produto.getSaldoEstoque() + quantidade);
        produtoRepository.save(produto);
    }

    // 7 Passo: Atualização do custo final do produto manufaturado`
    private void atualizarCustoDoProduto(Produto produtoPai) {
        List<ItemFichaTecnica> receita = fichaTecnicaRepository.findByProdutoPaiId(produtoPai.getId());

        BigDecimal custoTotal = BigDecimal.ZERO;

        for (ItemFichaTecnica item : receita) {
            BigDecimal custoMaterial = item.getMaterial().getCusto();
            BigDecimal quantidade = new BigDecimal(item.getQuantidade());
            BigDecimal custoLinha = custoMaterial.multiply(quantidade);
            custoTotal = custoTotal.add(custoLinha);
        }

        produtoPai.setCusto(custoTotal);
        produtoRepository.save(produtoPai);
    }

    // 8 Passo: Consultar a receita dos produtos manufaturados
    public List<ItemFichaTecnica> buscarReceita(Long idProdutoPai) {
        return fichaTecnicaRepository.findByProdutoPaiId(idProdutoPai);
    }
}