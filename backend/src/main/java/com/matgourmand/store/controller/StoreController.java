package com.matgourmand.store.controller;

import com.matgourmand.auth.AuthenticatedUser;
import com.matgourmand.auth.CurrentUser;
import com.matgourmand.common.response.ApiResponse;
import com.matgourmand.store.dto.StoreCreateRequest;
import com.matgourmand.store.dto.StoreResponse;
import com.matgourmand.store.dto.StoreStatusUpdateRequest;
import com.matgourmand.store.dto.StoreUpdateRequest;
import com.matgourmand.store.service.StoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Store", description = "Store management APIs")
public class StoreController {

    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    @PostMapping
    @Operation(summary = "Create store", description = "Create a store with the authenticated OWNER account")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<StoreResponse>> createStore(
            @CurrentUser AuthenticatedUser authenticatedUser,
            @Valid @RequestBody StoreCreateRequest request
    ) {
        StoreResponse response = storeService.createStore(authenticatedUser, request);
        return ResponseEntity.created(URI.create("/api/stores/" + response.id()))
                .body(ApiResponse.ok(response));
    }

    @GetMapping("/{storeId}")
    @Operation(summary = "Get store", description = "Retrieve a single store by ID")
    public ResponseEntity<ApiResponse<StoreResponse>> getStore(@PathVariable Long storeId) {
        return ResponseEntity.ok(ApiResponse.ok(storeService.getStore(storeId)));
    }

    @GetMapping
    @Operation(summary = "Get stores", description = "Retrieve all stores")
    public ResponseEntity<ApiResponse<List<StoreResponse>>> getStores() {
        return ResponseEntity.ok(ApiResponse.ok(storeService.getStores()));
    }

    @PutMapping("/{storeId}")
    @Operation(summary = "Update store", description = "Update a store owned by the authenticated OWNER")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<StoreResponse>> updateStore(
            @CurrentUser AuthenticatedUser authenticatedUser,
            @PathVariable Long storeId,
            @Valid @RequestBody StoreUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(storeService.updateStore(authenticatedUser, storeId, request)));
    }

    @PutMapping("/{storeId}/status")
    @Operation(summary = "Change store status", description = "Change the status of a store owned by the authenticated OWNER")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<StoreResponse>> changeStoreStatus(
            @CurrentUser AuthenticatedUser authenticatedUser,
            @PathVariable Long storeId,
            @Valid @RequestBody StoreStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                storeService.changeStoreStatus(authenticatedUser, storeId, request)
        ));
    }

    @DeleteMapping("/{storeId}")
    @Operation(summary = "Delete store", description = "Delete a store owned by the authenticated OWNER")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> deleteStore(
            @CurrentUser AuthenticatedUser authenticatedUser,
            @PathVariable Long storeId
    ) {
        storeService.deleteStore(authenticatedUser, storeId);
        return ResponseEntity.noContent().build();
    }
}
