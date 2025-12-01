package com.forgepcp.controller;

import com.forgepcp.dto.ItemFichaRequestDTO;
import com.forgepcp.dto.ProducaoRequestDTO;
import com.forgepcp.model.ItemFichaTecnica;
import com.forgepcp.model.Produto;
import com.forgepcp.service.ProdutoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    // 1 Passo: Endpoint para listar tudo --/ GET /api/produtos
    @GetMapping
    public ResponseEntity<List<Produto>> listar() {
        return ResponseEntity.ok(produtoService.listarTodos());
    }

    // 2 Passo: Endpoint para salvar o produto (Tanto a matéria prima, quanto o
    // produto finalizado) --/ POST /api/produtos
    @PostMapping
    public ResponseEntity<Produto> salvar(@RequestBody Produto produto) {
        Produto salvo = produtoService.salvar(produto);
        // Retorna o produto salvo (201 Created) e o local onde foi criado
        return ResponseEntity.created(URI.create("/api/produtos/" + salvo.getId())).body(salvo);
    }

    // 3 Passo: Adicionar o item na ficha tecnica --/ POST
    // /api/produtos/{id}/ficha-tecnica
    @PostMapping("/{id}/ficha-tecnica")
    public ResponseEntity<Void> adicionarItemFicha(
            @PathVariable Long id,
            @RequestBody ItemFichaRequestDTO request) {
        produtoService.adicionarInsumo(id, request.idMaterial(), request.quantidade());
        return ResponseEntity.ok().build();
    }

    // 4 Passo: Endpoint de Produção --/ POST /api/produtos/{id}/producao
    @PostMapping("/{id}/producao")
    public ResponseEntity<Void> registrarProducao(@PathVariable Long id, @RequestBody ProducaoRequestDTO request) {
        produtoService.registrarProducao(id, request.quantidade());
        return ResponseEntity.ok().build();
    }

    // 5 Passo: Endpoint para deletar o produto --/ DELETE /api/produtos/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        produtoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    // 6 Passo: Endpoint para reabastecer o estoque --/ POST
    // /api/produtos/{id}/reabastecer
    @PostMapping("/{id}/reabastecer")
    public ResponseEntity<Void> reabastecer(@PathVariable Long id, @RequestBody ProducaoRequestDTO request) {
        produtoService.reabastecer(id, request.quantidade());
        return ResponseEntity.ok().build();
    }

    // 7 Passo: Endpoint para buscar a receita --/ GET /api/produtos/{id}/receita
    @GetMapping("/{id}/ficha-tecnica")
    public ResponseEntity<List<ItemFichaTecnica>> getReceita(@PathVariable Long id) {
        return ResponseEntity.ok(produtoService.buscarReceita(id));
    }
}
