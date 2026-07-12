package com.matgourmand.reservation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record ReservationCreateRequest(
        @Schema(example = "1")
        @NotNull(message = "storeId는 필수입니다.")
        Long storeId,
        @Schema(example = "2026-07-13T18:30:00")
        @NotNull(message = "reservationTime은 필수입니다.")
        @Future(message = "reservationTime은 미래 시각이어야 합니다.")
        LocalDateTime reservationTime,
        @Schema(example = "2")
        @Min(value = 1, message = "partySize는 1 이상이어야 합니다.")
        int partySize,
        @Schema(example = "창가 자리 가능하면 부탁드립니다.")
        @Size(max = 500, message = "requestNote는 500자 이하여야 합니다.")
        String requestNote
) {
}
