package com.forgepcp.controller;

import com.forgepcp.model.HistoricoProducao;
import com.forgepcp.service.ProdutoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historico")
@CrossOrigin(origins = "*")
public class HistoricoController {

    private final ProdutoService service;

    public HistoricoController(ProdutoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<HistoricoProducao>> listar() {
        return ResponseEntity.ok(service.listarHistorico());
    }
}
