package com.matgourmand.store.dto;

import com.matgourmand.store.domain.Store;
import com.matgourmand.store.domain.StoreStatus;
import java.time.LocalDateTime;

public record StoreResponse(
        Long id,
        Long ownerId,
        String ownerName,
        String name,
        String address,
        String phone,
        String description,
        StoreStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static StoreResponse from(Store store) {
        return new StoreResponse(
                store.getId(),
                store.getOwner().getId(),
                store.getOwner().getName(),
                store.getName(),
                store.getAddress(),
                store.getPhone(),
                store.getDescription(),
                store.getStatus(),
                store.getCreatedAt(),
                store.getUpdatedAt()
        );
    }
}
