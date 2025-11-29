package com.forgepcp.repository;

import com.forgepcp.model.ItemFichaTecnica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemFichaTecnicaRepository extends JpaRepository<ItemFichaTecnica, Long> {

    List<ItemFichaTecnica> findByProdutoPaiId(Long produtoPaiId);

    void deleteByProdutoPaiId(Long produtoPaiId);

    void deleteByMaterialId(Long materialId);
}
