package com.matgourmand.store.controller;

import com.matgourmand.store.dto.StoreCreateRequest;
import com.matgourmand.store.dto.StoreResponse;
import com.matgourmand.store.dto.StoreStatusUpdateRequest;
import com.matgourmand.store.dto.StoreUpdateRequest;
import com.matgourmand.store.service.StoreService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stores")
public class StoreController {

    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    @PostMapping
    public ResponseEntity<StoreResponse> createStore(@Valid @RequestBody StoreCreateRequest request) {
        StoreResponse response = storeService.createStore(request);
        return ResponseEntity.created(URI.create("/api/stores/" + response.id())).body(response);
    }

    @GetMapping("/{storeId}")
    public ResponseEntity<StoreResponse> getStore(@PathVariable Long storeId) {
        return ResponseEntity.ok(storeService.getStore(storeId));
    }

    @GetMapping
    public ResponseEntity<List<StoreResponse>> getStores() {
        return ResponseEntity.ok(storeService.getStores());
    }

    @PutMapping("/{storeId}")
    public ResponseEntity<StoreResponse> updateStore(
            @PathVariable Long storeId,
            @Valid @RequestBody StoreUpdateRequest request
    ) {
        return ResponseEntity.ok(storeService.updateStore(storeId, request));
    }

    @PutMapping("/{storeId}/status")
    public ResponseEntity<StoreResponse> changeStoreStatus(
            @PathVariable Long storeId,
            @Valid @RequestBody StoreStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(storeService.changeStoreStatus(storeId, request));
    }

    @DeleteMapping("/{storeId}")
    public ResponseEntity<Void> deleteStore(@PathVariable Long storeId) {
        storeService.deleteStore(storeId);
        return ResponseEntity.noContent().build();
    }
}
