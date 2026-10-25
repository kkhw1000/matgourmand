package com.matgourmand.store.dto;

import jakarta.validation.constraints.NotBlank;

public record StoreUpdateRequest(
        @NotBlank(message = "매장 이름은 필수입니다.")
        String name,
        @NotBlank(message = "주소는 필수입니다.")
        String address,
        String phone,
        String description,
        String region,
        String theme,
        Integer averagePrice,
        Integer capacityPerSlot
) {
    public StoreUpdateRequest(String name, String address, String phone, String description) {
        this(name, address, phone, description, null, null, null, null);
    }
}
