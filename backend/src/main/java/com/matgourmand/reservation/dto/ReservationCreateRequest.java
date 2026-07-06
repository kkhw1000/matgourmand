package com.matgourmand.reservation.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record ReservationCreateRequest(
        @NotNull(message = "storeId는 필수입니다.")
        Long storeId,
        @NotNull(message = "reservationTime은 필수입니다.")
        @Future(message = "reservationTime은 미래 시각이어야 합니다.")
        LocalDateTime reservationTime,
        @Min(value = 1, message = "partySize는 1 이상이어야 합니다.")
        int partySize,
        @Size(max = 500, message = "requestNote는 500자 이하여야 합니다.")
        String requestNote
) {
}
