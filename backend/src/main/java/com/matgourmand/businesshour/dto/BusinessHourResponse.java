package com.matgourmand.businesshour.dto;

import com.matgourmand.businesshour.domain.BusinessHour;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record BusinessHourResponse(
        Long id,
        Long storeId,
        DayOfWeek dayOfWeek,
        LocalTime openTime,
        LocalTime closeTime,
        boolean closed,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static BusinessHourResponse from(BusinessHour businessHour) {
        return new BusinessHourResponse(
                businessHour.getId(),
                businessHour.getStore().getId(),
                businessHour.getDayOfWeek(),
                businessHour.getOpenTime(),
                businessHour.getCloseTime(),
                businessHour.isClosed(),
                businessHour.getCreatedAt(),
                businessHour.getUpdatedAt()
        );
    }
}
