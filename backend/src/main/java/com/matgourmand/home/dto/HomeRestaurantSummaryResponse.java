package com.matgourmand.home.dto;

public record HomeRestaurantSummaryResponse(
        String id,
        String badge,
        String name,
        String summary,
        String area,
        String moodLabel,
        String priceRangeLabel,
        String availableSlotLabel,
        String thumbnailUrl
) {
}
