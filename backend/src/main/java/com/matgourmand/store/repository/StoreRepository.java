package com.matgourmand.store.repository;

import com.matgourmand.store.domain.Store;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreRepository extends JpaRepository<Store, Long> {

    @Override
    @EntityGraph(attributePaths = "owner")
    List<Store> findAll();
}
