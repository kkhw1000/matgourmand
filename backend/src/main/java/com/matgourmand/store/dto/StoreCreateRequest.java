package com.matgourmand.store.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record StoreCreateRequest(
        @NotNull(message = "ownerId는 필수입니다.")
        Long ownerId,
        @NotBlank(message = "매장 이름은 필수입니다.")
        String name,
        @NotBlank(message = "주소는 필수입니다.")
        String address,
        String phone,
        String description
) {
}
