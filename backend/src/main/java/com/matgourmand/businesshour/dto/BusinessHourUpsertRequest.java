package com.matgourmand.businesshour.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalTime;

public record BusinessHourUpsertRequest(
        @Schema(example = "12:00:00")
        LocalTime openTime,
        @Schema(example = "22:00:00")
        LocalTime closeTime,
        @Schema(example = "false")
        boolean closed
) {
}
