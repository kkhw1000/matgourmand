package com.matgourmand.businesshour.dto;

import java.time.LocalTime;

public record BusinessHourUpsertRequest(
        LocalTime openTime,
        LocalTime closeTime,
        boolean closed
) {
}
