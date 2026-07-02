package com.matgourmand.store.dto;

import com.matgourmand.store.domain.StoreStatus;
import jakarta.validation.constraints.NotNull;

public record StoreStatusUpdateRequest(
        @NotNull(message = "매장 상태는 필수입니다.")
        StoreStatus status
) {
}
